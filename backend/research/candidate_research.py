"""Research one Florida candidate from two or three supplied public URLs."""
import argparse
import os
from pathlib import Path
import re
import logging
from time import perf_counter
from urllib.parse import urlsplit

import httpx
from pydantic import HttpUrl, TypeAdapter

from ollama_client import OllamaClient
from schemas import CandidateProfile, SourceResult, SourcedFinding
from web_fetcher import fetch_source
from source_discovery import discover_sources, identity_matches, name_matches, election_record, canonical_url
from research_cache import cache_path, read_cache, write_cache
from text_chunks import split_chunks
from diagnostics import safe_error
from source_discovery import campaign_domain, official_candidate_page
from policy_results import attribution_supported, group_findings
from profile_synthesis import attach_profile, resynthesize_file, SYNTHESIS_VERSION, save_clean_profile
from llm_runtime import DEFAULT_MODEL, JsonCache, atomic_json, model_settings, fingerprint
from source_discovery import DiscoveryPlan
from targeted_research import fill_evidence_gaps, needs_gap_research

logger = logging.getLogger("candidate_research")

DEFAULT_OUTPUT = Path(__file__).resolve().parents[1] / "data/research/candidate_profiles"


def research(candidate: str, office: str, urls: list[str], web: httpx.Client,
             ollama, check_identity: bool = False, resume=None, on_progress=None) -> CandidateProfile:
    sources = []
    page_details = (resume or {}).get('page_details', {})
    saved_sources = {s['source_url']:s for s in (resume or {}).get('sources', [])}
    def checkpoint():
        if on_progress:
            on_progress(dict(sources=[s.model_dump(mode='json') for s in sources], page_details=page_details))
    metadata = getattr(urls, 'metadata', {})
    page_limit = getattr(urls, 'limit', len(urls))
    for url in urls:
        started = perf_counter()
        details = {}
        source = SourceResult.model_validate(saved_sources[url]) if url in saved_sources else fetch_source(url, web, details)
        if details:
            page_details[str(source.source_url)] = details
        logger.info("fetch %.2fs", perf_counter() - started)
        if source.status == 'source_unavailable':
            source.research_diagnostics['status'] = 'inaccessible_source' if 'HTTP' in (source.error or '') or 'Timeout' in (source.error or '') else 'page_extraction_failure'
            logger.info('rejected URL %s: %s; continuing to reserve sources', str(source.source_url).split('?')[0], source.error)
        sources.append(source)
        checkpoint()
    verified_domains = set()
    corroborated = False
    record_urls = []
    for source in sources:
        final = str(source.final_url or source.source_url)
        if source.status == 'source_unavailable' or not election_record(final):
            continue
        # Bind name and office locally in a candidate record, not across a long roster.
        text = source.retrieved_text
        name_pattern = r'\b' + r'\W+'.join(re.escape(part) for part in candidate.split()) + r'\b'
        parts = candidate.split()
        if len(parts) == 2:
            name_pattern += r'|\b' + re.escape(parts[1]) + r',\s*' + re.escape(parts[0]) + r'\b'
        windows = [text[max(0, match.start() - 100):match.end() + 300] for match in re.finditer(name_pattern, text, re.I)]
        context = getattr(urls, 'context', '')
        year = re.search(r'\b20\d{2}\b', context)
        fec_record = (urlsplit(final).hostname or '').removeprefix('www.') == 'fec.gov'
        def record_identity(window):
            # FEC records are federal; their office field often says simply "Senate".
            federal_senate = fec_record and 'senat' in office.lower() and any(term in office.lower() for term in ('united states', 'u.s.', 'us ', 'federal'))
            return identity_matches(window, candidate, office) or (federal_senate and name_matches(window, candidate) and re.search(r'\bsenat(?:e|or)\b', window, re.I) and not re.search(r'\bstate\s+senat', window, re.I))
        matched = any(record_identity(window) and
                      ('florida' in window.lower() or re.search(r'\bFL\b', window)) and
                      (year is None or year.group() in window) for window in windows)
        if not matched:
            logger.info('rejected identity record %s: name/office/state/year not locally confirmed', final.split('?')[0])
            continue
        corroborated = True
        record_urls.append(str(source.source_url))
        details = page_details.get(str(source.source_url), {})
        for link, preceding, label in details.get('links', []):
            # Official links must be labeled campaign/website and in this candidate's record.
            if canonical_url(link) and identity_matches(preceding, candidate, office) and any(word in label.lower() for word in ('campaign', 'website')):
                verified_domains.add((urlsplit(link).hostname or '').removeprefix('www.'))
        logger.info('identity corroborated by election record %s', final.split('?')[0])
    for source in sources:
        details = page_details.get(str(source.source_url), {})
        identity_text = details.get('title', '') + ' ' + source.retrieved_text
        if source.status != 'source_unavailable' and (identity_matches(identity_text, candidate, office) or
                (corroborated and name_matches(identity_text, candidate))):
            host = campaign_domain(str(source.final_url or source.source_url), candidate)
            if host and (corroborated or any(word in identity_text.lower() for word in ('campaign', 'running', 'for governor', 'for senate', 'vote', 'elect'))):
                verified_domains.add(host)
    analyzed_pages = 0
    work = []
    for source in sources:
        if source.status == "source_unavailable":
            continue
        if check_identity and election_record(str(source.final_url or source.source_url)):
            source.error = 'Election record used for identity corroboration only' if str(source.source_url) in record_urls else 'Election record did not corroborate requested identity'
            continue
        host = (urlsplit(str(source.final_url or source.source_url)).hostname or '').removeprefix('www.')
        details = page_details.get(str(source.source_url), {})
        identity_text = details.get('title', '') + ' ' + source.retrieved_text
        search_text = ' '.join(metadata.get(canonical_url(str(source.source_url)), []))
        supported_identity = identity_matches(identity_text, candidate, office) or host in verified_domains or (
            official_candidate_page(str(source.final_url or source.source_url), candidate, identity_text) and name_matches(identity_text, candidate)) or (
            corroborated and name_matches(identity_text, candidate) and identity_matches(search_text, candidate, office))
        if check_identity and not supported_identity:
            source.research_diagnostics['status'] = 'identity_rejected'
            source.error = "Candidate name and office not both confirmed in retrieved text"
            logger.info('rejected URL %s: identity not corroborated', str(source.source_url).split('?')[0])
            continue
        source.identity_verified = supported_identity or not check_identity
        if analyzed_pages >= page_limit:
            source.research_diagnostics['status'] = 'page_budget_reached'
            source.error = 'Reserve source not analyzed: page budget reached'
            logger.info('rejected URL %s: page budget reached', str(source.source_url).split('?')[0])
            continue
        analyzed_pages += 1
        source.research_diagnostics.pop('status', None)
        chunks, source.input_truncated = split_chunks(source.retrieved_text, ollama)
        source.analyzed_text = ''.join(chunks)
        work.append((source,chunks))
    from llm_batches import batch_enabled
    batch_outputs = {}
    if batch_enabled(ollama):
        documents = [dict(source_id=f'{i}:{j}',url=str(source.source_url),text=chunk)
                     for i,(source,chunks) in enumerate(work) for j,chunk in enumerate(chunks) if j not in source.completed_chunks]
        if documents:
            try:
                batch_outputs = {d.source_id:d for d in ollama.analyze_documents(candidate,office,documents)}
            except (ValueError, httpx.HTTPError) as exc:
                batch_outputs = {d['source_id']:exc for d in documents}
    for source_i, (source,chunks) in enumerate(work):
        errors, seen = [], {(f.category, f.policy_issue.casefold(), f.neutral_summary, f.supporting_quote) for f in source.findings}
        source.error = None
        for index, chunk in enumerate(chunks):
            if index in source.completed_chunks:
                continue
            started = perf_counter()
            try:
                if batch_enabled(ollama):
                    proposed = batch_outputs[f'{source_i}:{index}']
                    if isinstance(proposed,Exception):
                        raise proposed
                    if ollama.models['biography'] == ollama.models['extraction']:
                        if source.biography_extractions is None:
                            source.biography_extractions=[]
                        source.biography_extractions.extend(f.model_dump() for f in proposed.biography)
                else:
                    proposed = ollama.analyze(candidate, office, chunk)
                for finding in proposed.findings:
                    audit = {'chunk': index + 1, 'finding': finding.model_dump(), 'accepted': False, 'rejection_reason': None}
                    source.raw_findings.append(audit)
                    if finding.supporting_quote not in chunk or not attribution_supported(finding, candidate, chunk, source.retrieved_text, sum(len(c) for c in chunks[:index])):
                        audit['rejection_reason'] = 'Quote absent from chunk or candidate attribution unsupported'
                        source.rejected_findings += 1
                        continue
                    audit['accepted'] = True
                    signature = (finding.category, finding.policy_issue.casefold(), finding.neutral_summary, finding.supporting_quote)
                    if signature in seen:
                        continue
                    seen.add(signature)
                    source.findings.append(SourcedFinding(
                        **finding.model_dump(), source_url=source.source_url,
                        collected_at=source.collected_at))
                source.completed_chunks.append(index)
            except (httpx.HTTPError, ValueError, KeyError, TypeError) as exc:
                detail = safe_error(exc)
                errors.append(f'chunk {index + 1}: {detail}')
                logger.warning('analysis chunk=%d elapsed=%.2fs %s', index + 1, perf_counter() - started, detail)
            finally:
                logger.info("inference chunk=%d/%d %.2fs", index + 1, len(chunks), perf_counter() - started)
                checkpoint()
        if errors:
            source.research_diagnostics['status'] = 'model_extraction_failure'
            source.error = '; '.join(errors)
        elif source.findings and not source.rejected_findings and not source.input_truncated:
            source.status = 'ok'
        else:
            source.error = 'Chunk limit reached, no supported findings, or unsupported quotes rejected'
        source.research_diagnostics.setdefault('status', 'accepted_findings' if source.findings else 'no_supported_findings')
    status = "partial"
    if all(s.status == "source_unavailable" for s in sources):
        status = "source_unavailable"
    elif all(s.status == "ok" for s in sources):
        status = "ok"
    limitations = []
    if check_identity:
        limitations.append('Identity corroborated by election records: ' + ', '.join(record_urls) if record_urls else
                           'No accessible election record confirmed candidate, office, state, and election year')
    return CandidateProfile(candidate_name=candidate, office=office, status=status, sources=sources,
                            limitations=limitations, policy_categories=group_findings(sources))


