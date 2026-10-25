import unittest
from unittest.mock import Mock, patch

import httpx

from biography_facts import corroborate
from candidate_research import research
from schemas import CandidateProfile, ConsolidatedProfile, ModelFindings, ProfileSummary
from source_discovery import select_sources, DiscoveryPlan, canonical_url, official_candidate_page
from targeted_research import fill_evidence_gaps, needs_gap_research


class OfficialGapTests(unittest.TestCase):
    def test_official_bio_and_congress_member_do_not_need_election_keywords(self):
        items=[dict(url='https://moody.senate.gov/about/',title='Ashley Moody Biography'),
               dict(url='https://www.congress.gov/member/ashley-moody/M001000',title='Ashley Moody legislative record'),
               dict(url='https://dos.fl.gov/elections/2020/candidates',title='Ashley Moody election results 2020')]
        selected=select_sources(items,'Ashley Moody','United States Senate',context='Florida 2026')
        self.assertIn(canonical_url(items[0]['url']),selected)
        self.assertIn(items[1]['url'],selected)
        self.assertNotIn(items[2]['url'],selected)
        self.assertTrue(official_candidate_page('https://www.congress.gov/bill/119th-congress/senate-bill/123', 'Ashley Moody', 'Sponsor: Moody, Ashley [R-FL]'))
        self.assertFalse(official_candidate_page('https://www.congress.gov/bill/119th-congress/senate-bill/123', 'Ashley Moody', 'Sponsor: Another Senator [D-NY]'))

    def test_official_pages_pass_identity_gate_without_election_or_office_wording(self):
        text='Ashley Moody grew up in Plant City and worked as an attorney before entering public service. ' * 2
        model=Mock()
        model.excerpt.side_effect=lambda t:t
        model.analyze.return_value=ModelFindings(findings=[])
        urls=['https://moody.senate.gov/about/','https://other.senate.gov/about/']
        with httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(200,headers={'content-type':'text/html'},text=text))) as web, patch('web_fetcher.trafilatura.extract',return_value=text):
            p=research('Ashley Moody','United States Senate',urls,web,model,check_identity=True)
        self.assertTrue(p.sources[0].identity_verified)
        self.assertFalse(p.sources[1].identity_verified)
        self.assertEqual(model.analyze.call_count,1)

    def test_role_aliases_and_dates_do_not_block_office_corroboration(self):
        def fact(relation,value,qualifier,domain):
            return dict(relation=relation,value=value,qualifier=qualifier,domain=domain,
                document=domain,candidate='Ashley Moody',sources=['https://'+domain+'/'],quote=value)
        facts=[fact('current_office','U.S. Senator','sworn in January 2025','official.gov'),
               fact('current_office','United States Senator','','news.example'),
               fact('previous_office','Attorney General','','official.gov'),
               fact('previous_office','Attorney General','','news.example')]
        result=corroborate(facts)
        self.assertEqual(len(result),2)
        self.assertFalse(any(f['relation']=='seeking_office' for f in result))
        self.assertEqual(result[0]['qualifier'],'') # uncorroborated service date is not promoted

    def test_gaps_only_once_never_search_verified_or_verification_failed_categories(self):
        p=CandidateProfile(candidate_name='Ashley Moody',office='United States Senate',status='partial',sources=[])
        p.profile.biography=ProfileSummary(summary='Verified background.',sources=['https://example.org/'])
        p.profile.issues['Economy']=ProfileSummary(summary='A verified economic position.',sources=['https://example.org/'])
        p.profile.diagnostics={'Healthcare':{'status':'insufficient_evidence'},
                               'Economy':{'status':'ok'},'Immigration':{'status':'unsupported_generated_claims'}}
        client=Mock()
        client.blocked={}
        self.assertTrue(needs_gap_research(p))
        with patch('targeted_research.discover_sources',return_value=(DiscoveryPlan([],{},2),[])) as discover:
            for _ in range(2):
                fill_evidence_gaps(p,Mock(),client,'key',Mock(),Mock())
        self.assertEqual(discover.call_count,1)
        self.assertIn('healthcare',discover.call_args.kwargs['queries'][0].lower())
        self.assertFalse(needs_gap_research(p))

    def test_inaccessible_and_extraction_failure_diagnostics_differ(self):
        with httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(403))) as web:
            p=research('Ashley Moody','Senate',['https://example.org/'],web,Mock())
        self.assertEqual(p.sources[0].research_diagnostics['status'],'inaccessible_source')
        text='Ashley Moody supports healthcare reform for Florida families. '*3
        model=Mock()
        model.excerpt.side_effect=lambda t:t
        model.analyze.side_effect=ValueError('Invalid JSON')
        with httpx.Client(transport=httpx.MockTransport(lambda r:httpx.Response(200,headers={'content-type':'text/html'},text=text))) as web, patch('web_fetcher.trafilatura.extract',return_value=text):
            p=research('Ashley Moody','Senate',['https://example.org/'],web,model)
        self.assertEqual(p.sources[0].research_diagnostics['status'],'model_extraction_failure')
