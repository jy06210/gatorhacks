"""Shared JSON labels are consumable by both Python and the frontend."""
import json
from pathlib import Path
import re

TAXONOMY = json.loads((Path(__file__).resolve().parents[1] / 'data/policy_taxonomy.json').read_text(encoding='utf-8'))
CATEGORIES = tuple(TAXONOMY['categories'])


def map_category(issue: str) -> str:
    """Legacy-label fallback; new model responses explicitly choose a category."""
    matches = []
    for category, terms in TAXONOMY['categories'].items():
        for term in terms:
            if re.search(r'\b' + re.escape(term) + r'\w*\b', issue.lower()):
                matches.append((len(term), category))
    return max(matches, default=(0, 'Local Issues'))[1]


def taxonomy_prompt(candidate: str) -> str:
    return (' Choose exactly one category from ' + json.dumps(CATEGORIES) +
            '. Keep policy_issue as the specific issue (e.g. Property insurance under Economy). '
            'Add category and attributed_candidate to each finding. attributed_candidate must '
            'name the person whose position the quote describes. In multi-candidate guides use '
            'only the requested candidate\'s section; never use opponents\' answers, the interviewer\'s '
            'question, or a spouse\'s statement as this candidate\'s position. Omit ambiguous attribution. '
            'Do not fill empty categories. Preserve conditions, dates, and differences in positions.\n')