def main() -> None:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[2] / ".env")
    logging.basicConfig(level=logging.WARNING, format="%(message)s")
    logger.setLevel(logging.INFO)
    started = perf_counter()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--candidate")
    parser.add_argument("--office")
    parser.add_argument("--resynthesize", type=Path, help="Generate profile from saved research; no web research")
    parser.add_argument("--urls", nargs="+")
    parser.add_argument("--provider", choices=["ollama", "gemma-api", "google-api"], default="ollama")
    parser.add_argument("--model", default=os.getenv('LLM_MODEL') or os.getenv("GEMMA_MODEL", DEFAULT_MODEL))
    parser.add_argument('--extraction-model')
    parser.add_argument('--synthesis-model')
    parser.add_argument('--verification-model')
    parser.add_argument('--list-models', action='store_true', help='List project-visible Google generation models')
    parser.add_argument("--election-context", default="Florida 2026 general election")
    parser.add_argument("--max-sources", type=int, choices=[3, 4, 5], default=5)
    parser.add_argument("--cache-hours", type=float, default=24)
    parser.add_argument("--refresh", action="store_true")
    parser.add_argument("--ollama-endpoint", default=os.getenv("OLLAMA_HOST", "http://localhost:11434"))
    parser.add_argument("--context-window", type=int, default=4096)
    parser.add_argument("--max-input-chars", type=int, default=None)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    if args.max_input_chars is None:
        extraction_model=args.extraction_model or os.getenv('EXTRACTION_MODEL') or args.model
        args.max_input_chars = 2_000_000 if args.provider!='ollama' and extraction_model.removeprefix('models/').startswith('gemini-') else 4000
    for name in ('extraction', 'synthesis', 'verification'):
        value = getattr(args, name + '_model')
        if value:
            os.environ[name.upper() + '_MODEL'] = value
    models = model_settings(args.model)
    if args.list_models:
        from gemma_api_client import GemmaAPIClient
        hosted = GemmaAPIClient(os.getenv('GEMINI_API_KEY', ''), args.model)
        try:
            for name in hosted.available_models():
                print(name)
        finally:
            hosted.close()
        return
    if args.resynthesize:
        from gemma_api_client import GemmaAPIClient
        try:
            hosted = GemmaAPIClient(os.getenv('GEMINI_API_KEY', ''), args.model)
            try:
                output = resynthesize_file(args.resynthesize, hosted)
            finally:
                hosted.close()
        except (ValueError, OSError) as exc:
            parser.error(str(exc))
        print(f'profile: {output}')
        logger.info('total %.2fs', perf_counter() - started)
        return
    if not args.candidate or not args.office:
        parser.error('--candidate and --office are required unless --resynthesize is used')
    if args.urls and (not 2 <= len(args.urls) <= 5 or len(set(args.urls)) != len(args.urls)):
        parser.error("Supply 2-5 distinct public webpage URLs")
    if args.cache_hours < 0:
        parser.error("Cache hours must be nonnegative")
    try:
        for url in args.urls or []:
            TypeAdapter(HttpUrl).validate_python(url)
        if not args.candidate.strip() or not args.office.strip() or max(len(args.candidate), len(args.office)) > 200:
            raise ValueError("Candidate and office must each contain 1–200 characters")
        key = cache_path(args.output_dir / ".cache", args.candidate, args.office, args.election_context,
                         provider=args.provider, model=models['extraction'] if args.provider != "ollama" else "gemma3:4b",
                         urls=args.urls, max_sources=args.max_sources, context_window=args.context_window,
                         input_limit=args.max_input_chars, endpoint=args.ollama_endpoint)
        cached = None if args.refresh else read_cache(key, args.cache_hours)
        if cached:
            previous_models = cached.profile.diagnostics.get('runtime',{}).get('models',{})
            incomplete = not all(category in cached.profile.diagnostics for category in cached.profile.issues)
            unavailable = any(d.get('status') == 'api_failure' for d in cached.profile.diagnostics.values())
            if cached.profile.synthesis_version < SYNTHESIS_VERSION or incomplete or unavailable or (previous_models and previous_models != models):
                attach_profile(cached, model=args.model)
                write_cache(key, cached)
            if args.urls is None and needs_gap_research(cached) and os.getenv('BRAVE_SEARCH_API_KEY'):
                with httpx.Client(timeout=25) as web, httpx.Client(timeout=600) as local:
                    if args.provider != 'ollama':
                        from gemma_api_client import GemmaAPIClient
                        client = GemmaAPIClient(os.getenv('GEMINI_API_KEY',''),args.model,args.max_input_chars)
                    else:
                        client = OllamaClient(local,args.ollama_endpoint,args.context_window,args.max_input_chars)
                    try:
                        fill_evidence_gaps(cached,web,client,os.environ['BRAVE_SEARCH_API_KEY'],research,
                            lambda p,c: attach_profile(p,c if args.provider!='ollama' else None,args.model),
                            progress=lambda p:write_cache(key,p))
                    finally:
                        if args.provider != 'ollama':
                            client.close()
            slug = re.sub(r'[^a-z0-9]+', '_', cached.candidate_name.lower()).strip('_') or 'candidate'
            clean = args.output_dir / f"{slug}_{cached.collected_at.strftime('%Y%m%dT%H%M%S%fZ')}_profile.json"
            save_clean_profile(cached, clean)
            print(f"{cached.status} (cache hit): {clean}")
            logger.info("total %.2fs", perf_counter() - started)
            return
        state_cache = JsonCache(args.output_dir / '.cache/recovery', args.cache_hours)
        recovery_key = key.stem
        state = None if args.refresh else state_cache.get(recovery_key)
        state = state or {}
        with httpx.Client(timeout=25, headers={"User-Agent": "CandidateResearch/1.0"}) as web, \
                httpx.Client(timeout=httpx.Timeout(600, connect=10)) as local:
            if args.provider != "ollama":
                from gemma_api_client import GemmaAPIClient
                model_client = GemmaAPIClient(os.getenv("GEMINI_API_KEY", ""), args.model, args.max_input_chars)
                model_client.namespace = fingerprint([args.candidate, args.office, args.election_context])
            else:
                model_client = OllamaClient(local, args.ollama_endpoint, args.context_window, args.max_input_chars)
            try:
                limitations = []
                urls = args.urls
                if state.get('discovery') and urls is None:
                    d = state['discovery']
                    urls = DiscoveryPlan(d['urls'],d['metadata'],d['limit'])
                    urls.context = args.election_context
                    limitations = d['limitations']
                    logger.info('discovery cache hit (recovery)')
                elif urls is None:
                    search_started = perf_counter()
                    urls, limitations = discover_sources(web, os.getenv("BRAVE_SEARCH_API_KEY", ""),
                        args.candidate, args.office, args.election_context, args.max_sources)
                    logger.info("search %.2fs", perf_counter() - search_started)
                    state['discovery'] = dict(urls=list(urls), metadata=getattr(urls,'metadata',{}), limit=args.max_sources, limitations=limitations)
                    state_cache.put(recovery_key,state)
                def save_progress(progress):
                    state['research'] = progress
                    state_cache.put(recovery_key,state)
                research_started = perf_counter()
                profile = research(args.candidate, args.office, urls, web, model_client, check_identity=args.urls is None,
                                   resume=state.get('research'), on_progress=save_progress)
                research_seconds = perf_counter()-research_started
                logger.info('research %.2fs', research_seconds)
                profile.election_context = args.election_context
                profile.provider = args.provider
                profile.model = models['extraction'] if args.provider != "ollama" else "gemma3:4b"
                profile.limitations.extend(limitations)
                if limitations and profile.status == "ok":
                    profile.status = "partial"
                write_cache(key, profile) # raw research survives synthesis failures/interruption
                def save_synthesis(partial):
                    profile.profile = partial
                    write_cache(key, profile)
                attach_profile(profile, model_client if args.provider != 'ollama' else None, args.model, on_progress=save_synthesis)
                if args.urls is None:
                    fill_evidence_gaps(profile, web, model_client, os.getenv('BRAVE_SEARCH_API_KEY',''), research,
                        lambda p,c: attach_profile(p, c if args.provider != 'ollama' else None, args.model),
                        progress=lambda p: write_cache(key,p))
                profile.profile.diagnostics.setdefault('runtime', {})['research_seconds'] = round(research_seconds,3)
                profile.profile.diagnostics['runtime']['total_seconds'] = round(perf_counter()-started,3)
            finally:
                if args.provider != "ollama":
                    model_client.close()
    except ValueError as exc:
        parser.error(str(exc))
    slug = re.sub(r"[^a-z0-9]+", "_", args.candidate.lower()).strip("_") or "candidate"
    args.output_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{slug}_{profile.collected_at.strftime('%Y%m%dT%H%M%S%fZ')}"
    output = args.output_dir / f'{stem}_profile.json'
    atomic_json(args.output_dir / '.cache/profile_research' / f'{stem}.json', profile.model_dump(mode='json'))
    save_clean_profile(profile, output)
    write_cache(key, profile)
    print(f"{profile.status}: {output}")
    logger.info("total %.2fs", perf_counter() - started)


if __name__ == "__main__":
    main()
