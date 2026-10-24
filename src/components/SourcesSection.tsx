import React from 'react';
import { ShieldCheck, BookOpen, ExternalLink, CheckCircle2, FileText, Scale, Landmark, Info, Citrus } from 'lucide-react';

export const SourcesSection: React.FC = () => {
  const sourcesList = [
    {
      title: 'Florida Division of Elections (DOS)',
      type: 'Official State Records',
      description: 'Official candidate qualifying petitions, campaign treasurer filings, constitutional amendment ballot texts, and supervisor of elections precinct boundary records.',
      url: 'https://dos.myflorida.com/elections/',
      citationKey: 'FL-DOS-2026'
    },
    {
      title: 'Florida Office of Economic and Demographic Research (EDR)',
      type: 'Fiscal & Economic Analysis',
      description: 'Independent nonpartisan state agency responsible for calculating official Financial Impact Statements and revenue projections for all proposed constitutional amendments.',
      url: 'http://edr.state.fl.us/',
      citationKey: 'FL-EDR-FIS'
    },
    {
      title: 'Florida Senate & House Bill Information Systems',
      type: 'Legislative Voting History',
      description: 'Public roll-call voting records, committee debate transcripts, bill staff analyses, and statute revisions spanning the 2020–2026 legislative sessions.',
      url: 'https://www.flsenate.gov/Session/Bills',
      citationKey: 'FL-LEG-ARCHIVE'
    },
    {
      title: 'League of Women Voters of Florida',
      type: 'Civic Voter Education',
      description: 'Centuries-old nonpartisan civic organization providing detailed pro/con analyses, sponsor lists, and coalition breakdowns for state amendments.',
      url: 'https://lwvfl.org/',
      citationKey: 'LWV-FL-GUIDE'
    },
    {
      title: 'Project Vote Smart & Candidate Public Forums',
      type: 'Candidate Platforms',
      description: 'Direct candidate questionnaires, sworn debate statements, official campaign policy whitepapers, and verified video recordings from televised statewide debates.',
      url: 'https://justfacts.votesmart.org/',
      citationKey: 'VOTE-SMART-FL'
    },
    {
      title: 'The Florida Bar Judicial Evaluations',
      type: 'Judicial Retention Standards',
      description: 'Biennial confidential peer reviews by practicing Florida attorneys rating appellate and supreme court judges on integrity, legal knowledge, and impartiality.',
      url: 'https://www.floridabar.org/',
      citationKey: 'FL-BAR-JUDICIAL'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-orange-950">
          <Citrus className="w-4 h-4 text-orange-600" />
          <span>Radical Transparency & Nonpartisan Integrity</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900">
          Sources, Methodology & Verification
        </h2>
        <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
          <strong>orange you voting?</strong> never endorses candidates, never accepts campaign contributions, and never utilizes biased language. Every candidate profile, issue stance, and amendment translation links directly back to official state public filings and verified legislative records.
        </p>
      </div>

      {/* 4 Pillars of Nonpartisanship */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 bg-white rounded-xl border border-orange-100 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm font-display">
            01
          </div>
          <h4 className="font-display font-bold text-sm text-slate-900">
            Equal Real Estate & Weight
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            All certified candidates in a given race receive identical profile structures, issue categories, and equal summary word lengths.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-orange-100 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm font-display">
            02
          </div>
          <h4 className="font-display font-bold text-sm text-slate-900">
            Source-Grounded AI Guardrails
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our AI assistants are strictly grounded in indexed Florida public records, barred from taking political stances or recommending candidate votes.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-orange-100 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm font-display">
            03
          </div>
          <h4 className="font-display font-bold text-sm text-slate-900">
            Dual-Sided Amendment Analysis
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Amendments are always presented with verified "YES" arguments and verified "NO" arguments from active Florida citizen coalitions.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-orange-100 shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-sm font-display">
            04
          </div>
          <h4 className="font-display font-bold text-sm text-slate-900">
            Youth & Campus Neutrality
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            We empower first-time electors and college students to make their own informed decisions without patronizing spin or partisan pressure.
          </p>
        </div>
      </div>

      {/* Directory of Primary Data Sources */}
      <div className="space-y-4">
        <h3 className="font-display font-bold text-lg text-slate-900">
          Primary Election Data Sources Directory
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sourcesList.map((src, idx) => (
            <div
              key={idx}
              className="p-5 bg-white rounded-xl border border-orange-100 shadow-2xs hover:border-orange-300 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block mb-0.5">
                    {src.type}
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-900">
                    {src.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono bg-orange-50 text-orange-800 px-2 py-0.5 rounded font-semibold border border-orange-200">
                  {src.citationKey}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {src.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Public Domain Public Records</span>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1"
                >
                  <span>Verify at official site</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Florida Voting Rights & ID Checklist */}
      <div className="p-6 bg-[#FFFDF9] rounded-2xl border border-orange-200/80 space-y-4">
        <h3 className="font-display font-bold text-base text-slate-900">
          Official Florida Voter ID Reference Checklist
        </h3>
        <p className="text-xs text-slate-600">
          Florida law (F.S. § 101.043) requires one of the following current and valid forms of photo identification at the polling place:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-slate-700">
          <div className="p-2.5 bg-white rounded-lg border border-orange-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Florida Driver License / ID</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-orange-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>U.S. Passport / Passport Card</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-orange-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Student ID (Florida Campus)</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-orange-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Military / Veteran Health ID</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-orange-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Debit / Credit Card with photo</span>
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-orange-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Neighborhood Association ID</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 italic pt-1">
          *Note: If your Student ID card does not include your signature, Florida poll workers will simply ask you to present a secondary card with your signature (e.g., signed debit card).
        </div>
      </div>
    </div>
  );
};
