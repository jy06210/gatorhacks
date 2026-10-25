import json
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

import httpx

from biography_facts import extract_facts
from candidate_research import research
from gemma_api_client import GemmaAPIClient
from profile_synthesis import synthesize_profile, policy_claims, validate_plan, SynthesisPlan
from schemas import SourceResult, SourcedFinding
from test_profile_synthesis import fixture
from web_fetcher import fetch_source, browser_extract


class BatchedTests(unittest.TestCase):
    def test_multiple_whole_sources_extract_once_and_quotes_stay_source_bound(self):
        quote='Jane Doe supports expanding affordable health care for working families.'
        texts=[quote+' Jane Doe served in the Florida House. '*8,
               'Jane Doe opposes higher taxes for working families. '*15]
        sdk=Mock()
        response={'documents':[{'source_id':f'{i}:0','findings':[dict(category='Healthcare',policy_issue='Health care',attributed_candidate='Jane Doe',neutral_summary='Supports affordable care.',supporting_quote=quote)],'biography':[]} for i in range(2)]}
        sdk.models.generate_content.return_value=SimpleNamespace(text=json.dumps(response))
        model=GemmaAPIClient('mock',client=sdk,max_input_chars=2_000_000)
        model.supports_batches=True
        with httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(200,headers={'content-type':'text/html'},text='fixture'))) as web, patch('web_fetcher.trafilatura.extract',side_effect=texts):
            p=research('Jane Doe','Senate',['https://a.example/','https://b.example/'],web,model)
        self.assertEqual(sdk.models.generate_content.call_count,1)
        self.assertEqual(len(p.sources[0].findings),1)
        self.assertEqual(len(p.sources[1].findings),0)
        self.assertEqual(p.sources[1].rejected_findings,1)
        self.assertEqual(p.sources[0].analyzed_text,texts[0])
        self.assertEqual(p.sources[0].biography_extractions,[])

    def test_resynthesis_biography_extraction_is_one_batch(self):
        p=fixture()
        quote='Jane Doe served in the Florida House of Representatives.'
        for source in p.sources:
            source.retrieved_text+=' '+quote
        client=Mock()
        client.supports_batches=True
        def generate(prompt,schema):
            data=json.loads(prompt.rsplit('\n',1)[1])
            self.assertEqual(schema.__name__,'BatchBiography')
            return schema.model_validate({'documents':[dict(source_id=d['source_id'],facts=[dict(candidate='Jane Doe',relation='previous_office',value='Florida House of Representatives',qualifier='',quote=quote)]) for d in data['documents']]})
        client.generate_json.side_effect=generate
        facts,failures=extract_facts(p,client)
        self.assertEqual(len(facts),2)
        self.assertFalse(failures)
        self.assertEqual(client.generate_json.call_count,1)

    def test_twelve_sections_use_two_calls_with_individual_claim_checks(self):
        p=fixture()
        # Reuse valid evidence under every category to measure dispatch only.
        from policy_taxonomy import CATEGORIES
        original=p.sources[0].findings[0]
        p.sources[0].findings=[original.model_copy(update={'category':category}) for category in CATEGORIES]
        p.sources[1].findings=[]
        client=Mock()
        client.supports_batches=True
        client.input_budget_bytes.return_value=1_000_000
        calls=[]
        def generate(prompt,schema):
            calls.append(schema.__name__)
            data=json.loads(prompt.rsplit('\n',1)[1])
            if schema.__name__=='BatchSynthesis':
                return schema.model_validate({'sections':[dict(section=name,plan={'sentences':[dict(text='Jane Doe supports expanding affordable health care.',evidence_ids=[table['claims'][0]['id']])]}) for name,table in data['sections'].items()]})
            self.assertEqual(schema.__name__,'BatchGrounding')
            return schema.model_validate({'sections':[dict(section=name,
                verdict={'sentences':[dict(sentence_index=i,supported=True,reason='entailed') for i,_ in enumerate(table['sentences'])],'preserves_distinctions':True,'reason':'consistent'},
                claims=[dict(sentence_index=i,claim_id=e,supported=True,reason='quote supports claim') for i,s in enumerate(table['sentences']) for e in s['evidence_ids']]) for name,table in data['sections'].items()]})
        client.generate_json.side_effect=generate
        with patch('profile_synthesis.biography_claims',return_value=([],[],[])):
            result=synthesize_profile(p,client)
        self.assertEqual(calls,['BatchSynthesis','BatchGrounding'])
        self.assertTrue(all(section.summary for section in result.issues.values()))
        self.assertTrue(all(result.diagnostics[c]['claim_verdicts'] for c in CATEGORIES))
        self.assertEqual(list(map(str,result.issues['Healthcare'].sources)),['https://janedoe.com/'])

    def test_detailed_policy_up_to_130_words_is_valid_without_padding(self):
        p=fixture()
        claims=policy_claims(p)['Healthcare']
        plan=SynthesisPlan(sentences=[dict(text=' '.join(['Care']*110)+'.',evidence_ids=[claims[0]['id']])])
        validate_plan(plan,claims,'Healthcare') # still requires semantic verification afterward

    def test_browser_only_for_unrestricted_empty_html_not_403_or_paywalls(self):
        readable='Jane Doe supports expanding affordable health care for families. '*3
        for status,html,allowed in [(403,'<html>blocked</html>',False),(200,'<div class="paywall">restricted</div>',False),(200,'<html><script>render()</script></html>',True)]:
            with self.subTest(status=status,html=html), httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(status,headers={'content-type':'text/html'},text=html))) as web, patch('web_fetcher.trafilatura.extract',return_value=None), patch('web_fetcher.browser_extract',return_value=readable) as render:
                result=fetch_source('https://example.org/',web)
            self.assertEqual(render.call_count,1 if allowed else 0)
            self.assertEqual(result.status,'partial' if allowed else 'source_unavailable')

    def test_browser_respects_robots_without_launching(self):
        with patch('web_fetcher._browser_attempts',0), patch.dict('os.environ',{'RESEARCH_BROWSER_FALLBACK':'1'}), httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(200,text='User-agent: *\nDisallow: /'))) as web:
            with self.assertRaisesRegex(ValueError,'robots'):
                browser_extract('https://example.org/',web)

    def test_missing_claim_verdict_cannot_accept_batched_summary(self):
        from section_batches import synthesize_batches
        client=Mock()
        client.input_budget_bytes.return_value=1_000_000
        claims=policy_claims(fixture())['Healthcare']
        def generate(prompt,schema):
            if schema.__name__=='BatchSynthesis':
                return schema.model_validate({'sections':[dict(section='Healthcare',plan={'sentences':[dict(text='Jane Doe supports affordable care.',evidence_ids=[claims[0]['id']])]})]})
            return schema.model_validate({'sections':[dict(section='Healthcare',verdict={'sentences':[dict(sentence_index=0,supported=True,reason='yes')],'preserves_distinctions':True,'reason':'yes'},claims=[])]})
        client.generate_json.side_effect=generate
        self.assertEqual(synthesize_batches(client,'Jane Doe',{'Healthcare':claims}),{})

    def test_output_truncation_splits_batch_without_losing_source_ids(self):
        sdk=Mock()
        calls=[]
        def response(**kwargs):
            docs=json.loads(kwargs['contents'].rsplit('\n',1)[1])['documents']
            calls.append(docs)
            if len(calls)==1:
                return SimpleNamespace(text='',candidates=[SimpleNamespace(finish_reason='MAX_TOKENS')])
            return SimpleNamespace(text=json.dumps({'documents':[dict(source_id=d['source_id'],findings=[],biography=[]) for d in docs]}))
        sdk.models.generate_content.side_effect=response
        model=GemmaAPIClient('mock',client=sdk,max_input_chars=2_000_000)
        result=model.analyze_documents('Jane Doe','Senate',[dict(source_id='original',text='Jane Doe supports public health. '*100)])
        self.assertEqual(len(calls),2) # one failed whole source, one two-part retry
        self.assertEqual([d.source_id for d in result],['original'])
