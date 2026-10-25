"""Synthetic fixtures reproduce omitted-office snippets and blocked-source fallback."""
import unittest
import re
from unittest.mock import Mock, patch

import httpx

from candidate_research import research
from gemma_api_client import GemmaAPIClient
from schemas import ModelFindings
from source_discovery import DiscoveryPlan, discover_sources, identity_matches, select_sources, search_queries


class DiscoveryFallbackTests(unittest.TestCase):
    def test_office_aliases_keep_federal_and_state_senate_separate(self):
        for alias in ('U.S. Senate', 'US Senate', 'United States Senator', 'U. S. Senate'):
            self.assertTrue(identity_matches('Angie Nixon for ' + alias, 'Angie Nixon', 'United States Senate'))
        self.assertFalse(identity_matches('Angie Nixon Florida State Senate', 'Angie Nixon', 'United States Senate'))
        self.assertFalse(identity_matches('Angela Nixon for US Senate', 'Angie Nixon', 'United States Senate'))
        queries = search_queries('Angie Nixon', 'United States Senate', 'Florida 2026 general election')
        self.assertGreaterEqual(len(set(queries)), 6)
        self.assertTrue(all('2026' in q and 'Florida' in q for q in queries[:6]))
        self.assertTrue(any('biography' in q and '2026' not in q for q in queries))

    def test_search_keeps_campaign_and_questionnaire_without_office_in_each_snippet(self):
        items = [dict(url='https://campaign.example/issues', title='Angie Nixon policy positions'),
                 dict(url='https://guide.example/questionnaire', title='Angie Nixon candidate questionnaire'),
                 dict(url='https://en.wikipedia.org/wiki/Angie_Nixon', title='Angie Nixon United States Senate'),
                 dict(url='https://other.example/', title='Angela Nixon United States Senate')]
        with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, json={'web': {'results': items}}))) as client, self.assertLogs('candidate_research', level='INFO') as logs:
            urls, errors = discover_sources(client, 'fake', 'Angie Nixon', 'United States Senate', 'Florida 2026', 3)
        self.assertIn('https://campaign.example/issues', urls)
        self.assertIn('https://guide.example/questionnaire', urls)
        self.assertNotIn('https://other.example/', urls)
        self.assertIn('candidate name mismatch', '\n'.join(logs.output))
        self.assertLess(urls.index('https://guide.example/questionnaire'), urls.index('https://en.wikipedia.org/wiki/Angie_Nixon'))

    def test_angie_nixon_record_campaign_inheritance_and_403_fallback(self):
        record = 'https://www.fec.gov/candidate/fixture/'
        campaign = 'https://campaign.example/issues'
        guide = 'https://guide.example/questionnaire'
        blocked = 'https://en.wikipedia.org/wiki/Angie_Nixon'
        unrelated = 'https://unrelated.example/issues'
        quote = 'I support expanding access to affordable health care for working families.'
        pages = {
            record: '<title>Candidate registration</title><article>Angie Nixon United States Senate Florida 2026 Candidate record. <a href="https://campaign.example/">Official campaign website</a></article>',
            campaign: '<title>Our priorities</title><article>' + quote * 2 + '</article>',
            guide: '<title>Angie Nixon questionnaire</title><article>Angie Nixon candidate answers. ' + quote * 2 + '</article>',
            unrelated: '<title>Angela Nixon</title><article>Angela Nixon for United States Senate. ' + quote * 2 + '</article>',
        }
        def handler(request):
            return httpx.Response(403) if str(request.url) == blocked else httpx.Response(200, headers={'content-type': 'text/html'}, text=pages[str(request.url)])
        plan = DiscoveryPlan([blocked, record, campaign, unrelated, guide], {guide: ['Angie Nixon for U.S. Senate Florida 2026 questionnaire']}, 3)
        plan.context = 'Florida 2026'
        model = GemmaAPIClient('fake', client=Mock())
        model.analyze = Mock(return_value=ModelFindings(findings=[dict(policy_issue='Health care', neutral_summary='Supports expanding affordable health care access.', supporting_quote=quote)]))
        with httpx.Client(transport=httpx.MockTransport(handler)) as web, patch('web_fetcher.trafilatura.extract', side_effect=lambda raw, **kw: re.sub('<[^>]+>', ' ', raw.decode())), self.assertLogs('candidate_research', level='INFO') as logs:
            profile = research('Angie Nixon', 'United States Senate', plan, web, model, check_identity=True)
        self.assertEqual(profile.status, 'partial')
        by_url = {str(s.source_url): s for s in profile.sources}
        self.assertEqual(by_url[blocked].status, 'source_unavailable')
        self.assertEqual(len(by_url[campaign].findings), 1)
        self.assertEqual(len(by_url[guide].findings), 1)
        self.assertFalse(by_url[unrelated].findings)
        self.assertEqual(model.analyze.call_count, 2)
        self.assertIn(record, ' '.join(profile.limitations))
        self.assertIn('continuing to reserve', '\n'.join(logs.output))

    def test_wrong_election_record_does_not_verify_campaign(self):
        record = 'https://www.fec.gov/candidate/fixture/'
        campaign = 'https://campaign.example/issues'
        plan = DiscoveryPlan([record, campaign], {}, 3)
        plan.context = 'Florida 2026'
        pages = {record: 'Angela Nixon United States Senate Florida 2026. Official campaign website. ' * 2,
                 campaign: 'Angie Nixon believes everyone deserves affordable health care. ' * 2}
        model = Mock()
        with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, headers={'content-type':'text/html'}, text='<article>' + pages[str(r.url)] + '</article>'))) as web, patch('web_fetcher.trafilatura.extract', side_effect=lambda raw, **kw: re.sub('<[^>]+>', ' ', raw.decode())):
            p = research('Angie Nixon', 'United States Senate', plan, web, model, check_identity=True)
        model.analyze.assert_not_called()
        self.assertIn('No accessible election record', p.limitations[0])

    def test_wrong_year_or_state_record_does_not_corroborate(self):
        for details in ('Florida 2024', 'Georgia 2026'):
            with self.subTest(details=details):
                url = 'https://www.fec.gov/candidate/fixture/'
                plan = DiscoveryPlan([url], {}, 3)
                plan.context = 'Florida 2026'
                text = f'Angie Nixon United States Senate {details} Candidate filing record. Additional official registration details follow.'
                with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, headers={'content-type':'text/html'}, text=text))) as web, patch('web_fetcher.trafilatura.extract', return_value=text):
                    p = research('Angie Nixon', 'United States Senate', plan, web, Mock(), check_identity=True)
                self.assertIn('No accessible election record', p.limitations[0])
