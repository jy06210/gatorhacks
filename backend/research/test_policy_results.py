import unittest

from pydantic import ValidationError
from schemas import Finding, SourceResult, SourcedFinding, utc_now
from policy_taxonomy import CATEGORIES, map_category
from policy_results import group_findings, attribution_supported


def finding(**changes):
    return Finding(**dict(dict(category='Economy', policy_issue='Property insurance',
        neutral_summary='Supports reducing property insurance costs.',
        supporting_quote='Jane Doe supports reducing property insurance costs.'), **changes))


class PolicyTests(unittest.TestCase):
    def test_fixed_labels_and_specific_issues(self):
        self.assertEqual(len(CATEGORIES), 12)
        for issue, category in [('Property insurance', 'Economy'), ('Abortion', 'Abortion & Reproductive Health'),
                                ('AI regulation', 'Tech & AI'), ('School funding', 'Education'),
                                ('Health care', 'Healthcare'), ('Voting rights', 'Election Policy')]:
            self.assertEqual(map_category(issue), category)
        self.assertEqual(finding().policy_issue, 'Property insurance')
        with self.assertRaises(ValidationError):
            finding(category='Affordability')

    def test_duplicates_retain_all_source_evidence_and_empty_categories(self):
        f = finding()
        sources = []
        for url in ('https://campaign.example/', 'https://news.example/'):
            source = SourceResult(source_url=url, retrieved_text=f.supporting_quote)
            source.findings = [SourcedFinding(**f.model_dump(), source_url=url, collected_at=utc_now())]
            sources.append(source)
        grouped = group_findings(sources)
        self.assertEqual(len(grouped['Economy']), 1)
        self.assertEqual(len(grouped['Economy'][0].evidence), 2)
        self.assertEqual({str(e.source_url) for e in grouped['Economy'][0].evidence}, {'https://campaign.example/', 'https://news.example/'})
        self.assertEqual(grouped['Healthcare'], [])
        self.assertEqual(list(grouped), list(CATEGORIES))

    def test_conflicting_or_conditional_positions_never_merge(self):
        a = finding()
        b = finding(neutral_summary='Opposes reducing property insurance costs.', supporting_quote='Jane Doe opposes reducing property insurance costs.')
        c = finding(supporting_quote='Jane Doe supports reducing property insurance costs only if funding permits.')
        source = SourceResult(source_url='https://news.example/', retrieved_text='\n'.join(f.supporting_quote for f in (a,b,c)))
        source.findings = [SourcedFinding(**f.model_dump(), source_url=source.source_url, collected_at=source.collected_at) for f in (a,b,c)]
        self.assertEqual(len(group_findings([source])['Economy']), 3)

    def test_multi_candidate_attribution_and_chunk_boundaries(self):
        quote = 'I support reducing property insurance costs for families.'
        first = 'Candidate: Jane Doe\n' + quote + '\n'
        second = 'Candidate: John Roe\n' + quote
        text = first + second
        f = finding(supporting_quote=quote, attributed_candidate='Jane Doe')
        self.assertTrue(attribution_supported(f, 'Jane Doe', first, text))
        self.assertFalse(attribution_supported(f, 'Jane Doe', second, text, len(first)))
        self.assertFalse(attribution_supported(finding(attributed_candidate='John Roe'), 'Jane Doe', text, text))
        self.assertFalse(attribution_supported(finding(supporting_quote='John Roe supports reducing property insurance costs.'), 'Jane Doe', text, text))
