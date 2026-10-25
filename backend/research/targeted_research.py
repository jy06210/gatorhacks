"""One bounded follow-up pass for gaps, persisted with the internal profile."""
from policy_taxonomy import CATEGORIES, TAXONOMY
from policy_results import group_findings
from source_discovery import discover_sources, DiscoveryPlan, canonical_url


def needs_gap_research(profile):
    attempted = profile.profile.diagnostics.get('targeted_research', {}).get('attempts', {})
    if profile.profile.biography.summary is None and 'biography' not in attempted and profile.profile.diagnostics.get('biography',{}).get('status') in ('insufficient_evidence','insufficient_corroboration'):
        return True
    return any(category not in attempted and profile.profile.issues[category].summary is None and
               profile.profile.diagnostics.get(category,{}).get('status') == 'insufficient_evidence' for category in CATEGORIES)


def fill_evidence_gaps(profile, web, model_client, api_key, research_fn, synthesize_fn, progress=None, max_queries=3):
    if not api_key or isinstance(getattr(model_client, 'blocked', None), dict) and model_client.blocked:
        return
    history = profile.profile.diagnostics.setdefault('targeted_research', {'attempts':{}})
    attempts = history['attempts']
    targets = []
    if profile.profile.biography.summary is None and profile.profile.diagnostics.get('biography', {}).get('status') in ('insufficient_evidence','insufficient_corroboration') and 'biography' not in attempts:
        targets.append(('biography', f'"{profile.candidate_name}" biography education previous office site:senate.gov OR site:house.gov OR site:congress.gov'))
    for category in CATEGORIES:
        if category in attempts or profile.profile.issues[category].summary is not None:
            continue
        if profile.profile.diagnostics.get(category, {}).get('status') != 'insufficient_evidence':
            continue # Fix extraction/API/verification errors instead of disguising them as search gaps.
        terms = ' '.join(TAXONOMY['categories'][category][:3])
        targets.append((category, f'"{profile.candidate_name}" {terms} position legislation interview'))
    seen = {canonical_url(str(s.source_url)) for s in profile.sources}
    added = False
    for target, query in targets[:max_queries]:
        attempts[target] = {'query':query, 'status':'started'}
        if progress:
            progress(profile)
        urls, errors = discover_sources(web, api_key, profile.candidate_name, profile.office, profile.election_context,
                                        limit=2, queries=[query])
        fresh = [url for url in urls if canonical_url(url) not in seen][:3]
        attempts[target].update(status='no_new_sources' if not fresh else 'researched', limitations=errors, urls=fresh)
        if fresh:
            plan = DiscoveryPlan(fresh, getattr(urls,'metadata',{}), 2)
            plan.context = profile.election_context
            extra = research_fn(profile.candidate_name, profile.office, plan, web, model_client, check_identity=True)
            profile.sources.extend(extra.sources)
            seen.update(canonical_url(url) for url in fresh)
            added = True
        if progress:
            progress(profile)
    if added:
        profile.policy_categories = group_findings(profile.sources)
        synthesize_fn(profile, model_client) # fingerprint caches reuse all unchanged successful sections
        profile.profile.diagnostics['targeted_research'] = history
    if progress:
        progress(profile)
