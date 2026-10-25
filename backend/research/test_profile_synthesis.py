import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import Mock, patch

from candidate_research import main
from biography_facts import BioExtraction, BioFact, corroborate, extract_facts
from policy_taxonomy import CATEGORIES
from profile_synthesis import SynthesisPlan, GroundingVerdict, policy_claims, synthesize_profile, SYNTHESIS_VERSION, compact_evidence
from schemas import CandidateProfile, SourceResult, SourcedFinding


def fixture():
    quote = 'Jane Doe supports expanding affordable health care for working families.'
    sources = []
    for url in ('https://janedoe.com/', 'https://news.example/'):
        s = SourceResult(source_url=url, status='ok', retrieved_text=quote)
        s.findings = [SourcedFinding(category='Healthcare', policy_issue='Health care access',
            neutral_summary='Supports expanding affordable health care for working families.',
            attributed_candidate='Jane Doe', supporting_quote=quote, source_url=url, collected_at=s.collected_at)]
        sources.append(s)
    return CandidateProfile(candidate_name='Jane Doe', office='United States Senate', status='ok', sources=sources)


def model(prompt, schema):
    data = json.loads(prompt.split('\n',1)[1])
    if schema is BioExtraction:
        facts = []
        text = data['text']
        for quote, relation, value in [
            ('Jane Doe served in the Florida House.', 'previous_office', 'Florida House of Representatives'),
            ('Doe previously represented voters in the Florida House of Representatives.', 'previous_office', 'Florida House of Representatives'),
            ('Jane Doe is running for United States Senate.', 'seeking_office', 'United States Senate'),
            ('Doe seeks election to the U.S. Senate.', 'seeking_office', 'United States Senate')]:
            if quote in text:
                facts.append(BioFact(candidate='Jane Doe', relation=relation, value=value, quote=quote))
        return BioExtraction(facts=facts)
    if schema is GroundingVerdict:
        return GroundingVerdict(sentences=[dict(sentence_index=s['sentence_index'], supported=True, reason='entailed') for s in data['sentences']], preserves_distinctions=True, reason='consistent')
    if data['section'] == 'Biography':
        return SynthesisPlan(sentences=[dict(text='Jane Doe previously served in the Florida House of Representatives.', evidence_ids=[c['id'] for c in data['claims'] if c['relation']=='previous_office']),
            dict(text='She is seeking election to the United States Senate.', evidence_ids=[c['id'] for c in data['claims'] if c['relation']=='seeking_office'])])
    return SynthesisPlan(sentences=[dict(text='Jane Doe favors broader access to affordable health care for working families.', evidence_ids=[c['id'] for c in data['claims']])])


