"""Small Brave search adapter and deterministic, conservative selection."""
import ipaddress
import re
import logging
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import httpx

logger = logging.getLogger('candidate_research')


class DiscoveryPlan(list):
    """Ranked URLs plus search metadata; still usable by existing list callers."""
    def __init__(self, urls, metadata, limit):
        super().__init__(urls)
        self.metadata = metadata
        self.limit = limit


def name_matches(text: str, candidate: str) -> bool:
    words = re.findall(r'[a-z0-9]+', text.lower())
    name = re.findall(r'[a-z0-9]+', candidate.lower())
    direct = bool(name) and any(words[i:i + len(name)] == name for i in range(len(words)))
    reversed_record = len(name) == 2 and re.search(r'\b' + re.escape(name[1]) + r',\s*' + re.escape(name[0]) + r'\b', text.lower())
    return bool(direct or reversed_record)


def office_matches(text: str, office: str) -> bool:
    text = re.sub(r'\bu\s*\.?\s*s\b\.?', 'united states', text.lower())
    role = office.lower()
    if 'senat' in role and any(term in role for term in ('united states', 'u.s.', 'us ', 'federal')):
        return bool(re.search(r'\b(?:united states|federal)\s+senat|\bsenat\w*\s+(?:of|in|for)\s+(?:the\s+)?united states', text))
    if 'senat' in role and any(term in role for term in ('state', 'florida')):
        return bool(re.search(r'\b(?:state|florida)\s+senat', text))
    required = tokens(role) - {'of', 'the', 'for', 'a', 'florida', 'fl', 'district'}
    return bool(required and required <= tokens(text))


def election_record(url: str) -> bool:
    host = (urlsplit(url).hostname or '').lower()
    return host == 'fec.gov' or host.endswith('.fec.gov') or (
        host.endswith('.gov') and any(word in url.lower() for word in ('election', 'candidate', 'qualif')))


def official_candidate_page(url: str, candidate: str, text: str = '') -> bool:
    """Candidate-bound official pages, not generic congressional search/roster pages."""
    parts = urlsplit(url)
    host = (parts.hostname or '').removeprefix('www.')
    surname = re.findall(r'[a-z0-9]+', candidate.lower())[-1]
    if host in {surname + '.senate.gov', surname + '.house.gov'}:
        return True
    path = parts.path.lower().replace('-', ' ')
    if host == 'congress.gov' and '/member/' in parts.path and name_matches(path, candidate):
        return True
    if host == 'congress.gov' and '/bill/' in parts.path:
        return any(name_matches(text[m.start():m.end()+150], candidate) for m in re.finditer(r'\b(?:sponsor|sponsored|cosponsor)\b', text, re.I))
    return False


def search_queries(candidate: str, office: str, context: str) -> list[str]:
    year = re.search(r'\b20\d{2}\b', context)
    election = f'Florida {year.group() if year else context}'
    alias = 'U.S. Senate' if office_matches('United States Senate', office) else office
    return [f'"{candidate}" {office} {election} official campaign',
            f'"{candidate}" {alias} {election} policy positions issues',
            f'"{candidate}" {election} candidate questionnaire voter guide',
            f'"{candidate}" {alias} {election} interview policies',
            f'"{candidate}" {office} {election} site:fec.gov candidate',
            f'"{candidate}" {office} {election} site:dos.fl.gov elections candidate',
            f'"{candidate}" official biography site:senate.gov OR site:house.gov',
            f'"{candidate}" biography legislative record site:congress.gov']


def tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", text.lower()))


def campaign_domain(url: str, candidate: str) -> str | None:
    """Only exact personal campaign hosts; never arbitrary publisher domains/subdomains."""
    host = (urlsplit(url).hostname or '').removeprefix('www.')
    name = ''.join(re.findall(r'[a-z0-9]+', candidate.lower()))
    return host if host in {name + '.com', name + '.org', name + '.net'} else None


def identity_matches(text: str, candidate: str, office: str) -> bool:
    return name_matches(text, candidate) and office_matches(text, office)


def canonical_url(url: str) -> str | None:
    try:
        parts = urlsplit(url)
        host = (parts.hostname or "").lower()
        if parts.scheme not in ("http", "https") or not host or parts.username or parts.password:
            return None
        if host == "localhost" or "." not in host or host.endswith((".local", ".internal")):
            return None
        try:
            if not ipaddress.ip_address(host).is_global:
                return None
        except ValueError:
            pass
        query = [(k, v) for k, v in parse_qsl(parts.query) if not k.lower().startswith("utm_") and k.lower() not in {"fbclid", "gclid"}]
        return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path.rstrip("/") or "/", urlencode(sorted(query)), ""))
    except ValueError:
        return None


