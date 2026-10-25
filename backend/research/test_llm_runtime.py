import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import httpx

from candidate_research import research
from gemma_api_client import GemmaAPIClient
from llm_runtime import JsonCache, Pacer, ProviderUnavailable, model_settings, retry_policy
from profile_synthesis import synthesize_profile, GroundingVerdict, SynthesisPlan
from schemas import ModelFindings
from test_profile_synthesis import fixture, model


class RuntimeTests(unittest.TestCase):
    def test_gemini_35_flash_lite_defaults_all_stages_and_sdk_json_configuration(self):
        from google.genai import types
        from biography_facts import BioExtraction
        with patch.dict(os.environ, {}, clear=True):
            self.assertEqual(set(model_settings().values()), {'gemini-3.5-flash-lite'})
            sdk=Mock()
            client=GemmaAPIClient('secret', client=sdk)
            responses=[(ModelFindings, '{"findings":[]}'), (BioExtraction, '{"facts":[]}'),
                (SynthesisPlan, '{"sentences":[{"text":"Supported statement.","evidence_ids":["id"]}]}'),
                (GroundingVerdict, '{"sentences":[],"preserves_distinctions":true,"reason":"ok"}')]
            for schema, text in responses:
                sdk.models.generate_content.return_value=SimpleNamespace(text=text)
                client.generate_json('test',schema)
                args=sdk.models.generate_content.call_args.kwargs
                self.assertEqual(args['model'],'gemini-3.5-flash-lite')
                self.assertNotIn('temperature',args['config'])
                self.assertEqual(args['config']['response_mime_type'],'application/json')
                self.assertEqual(args['config']['response_json_schema'],schema.model_json_schema())
                self.assertEqual(args['config']['thinking_config']['thinking_level'],'minimal')
                types.GenerateContentConfig.model_validate(args['config']) # installed SDK, no network

    def test_retry_after_and_retry_info_daily_and_billing(self):
        error=httpx.HTTPStatusError('limited',request=httpx.Request('POST','https://example.org'),response=httpx.Response(429,headers={'Retry-After':'17'}))
        self.assertEqual(retry_policy(error,0),('rate_limit',17))
        error=RuntimeError('429 RESOURCE_EXHAUSTED retryDelay: 4.5s')
        error.code=429
        self.assertEqual(retry_policy(error,0),('rate_limit',4.5))
        for message in ('GenerateRequestsPerDayPerProject', 'billing disabled', '"quotaValue": "0"'):
            error=RuntimeError(message)
            error.code=429
            self.assertEqual(retry_policy(error,0),('daily_quota_or_access',None))

    def test_permanent_quota_stops_later_calls_without_retry(self):
        sdk=Mock()
        error=RuntimeError('GenerateRequestsPerDay quota exhausted')
        error.code=429
        sdk.models.generate_content.side_effect=error
        client=GemmaAPIClient('secret',client=sdk)
        with patch('gemma_api_client.sleep') as wait:
            for prompt in ('first','second'):
                with self.assertRaises(ProviderUnavailable):
                    client.generate_json(prompt,ModelFindings)
        wait.assert_not_called()
        self.assertEqual(sdk.models.generate_content.call_count,1)

    def test_request_cache_model_prompt_schema_namespace_invalidation(self):
        with TemporaryDirectory() as directory:
            sdk=Mock()
            sdk.models.generate_content.return_value=SimpleNamespace(text='{"findings":[]}',usage_metadata=SimpleNamespace(prompt_token_count=42,candidates_token_count=8))
            client=GemmaAPIClient('secret',client=sdk,cache_dir=directory)
            client.namespace='Jane Doe/Senate/2026'
            client.generate_json('prompt',ModelFindings)
            client.generate_json('prompt',ModelFindings)
            self.assertEqual(sdk.models.generate_content.call_count,1)
            self.assertEqual(client.stats['extraction']['cache_hits'],1)
            self.assertEqual(client.stats['extraction']['reported_input_tokens'],42)
            client.generate_json('changed',ModelFindings)
            client.namespace='Jane Doe/Senate/2028'
            client.generate_json('prompt',ModelFindings)
            client.models['extraction']='different-model'
            client.generate_json('prompt',ModelFindings)
            self.assertEqual(sdk.models.generate_content.call_count,4)
            self.assertNotIn('secret',''.join(p.read_text() for p in Path(directory).rglob('*.json')))

    def test_token_and_request_pacing_with_fake_clock(self):
        now=[0.0]
        delays=[]
        def wait(seconds):
            self.assertLessEqual(seconds,5)
            delays.append(seconds)
            now[0]+=seconds
        pacer=Pacer(rpm=2,tpm=100,clock=lambda:now[0],wait=wait)
        pacer.reserve(60)
        pacer.reserve(50)
        self.assertGreaterEqual(now[0],60)
        self.assertTrue(delays)
        with self.assertRaises(ValueError):
            pacer.reserve(101)

    def test_models_routed_by_stage_and_google_provider_options(self):
        with patch.dict(os.environ,{'EXTRACTION_MODEL':'extract','SYNTHESIS_MODEL':'synth','VERIFICATION_MODEL':'verify'},clear=True):
            settings=model_settings('fallback')
            self.assertEqual(settings['biography'],'extract')
            self.assertEqual(settings['verification'],'verify')
        sdk=Mock()
        client=GemmaAPIClient('secret',client=sdk,models={'extraction':'gemini-test','synthesis':'synth','verification':'verify'})
        sdk.models.generate_content.return_value=SimpleNamespace(text='{"findings":[]}')
        client.generate_json('extract',ModelFindings)
        self.assertEqual(sdk.models.generate_content.call_args.kwargs['model'],'gemini-test')
        self.assertNotIn('thinking_config',sdk.models.generate_content.call_args.kwargs['config'])
        sdk.models.list.return_value=[SimpleNamespace(name='models/available',supported_actions=['generateContent']),SimpleNamespace(name='models/embed',supported_actions=['embedContent'])]
        self.assertEqual(client.available_models(),['models/available'])

    def test_installed_sdk_accepts_retry_configuration_offline(self):
        from google import genai
        client=genai.Client(api_key='mock-not-real',http_options={'timeout':120000,'retry_options':{'attempts':1}})
        client.close() # construction and cleanup only; no network calls

    def test_section_cache_resumes_interruption_and_invalidates_evidence(self):
        with TemporaryDirectory() as directory:
            client=Mock()
            client.section_cache=JsonCache(directory)
            client.configuration.return_value={'models':{'synthesis':'test','verification':'test'}}
            client.generate_json.side_effect=model
            p=fixture()
            def interrupt(partial):
                if partial.issues['Healthcare'].summary:
                    raise KeyboardInterrupt()
            with patch('profile_synthesis.biography_claims',return_value=([],[],[])):
                with self.assertRaises(KeyboardInterrupt):
                    synthesize_profile(p,client,on_progress=interrupt)
                calls=client.generate_json.call_count
                result=synthesize_profile(p,client)
                self.assertIsNotNone(result.issues['Healthcare'].summary)
                self.assertEqual(client.generate_json.call_count,calls)
                self.assertGreater(result.diagnostics['runtime']['section_cache_hits'],0)
                p.sources[0].findings[0].neutral_summary='A changed position description.'
                synthesize_profile(p,client)
                self.assertGreater(client.generate_json.call_count,calls)
                calls=client.generate_json.call_count
                client.configuration.return_value={'models':{'synthesis':'new','verification':'new'}}
                synthesize_profile(p,client)
                self.assertGreater(client.generate_json.call_count,calls)

    def test_extraction_recovery_skips_saved_fetches_and_chunks(self):
        text='Jane Doe supports expanding public transit. ' * 10
        model_client=Mock()
        model_client.excerpt.side_effect=lambda t:t[:200]
        model_client.analyze.return_value=ModelFindings(findings=[])
        state={}
        def progress(value):
            state.update(value)
            if any(s['completed_chunks'] for s in value['sources']):
                raise KeyboardInterrupt()
        requests=[]
        def handler(request):
            requests.append(request)
            return httpx.Response(200,headers={'content-type':'text/html'},text='<article>'+text+'</article>')
        with httpx.Client(transport=httpx.MockTransport(handler)) as web, patch('web_fetcher.trafilatura.extract',return_value=text):
            with self.assertRaises(KeyboardInterrupt):
                research('Jane Doe','Senate',['https://example.org/'],web,model_client,on_progress=progress)
            before=len(requests)
            research('Jane Doe','Senate',['https://example.org/'],web,model_client,resume=state)
        self.assertEqual(len(requests),before)
        self.assertEqual(model_client.analyze.call_count,3) # three chunks total, first not repeated