class SynthesisTests(unittest.TestCase):
    def test_compact_tables_deduplicate_quotes_preserve_context_and_provenance(self):
        p=fixture()
        for source in p.sources:
            source.retrieved_text='Only if funding is approved. ' + source.retrieved_text + ' This is conditional.'
        claims=policy_claims(p)['Healthcare']
        before=json.dumps(claims)
        packed=compact_evidence(claims)
        self.assertEqual(len(packed['evidence']),1)
        self.assertEqual(len(packed['sources']),2)
        self.assertIn('Only if funding',packed['evidence'][0]['before'])
        self.assertIn('conditional',packed['evidence'][0]['after'])
        self.assertEqual(packed['evidence'][0]['quote'],p.sources[0].findings[0].supporting_quote)
        self.assertEqual(len(packed['evidence'][0]['sources']),2)
        self.assertNotIn('source_url',json.dumps(packed))
        self.assertEqual(before,json.dumps(claims))
        self.assertLess(len(json.dumps(packed)),len(before))

    def client(self):
        client = Mock()
        client.generate_json.side_effect = model
        return client

    def test_actual_prose_semantic_consolidation_and_sources(self):
        p = fixture()
        f = p.sources[1].findings[0]
        f.neutral_summary = 'Favors affordable medical coverage for families.'
        before = [s.model_dump() for s in p.sources]
        result = synthesize_profile(p, self.client())
        summary = result.issues['Healthcare'].summary
        self.assertEqual(summary, 'Jane Doe favors broader access to affordable health care for working families.')
        self.assertNotIn('Reporting describes', summary)
        self.assertNotIn('Favors affordable medical', summary)
        self.assertEqual(len(policy_claims(p)['Healthcare']), 2)
        self.assertEqual(set(map(str,result.issues['Healthcare'].sources)), {'https://janedoe.com/','https://news.example/'})
        self.assertEqual(before, [s.model_dump() for s in p.sources])
        self.assertEqual(list(result.issues),list(CATEGORIES))
        self.assertEqual(result.issues['Economy'].sources,[])
        self.assertIsNone(result.issues['Economy'].summary)
        self.assertEqual(result.diagnostics['Economy']['status'],'insufficient_evidence')

    def test_biography_different_wording_and_role_distinction(self):
        p = fixture()
        p.sources[0].retrieved_text += ' Jane Doe served in the Florida House. Jane Doe is running for United States Senate.'
        p.sources[1].retrieved_text += ' Doe previously represented voters in the Florida House of Representatives. Doe seeks election to the U.S. Senate.'
        result = synthesize_profile(p,self.client())
        self.assertIn('previously served',result.biography.summary)
        self.assertIn('seeking election',result.biography.summary)
        self.assertEqual(len(result.biography.sources),2)
        self.assertEqual(result.diagnostics['biography']['status'],'ok')
        self.assertEqual(len(result.diagnostics['biography']['corroborated_facts']),2)
        p.sources[1].retrieved_text = p.sources[1].findings[0].supporting_quote
        result = synthesize_profile(p,self.client())
        self.assertIsNone(result.biography.summary)
        self.assertEqual(result.diagnostics['biography']['status'],'insufficient_corroboration')

    def test_candidate_attribution_in_multicandidate_biography(self):
        p = fixture()
        p.sources[0].retrieved_text += '\nCandidate: John Roe\nJane Doe served in the Florida House.'
        facts, failures = extract_facts(p,self.client())
        self.assertFalse(facts)
        self.assertFalse(failures)
        wrong = p.sources[1].findings[0].model_copy(update={'attributed_candidate':'John Roe'})
        p.sources[1].findings=[wrong]
        self.assertFalse(any('news.example' in str(c) for c in policy_claims(p)['Healthcare']))

    def test_unknown_ids_and_unsupported_prose_fail_closed(self):
        for mode in ('unknown_id','unsupported'):
            with self.subTest(mode=mode):
                client = self.client()
                def bad(prompt,schema):
                    if schema is SynthesisPlan and mode=='unknown_id':
                        return SynthesisPlan(sentences=[dict(text='Invented proposal.',evidence_ids=['invented'])])
                    if schema is GroundingVerdict:
                        return GroundingVerdict(sentences=[dict(sentence_index=0,supported=False,reason='New mechanism absent from quotes')],preserves_distinctions=False,reason='unsupported')
                    return model(prompt,schema)
                client.generate_json.side_effect=bad
                result=synthesize_profile(fixture(),client)
                self.assertIsNone(result.issues['Healthcare'].summary)
                self.assertEqual(result.issues['Healthcare'].sources,[])
                self.assertEqual(result.diagnostics['Healthcare']['status'],'unsupported_generated_claims')

    def test_conflicts_are_passed_to_verifier(self):
        p=fixture()
        opposite=p.sources[1].findings[0].model_copy(update={'neutral_summary':'Opposes expansion.', 'supporting_quote':'Jane Doe opposes expanding affordable health care.'})
        p.sources[1].findings.append(opposite)
        p.sources[1].retrieved_text += opposite.supporting_quote
        client=self.client()
        def check(prompt,schema):
            if schema is GroundingVerdict:
                self.assertIn('Jane Doe opposes expanding affordable health care.',prompt)
                return GroundingVerdict(sentences=[dict(sentence_index=0,supported=True,reason='Individual claim supported')],preserves_distinctions=False,reason='Hides opposition')
            return model(prompt,schema)
        client.generate_json.side_effect=check
        result=synthesize_profile(p,client)
        self.assertIsNone(result.issues['Healthcare'].summary)

    def test_api_failure_and_validation_failure_diagnostics(self):
        for error,status in [(RuntimeError('quota'),'api_failure'),(TypeError('malformed'),'validation_failure')]:
            client=Mock()
            client.generate_json.side_effect=error
            result=synthesize_profile(fixture(),client)
            self.assertEqual(result.diagnostics['Healthcare']['status'],status)
            self.assertIsNone(result.issues['Healthcare'].summary)

    def test_sentence_urls_only_come_from_cited_ids(self):
        p=fixture()
        p.sources[1].findings[0].neutral_summary='Different wording but same supported position.'
        client=self.client()
        def selected(prompt,schema):
            if schema is SynthesisPlan:
                return SynthesisPlan(sentences=[dict(text='Doe supports affordable health care.',evidence_ids=['Healthcare:0'])])
            return model(prompt,schema)
        client.generate_json.side_effect=selected
        result=synthesize_profile(p,client)
        self.assertEqual(list(map(str,result.issues['Healthcare'].sources)),['https://janedoe.com/'])

    def test_resynthesis_no_web_research_and_preserves_raw(self):
        with TemporaryDirectory() as directory:
            path=Path(directory)/'research.json'
            raw=fixture().model_dump(mode='json')
            raw['sources'][0]['debug_extension']={'untouched':True}
            path.write_text(json.dumps(raw),encoding='utf-8')
            with patch('sys.argv',['candidate_research.py','--resynthesize',str(path)]), patch('gemma_api_client.GemmaAPIClient',return_value=self.client()), patch('candidate_research.discover_sources') as discover, patch('candidate_research.fetch_source') as fetch:
                main()
            discover.assert_not_called()
            fetch.assert_not_called()
            output=json.loads(path.with_stem('research_profile').read_text())
            internal=json.loads((Path(directory)/'.cache/profile_research/research.json').read_text())
            self.assertEqual(raw['sources'],internal['sources'])
            self.assertEqual(raw,json.loads(path.read_text()))
            self.assertEqual(internal['profile']['synthesis_version'],SYNTHESIS_VERSION)
            self.assertEqual(set(output),{'candidate_name','office','biography','issues'})
            self.assertEqual(list(output['issues']),list(CATEGORIES))
            self.assertIsNotNone(output['issues']['Healthcare']['summary'])

    def test_same_position_merges_different_issue_labels_and_keeps_distinct_quotes(self):
        p=fixture()
        p.sources[1].findings[0].policy_issue='Medical care affordability'
        second=p.sources[1].findings[0]
        second.supporting_quote='Jane Doe supports affordable health care access for working families.'
        p.sources[1].retrieved_text=second.supporting_quote
        claims=policy_claims(p)['Healthcare']
        self.assertEqual(len(claims),1)
        self.assertEqual(len(claims[0]['evidence']),2)
        self.assertEqual(len(claims[0]['sources']),2)
        conditional=second.model_copy(update={'neutral_summary':'Supports expansion only if state funding is available.',
            'supporting_quote':'Jane Doe supports expansion only if state funding is available.'})
        p.sources[1].retrieved_text += '\n' + conditional.supporting_quote
        p.sources[1].findings.append(conditional)
        self.assertEqual(len(policy_claims(p)['Healthcare']),2)

    def test_old_synthesis_cache_regenerates_without_research(self):
        cached=fixture()
        cached.profile.synthesis_version=1
        with patch('sys.argv',['candidate_research.py','--candidate','Jane Doe','--office','United States Senate']), patch('candidate_research.save_clean_profile'), patch('candidate_research.read_cache',return_value=cached), patch('candidate_research.attach_profile') as synth, patch('candidate_research.write_cache') as save, patch('candidate_research.discover_sources') as discover, patch('candidate_research.research') as research:
            main()
        synth.assert_called_once()
        save.assert_called_once()
        discover.assert_not_called()
        research.assert_not_called()
