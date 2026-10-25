import json
import unittest
import warnings
from unittest.mock import patch
import httpx
from candidate_research import research
from ollama_client import OllamaClient
from web_fetcher import fetch_source
from schemas import SourceResult

TEXT = 'Jane Doe supports expanding public transit and funding additional bus routes. ' * 3
QUOTE = 'Jane Doe supports expanding public transit and funding additional bus routes.'
URLS = ['https://example.org/policy', 'https://example.org/interview']

class PipelineTests(unittest.TestCase):
    def test_assigned_final_url_serializes_without_warning(self):
        source = SourceResult(source_url=URLS[0])
        source.final_url = URLS[1]
        with warnings.catch_warnings():
            warnings.simplefilter('error')
            payload = json.loads(source.model_dump_json())
        self.assertEqual(payload['final_url'], URLS[1])

    def run_pipeline(self, findings, text=TEXT):
        requests = []
        def handler(request):
            requests.append(request)
            if request.method == 'GET':
                return httpx.Response(200, headers={'content-type': 'text/html'}, text='<article>fixture</article>')
            return httpx.Response(200, json={'response': json.dumps({'findings': findings})})
        with httpx.Client(transport=httpx.MockTransport(handler)) as client, patch('web_fetcher.trafilatura.extract', return_value=text):
            profile = research('Jane Doe', 'Florida Senate', URLS, client, OllamaClient(client))
        self.assertEqual([r.method for r in requests[:2]], ['GET', 'GET'])
        self.assertTrue(all(r.method == 'POST' for r in requests[2:]))
        payload = json.loads(requests[2].content)
        self.assertEqual(payload['model'], 'gemma3:4b')
        self.assertEqual(payload['format'], 'json')
        return profile

    def test_supported_quote_and_provenance(self):
        profile = self.run_pipeline([dict(policy_issue='Transit', neutral_summary='Supports additional bus routes.', supporting_quote=QUOTE)])
        self.assertEqual(profile.status, 'ok')
        finding = profile.sources[0].findings[0]
        self.assertEqual(str(finding.source_url), URLS[0])
        self.assertEqual(finding.collected_at, profile.sources[0].collected_at)
        self.assertIsNotNone(finding.collected_at.tzinfo)

    def test_hallucinated_quote_rejected(self):
        profile = self.run_pipeline([dict(policy_issue='Taxes', neutral_summary='Supports tax cuts.', supporting_quote='Jane Doe supports eliminating all state taxes.')])
        self.assertEqual(profile.status, 'partial')
        self.assertEqual(profile.sources[0].findings, [])
        self.assertEqual(profile.sources[0].rejected_findings, 1)

    def test_missing_information(self):
        self.assertEqual(self.run_pipeline([]).status, 'partial')

    def test_more_than_five_supported_issues_are_preserved(self):
        quotes = [f'Jane Doe proposes funding the explicitly named program {i}.' for i in range(6)]
        findings = [dict(policy_issue=f'Program {i}',
                         neutral_summary=f'Proposes funding program {i}.',
                         supporting_quote=quote) for i, quote in enumerate(quotes)]
        profile = self.run_pipeline(findings, text=' '.join(quotes))
        self.assertEqual(profile.status, 'ok')
        self.assertEqual(len(profile.sources[0].findings), 6)

    def test_bounded_excerpt(self):
        profile = self.run_pipeline([], text=TEXT * 100)
        self.assertTrue(profile.sources[0].input_truncated)
        self.assertLessEqual(len(profile.sources[0].analyzed_text.encode()), 2596 * 8)

    def test_unavailable_sources(self):
        for status in (403, 404, 500):
            with self.subTest(status=status), httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(status))) as client:
                profile = research('Jane', 'Senate', URLS, client, OllamaClient(client))
                self.assertEqual(profile.status, 'source_unavailable')

    def test_timeout_and_challenge(self):
        def timeout(request):
            raise httpx.ReadTimeout('timed out', request=request)
        with httpx.Client(transport=httpx.MockTransport(timeout)) as client:
            self.assertEqual(fetch_source(URLS[0], client).status, 'source_unavailable')
        with httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(200, headers={'content-type': 'text/html'}, text='Verify you are human'))) as client:
            self.assertEqual(fetch_source(URLS[0], client).status, 'source_unavailable')

    def test_bad_ollama_response_keeps_source(self):
        def handler(request):
            if request.method == 'GET':
                return httpx.Response(200, headers={'content-type': 'text/html'}, text='<p>text</p>')
            return httpx.Response(200, json={'response': 'not JSON'})
        with httpx.Client(transport=httpx.MockTransport(handler)) as client, patch('web_fetcher.trafilatura.extract', return_value=TEXT):
            profile = research('Jane', 'Senate', URLS, client, OllamaClient(client))
        self.assertEqual(profile.status, 'partial')
        self.assertEqual(profile.sources[0].retrieved_text, TEXT)
        self.assertIn('ValidationError', profile.sources[0].error)

    def test_real_html_extraction(self):
        html = '<html><body><article><h1>Policy</h1><p>' + TEXT + '</p></article></body></html>'
        with httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(200, headers={'content-type': 'text/html'}, text=html))) as client:
            self.assertIn(QUOTE, fetch_source(URLS[0], client).retrieved_text)

if __name__ == '__main__':
    unittest.main()
