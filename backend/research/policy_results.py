"""Conservative consolidation: no semantic guesses or stance-changing rewrites."""
import re

from policy_taxonomy import CATEGORIES
from schemas import GroupedFinding, PolicyEvidence


def normalized(text):
    return ' '.join(text.casefold().split()).rstrip('.')


def attribution_supported(finding, candidate: str, chunk: str, full_text: str, chunk_offset: int = 0) -> bool:
    if finding.attributed_candidate and normalized(finding.attributed_candidate) != normalized(candidate):
        return False
    quote = finding.supporting_quote
    # Explicit candidate headings delimit ownership even when excerpts span candidates.
    headings = list(re.finditer(r'(?im)^\s*(?:candidate|candidate name)\s*:\s*([^\n]+)', full_text))
    occurrences = [chunk_offset + m.start() for m in re.finditer(re.escape(quote), chunk)]
    if headings:
        for position in occurrences:
            prior = [h for h in headings if h.start() <= position]
            if prior and normalized(prior[-1].group(1)) == normalized(candidate):
                return True
        return False
    # Reject explicit speech/stance attribution to another named person in the quote.
    speakers = re.findall(r'\b([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:said|says|supports|opposes|proposes|would|believes)\b', quote)
    institutions = {'senate', 'house', 'congress', 'government', 'court', 'commission', 'department'}
    if any(normalized(name) != normalized(candidate) and not (set(name.lower().split()) & institutions) for name in speakers):
        return False
    return True


def group_findings(sources):
    groups = {category: [] for category in CATEGORIES}
    index = {}
    for source in sources:
        for finding in source.findings:
            # Require matching issue AND complete summary. Similar topics alone never merge.
            key = (finding.category, normalized(finding.policy_issue), normalized(finding.neutral_summary),
                   normalized(finding.supporting_quote))
            position = source.retrieved_text.find(finding.supporting_quote)
            evidence = PolicyEvidence(source_url=finding.source_url, collected_at=finding.collected_at,
                supporting_quote=finding.supporting_quote,
                context=source.retrieved_text[max(0, position - 250):position + len(finding.supporting_quote) + 250],
                policy_issue=finding.policy_issue, neutral_summary=finding.neutral_summary)
            if key not in index:
                item = GroupedFinding(category=finding.category, policy_issue=finding.policy_issue,
                                      neutral_summary=finding.neutral_summary, evidence=[])
                groups[finding.category].append(item)
                index[key] = item
            item = index[key]
            if evidence not in item.evidence:
                item.evidence.append(evidence)
    return groups
