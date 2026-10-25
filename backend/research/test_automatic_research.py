from datetime import timedelta
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import httpx

from candidate_research import research
from candidate_research import main
from gemma_api_client import GemmaAPIClient
from research_cache import cache_path, read_cache, write_cache
from schemas import CandidateProfile, SourceResult, SourcedFinding, utc_now
from source_discovery import discover_sources, select_sources


class AutomaticTests(unittest.TestCase):
    def test_rate_limit_retry_and_sanitized_status(self):
        sdk = Mock()
        error = RuntimeError('quota key=secret')
        error.code = 429
        sdk.models.generate_content.side_effect = [error, SimpleNamespace(text='{"findings":[]}')]
        with patch('gemma_api_client.sleep'), self.assertLogs('candidate_research', level='WARNING') as logs:
            result = GemmaAPIClient('secret', client=sdk).analyze('Jane', 'Senate', 'text')
        self.assertEqual(result.findings, [])
        self.assertEqual(sdk.models.generate_content.call_count, 2)
        self.assertIn('429', str(logs.output))
        self.assertNotIn('secret', str(logs.output))

    def test_timeout_and_invalid_json(self):
        for error in (httpx.ReadTimeout('timed out'), None):
            sdk = Mock()
            if error:
                sdk.models.generate_content.side_effect = error
            else:
                sdk.models.generate_content.return_value = SimpleNamespace(text='not JSON')
            with patch('gemma_api_client.sleep'), self.assertRaises(ValueError):
                GemmaAPIClient('secret', client=sdk).analyze('Jane', 'Senate', 'text')
            self.assertEqual(sdk.models.generate_content.call_count, 2 if error else 1)

    def test_gemma4_minimal_thinking_and_truncated_output(self):
        sdk = Mock()
        sdk.models.generate_content.return_value = SimpleNamespace(text='{"findings":[]}', candidates=[SimpleNamespace(finish_reason='MAX_TOKENS')])
        with self.assertRaisesRegex(ValueError, 'truncated'):
            GemmaAPIClient('secret', model='gemma-4-26b-a4b-it', client=sdk).analyze('Jane', 'Senate', 'text')
        config = sdk.models.generate_content.call_args.kwargs['config']
        self.assertEqual(config['thinking_config']['thinking_level'], 'minimal')
        sdk.models.generate_content.return_value = SimpleNamespace(text='{"findings":[]}')
        GemmaAPIClient('secret', model='gemma-3-27b-it', client=sdk).analyze('Jane', 'Senate', 'text')
        self.assertNotIn('thinking_config', sdk.models.generate_content.call_args.kwargs['config'])

    def test_quote_from_different_chunk_is_rejected(self):
        from schemas import ModelFindings
        quote = 'Jane Doe proposes expanding bus routes for all residents.'
        text = ('Introduction unrelated to policy. ' * 8) + '\n\n' + quote
        model = GemmaAPIClient('secret', max_input_chars=200, client=Mock())
        model.analyze = Mock(return_value=ModelFindings(findings=[dict(policy_issue='Transit', neutral_summary='Proposes more buses.', supporting_quote=quote)]))
        with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, headers={'content-type':'text/html'}, text='fixture'))) as web, patch('web_fetcher.trafilatura.extract', return_value=text):
            profile = research('Jane Doe', 'Senate', ['https://janedoe.com/'], web, model)
        self.assertGreater(profile.sources[0].rejected_findings, 0)
        self.assertEqual(len(profile.sources[0].findings), 1)

    def test_chunk_failure_preserves_later_evidence(self):
        from text_chunks import split_chunks
        sdk = Mock()
        model = GemmaAPIClient('secret', max_input_chars=200, client=sdk)
        text = ('Jane Doe Florida Senate supports expanded bus services. ' * 10)
        chunks, truncated = split_chunks(text, model)
        self.assertFalse(truncated)
        self.assertEqual(''.join(chunks), text)
        quote = chunks[-1].strip()
        sdk.models.generate_content.side_effect = [RuntimeError('bad request')] + [SimpleNamespace(text='{"findings":[]}')] * (len(chunks) - 2) + [SimpleNamespace(text=json.dumps({'findings':[dict(policy_issue='Transit', neutral_summary='Supports expanded bus services.', supporting_quote=quote)]}))]
        with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, headers={'content-type':'text/html'}, text='fixture'))) as web, patch('web_fetcher.trafilatura.extract', return_value=text):
            profile = research('Jane Doe', 'Florida Senate', ['https://janedoe.com/'], web, model)
        self.assertEqual(profile.status, 'partial')
        self.assertEqual(len(profile.sources[0].findings), 1)
        self.assertIn('chunk 1', profile.sources[0].error)

    def test_campaign_identity_inheritance_is_exact_host_only(self):
        text = 'Jane Doe is running a campaign for Florida Senate. Vote Jane Doe. ' * 2
        short = 'Our goal is to expand affordable public transit for all working families. ' * 2
        model = GemmaAPIClient('secret', client=Mock())
        model.analyze = Mock(return_value=__import__('schemas').ModelFindings(findings=[]))
        def handler(r):
            return httpx.Response(200, headers={'content-type':'text/html'}, text=text if r.url.path == '/' and r.url.host == 'janedoe.com' else short)
        with httpx.Client(transport=httpx.MockTransport(handler)) as web, patch('web_fetcher.trafilatura.extract', side_effect=lambda raw, **kw: raw.decode()):
            p = research('Jane Doe', 'Florida Senate', ['https://janedoe.com/issues', 'https://janedoe.com/', 'https://evil.janedoe.com/issues', 'https://news.org/issues'], web, model, check_identity=True)
        self.assertEqual(model.analyze.call_count, 2)
        self.assertIn('not both confirmed', p.sources[2].error)
        self.assertIn('not both confirmed', p.sources[3].error)

    def test_policy_guide_outranks_unrelated_news(self):
        items = [dict(url='https://wlrn.org/news', title='Jane Doe Florida Senate campaign finance news'), dict(url='https://local.org/guide', title='Jane Doe Florida Senate voter guide policy interview')]
        self.assertEqual(select_sources(items, 'Jane Doe', 'Florida Senate')[0], 'https://local.org/guide')

    def test_cli_cache_hit_skips_discovery_and_model(self):
        with TemporaryDirectory() as directory:
            finding = SourcedFinding(policy_issue='Transit', neutral_summary='Supports transit.', supporting_quote='Jane Doe supports expanding public transit.', source_url='https://example.org/', collected_at=utc_now())
            profile = CandidateProfile(candidate_name='Jane Doe', office='Senate', status='partial', sources=[SourceResult(source_url='https://example.org/', findings=[finding])])
            command = ['candidate_research.py', '--candidate', 'Jane Doe', '--office', 'Senate', '--output-dir', directory]
            with patch('sys.argv', command), patch('candidate_research.attach_profile'), patch('candidate_research.discover_sources', return_value=(['https://example.org/'], [])) as search, patch('candidate_research.research', return_value=profile) as analyze:
                main()
                main()
                self.assertEqual(search.call_count, 1)
                self.assertEqual(analyze.call_count, 1)
                with patch('sys.argv', command + ['--refresh']):
                    main()
                self.assertEqual(search.call_count, 2)

    def test_search_and_deterministic_selection(self):
        items = [
            dict(url='https://apnews.com/policy?utm_source=test', title='Jane Doe Florida Senate policy interview'),
            dict(url='https://apnews.com/policy#section', title='Jane Doe Florida Senate policy interview'),
            dict(url='https://wrong.org/', title='John Doe Florida Senate'),
            dict(url='https://other.org/', title='Jane Doe Mayor'),
            dict(url='https://campaign.org/issues', title='Jane Doe Florida Senate official campaign issues'),
            dict(url='https://local.org/interview', title='Jane Doe Florida Senate interview'),
        ]
        expected = select_sources(items, 'Jane Doe', 'Florida Senate', 3)
        self.assertEqual(expected, select_sources(list(reversed(items)), 'Jane Doe', 'Florida Senate', 3))
        self.assertEqual(len(expected), 3)
        self.assertIn('https://apnews.com/policy', expected)
        def handler(request):
            self.assertEqual(request.headers['X-Subscription-Token'], 'secret')
            self.assertNotIn('secret', str(request.url))
            return httpx.Response(200, json={'web': {'results': items}})
        with httpx.Client(transport=httpx.MockTransport(handler)) as client:
            urls, errors = discover_sources(client, 'secret', 'Jane Doe', 'Florida Senate', '2026', 3)
        self.assertEqual(urls, expected)
        self.assertFalse(errors)

    def test_search_failure_sanitized(self):
        with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(401, text='secret'))) as client:
            urls, errors = discover_sources(client, 'secret', 'Jane Doe', 'Senate', '2026')
        self.assertEqual(urls, [])
        self.assertTrue(errors)
        self.assertNotIn('secret', str(errors))

    def test_hosted_json_and_quote_validation(self):
        quote = 'Jane Doe proposes expanding bus routes for Florida Senate District 1.'
        findings = [dict(policy_issue='Transit', neutral_summary='Proposes expanding bus routes.', supporting_quote=quote),
                    dict(policy_issue='Taxes', neutral_summary='Proposes tax cuts.', supporting_quote='Jane Doe proposes eliminating all taxes.')]
        sdk = Mock()
        sdk.models.generate_content.return_value = SimpleNamespace(text='```json\n' + json.dumps({'findings': findings}) + '\n```')
        model = GemmaAPIClient('secret', client=sdk)
        with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, headers={'content-type': 'text/html'}, text='fixture'))) as web, patch('web_fetcher.trafilatura.extract', return_value=quote * 2):
            profile = research('Jane Doe', 'Florida Senate', ['https://campaign.org/'], web, model, check_identity=True)
        self.assertEqual(len(profile.sources[0].findings), 1)
        self.assertEqual(profile.sources[0].rejected_findings, 1)
        self.assertEqual(profile.status, 'partial')

    def test_identity_gate_skips_model(self):
        model = Mock()
        with httpx.Client(transport=httpx.MockTransport(lambda r: httpx.Response(200, headers={'content-type': 'text/html'}, text='fixture'))) as web, patch('web_fetcher.trafilatura.extract', return_value='John Doe is running for mayor. ' * 5):
            profile = research('Jane Doe', 'Florida Senate', ['https://news.org/'], web, model, check_identity=True)
        model.analyze.assert_not_called()
        self.assertEqual(profile.status, 'partial')

    def test_hosted_errors_do_not_expose_credentials(self):
        sdk = Mock()
        sdk.models.generate_content.side_effect = RuntimeError('secret API credential')
        with self.assertRaises(ValueError) as raised:
            GemmaAPIClient('secret', client=sdk).analyze('Jane', 'Senate', 'text')
        self.assertNotIn('secret', str(raised.exception))

    def test_cache_identity_expiry_and_failures(self):
        with TemporaryDirectory() as directory:
            path = cache_path(Path(directory), 'Jane Doe', 'Senate', '2026', provider='gemma-api')
            self.assertEqual(path, cache_path(Path(directory), ' jane  DOE ', 'senate', '2026', provider='gemma-api'))
            self.assertNotEqual(path, cache_path(Path(directory), 'Jane Doe', 'Senate', '2028', provider='gemma-api'))
            self.assertNotEqual(path, cache_path(Path(directory), 'Jane Doe', 'Mayor', '2026', provider='gemma-api'))
            finding = SourcedFinding(policy_issue='Transit', neutral_summary='Supports transit.', supporting_quote='Jane Doe supports expanding public transit.', source_url='https://example.org/', collected_at=utc_now())
            profile = CandidateProfile(candidate_name='Jane Doe', office='Senate', status='partial', sources=[SourceResult(source_url='https://example.org/', findings=[finding])])
            write_cache(path, profile)
            self.assertIsNotNone(read_cache(path, 24))
            profile.collected_at = utc_now() - timedelta(hours=25)
            write_cache(path, profile)
            self.assertIsNone(read_cache(path, 24))
            path.write_text('broken')
            self.assertIsNone(read_cache(path, 24))
            profile.sources = []
            write_cache(path, profile)
            self.assertEqual(path.read_text(), 'broken')