def select_sources(results: list[dict], candidate: str, office: str, limit: int = 5, context: str = '') -> list[str]:
    ranked = {}
    for item in results:
        url = canonical_url(item.get("url", ""))
        description = f"{item.get('title', '')} {item.get('description', '')}"
        if not url:
            logger.info('rejected URL: invalid, credential-bearing, or non-public address')
            continue
        logger.info('discovered URL %s', url.split('?')[0])
        if not name_matches(description, candidate):
            logger.info('rejected URL %s: candidate name mismatch', url.split('?')[0])
            continue
        host = urlsplit(url).hostname.removeprefix("www.")
        if host in {"facebook.com", "instagram.com", "youtube.com", "x.com", "twitter.com", "tiktok.com"}:
            logger.info('rejected URL %s: social platform', url.split('?')[0])
            continue
        words = tokens(description + " " + url)
        official = official_candidate_page(url, candidate, description)
        score = 12 * len(words & {"policy", "policies", "issues", "platform", "interview", "questionnaire"})
        if not office_matches(description, office) and not (words & {'policy', 'policies', 'issues', 'platform', 'interview', 'questionnaire', 'guide', 'campaign', 'biography', 'healthcare', 'abortion', 'firearms', 'immigration', 'legislation', 'bill', 'voting'} or election_record(url) or official):
            logger.info('rejected URL %s: no office or policy relevance', url.split('?')[0])
            continue
        if office_matches(description, office):
            score += 8
        if election_record(url):
            years = set(re.findall(r'\b20\d{2}\b', description + ' ' + url))
            wanted = set(re.findall(r'\b20\d{2}\b', context))
            if wanted and years and not (years & wanted):
                logger.info('rejected URL %s: historical election record', url.split('?')[0])
                continue
            score += 20
        if official:
            score += 50
        if host == 'wikipedia.org' or host.endswith('.wikipedia.org'):
            score -= 60
        if {'voter', 'guide'} <= words or {'voters', 'guide'} <= words:
            score += 20
        if words & {'fundraising', 'finance', 'endorsement', 'scandal', 'reelection'}:
            score -= 12
        if '/video/' in url:
            score -= 20
        if campaign_domain(url, candidate):
            score += 15
            # Include an identity-bearing homepage before abbreviated policy pages.
            root = urlunsplit((urlsplit(url).scheme, urlsplit(url).netloc, '/', '', ''))
            ranked[root] = max(score + 1, ranked.get(root, -1))
        if host.endswith(".gov"):
            score += 5
        if host in {"apnews.com", "reuters.com", "wusf.org", "wlrn.org", "floridaphoenix.com", "tampabay.com"}:
            score += 4
        if "official" in words and words & {"campaign", "candidate"}:
            score += 3
        ranked[url] = max(score, ranked.get(url, -1))
    selected, counts, records = [], {}, 0
    for url in sorted(ranked, key=lambda u: (-ranked[u], u)):
        host = urlsplit(url).hostname.removeprefix("www.")
        if counts.get(host, 0) >= 2:
            logger.info('rejected URL %s: domain limit', url.split('?')[0])
            continue
        if election_record(url) and records >= 2:
            logger.info('rejected URL %s: election-record budget', url.split('?')[0])
            continue
        selected.append(url)
        counts[host] = counts.get(host, 0) + 1
        records += int(election_record(url))
        if len(selected) >= limit:
            break
    return selected


def discover_sources(client: httpx.Client, api_key: str, candidate: str, office: str,
                     context: str, limit: int = 5, queries=None) -> tuple[list[str], list[str]]:
    if not api_key:
        raise ValueError("BRAVE_SEARCH_API_KEY is required for automatic discovery")
    results, errors = [], []
    for query in (search_queries(candidate, office, context) if queries is None else queries):
        try:
            response = client.get("https://api.search.brave.com/res/v1/web/search",
                                  headers={"X-Subscription-Token": api_key},
                                  params={"q": query, "count": 15, "country": "US"})
            response.raise_for_status()
            results.extend(response.json().get("web", {}).get("results", []))
        except (httpx.HTTPError, ValueError, TypeError, AttributeError):
            errors.append("Brave search request failed; check credentials, quota, and connectivity")
    # Keep a bounded reserve so inaccessible top-ranked pages can be replaced.
    urls = select_sources(results, candidate, office, max(limit * 2, 10), context)
    if len(urls) < 3:
        errors.append("Fewer than three identity-matched sources found; no unrelated sources added")
    metadata = {}
    for item in results:
        url = canonical_url(item.get('url', ''))
        if url:
            metadata.setdefault(url, []).append(f"{item.get('title', '')} {item.get('description', '')}")
    plan = DiscoveryPlan(urls, metadata, limit)
    plan.context = context
    return plan, errors
