import React, { useState } from 'react';
import { MapPin, Calendar, CheckCircle2, Bookmark, Scale, ArrowRight, Sparkles, Filter, AlertCircle, Info, ExternalLink, HelpCircle, Citrus, ThumbsUp, ThumbsDown, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Candidate, Amendment, VotingLocation, MOCK_CANDIDATES, MOCK_AMENDMENTS } from '../data/mockBallotData';

interface BallotDashboardProps {
  location: VotingLocation;
  onOpenLocationModal: () => void;
  onSelectCandidate: (candidate: Candidate) => void;
  onCompareCandidate: (candidate: Candidate) => void;
  onNavigateTab: (tab: string) => void;
  savedCandidateIds: string[];
  onToggleSaveCandidate: (id: string) => void;
  savedAmendmentVotes: Record<string, 'yes' | 'no' | 'undecided'>;
  onSetAmendmentVote: (id: string, vote: 'yes' | 'no' | 'undecided') => void;
}

export const BallotDashboard: React.FC<BallotDashboardProps> = ({
  location,
  onOpenLocationModal,
  onSelectCandidate,
  onCompareCandidate,
  onNavigateTab,
  savedCandidateIds,
  onToggleSaveCandidate,
  savedAmendmentVotes,
  onSetAmendmentVote,
}) => {
  // Ballot subsection switcher: "all" | "races" | "amendments"
  const [activeSubsection, setActiveSubsection] = useState<'all' | 'races' | 'amendments'>('all');
  const [expandedOfficialText, setExpandedOfficialText] = useState<Record<string, boolean>>({});

  // Group candidates strictly by their office (like an actual official ballot paper!)
  const candidateOffices = Array.from(new Set(MOCK_CANDIDATES.map((c) => c.office)));

  const toggleOfficialText = (id: string) => {
    setExpandedOfficialText((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalDecisions = savedCandidateIds.length + Object.keys(savedAmendmentVotes).length;
  const totalItems = candidateOffices.length + MOCK_AMENDMENTS.length;

  const getTopicIcon = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes('tuition') || t.includes('education') || t.includes('school')) return '🎓';
    if (t.includes('insurance') || t.includes('housing') || t.includes('rent')) return '🏠';
    if (t.includes('water') || t.includes('environment') || t.includes('springs')) return '🌊';
    if (t.includes('health')) return '🏥';
    if (t.includes('tax') || t.includes('economy') || t.includes('budget')) return '💼';
    return '📌';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Education':
        return '🎓';
      case 'Environment':
        return '🌊';
      case 'Governance':
        return '🗳️';
      case 'Economy':
        return '🏠';
      default:
        return '📜';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Official Polling & Precinct Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-orange-200/90 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-orange-950/80">
              <span className="font-extrabold text-orange-600 flex items-center gap-1 bg-orange-100/70 px-2.5 py-0.5 rounded-full">
                <Citrus className="w-3.5 h-3.5" />
                Official Florida Ballot Guide
              </span>
              <span>·</span>
              <span className="font-bold">{location.county}</span>
              <span>·</span>
              <span className="font-mono text-slate-500">{location.precinct}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                Official Ballot for {location.city}, FL ({location.zip})
              </h2>
              <button
                onClick={onOpenLocationModal}
                className="text-xs font-bold text-orange-700 hover:text-orange-900 bg-orange-100/80 hover:bg-orange-200 px-3 py-1.5 rounded-xl border border-orange-300 transition-colors cursor-pointer"
              >
                Change Address / ZIP
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
              <span>Assigned Polling Place: <strong>{location.pollingPlace}</strong> ({location.address})</span>
            </p>
          </div>

          {/* Key Dates Badge Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs bg-orange-50/60 p-4 rounded-2xl border border-orange-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-900/60 block">
                Early Voting Period
              </span>
              <span className="font-bold text-slate-900">
                {location.earlyVotingDates}
              </span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-orange-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-900/60 block">
                Election Day (7 AM – 7 PM)
              </span>
              <span className="font-extrabold text-orange-600 font-mono">
                {location.electionDay}
              </span>
            </div>
          </div>
        </div>

        {/* Progress & Quick Anchors */}
        <div className="pt-3 border-t border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">My Ballot Progress:</span>
            <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((totalDecisions / totalItems) * 100))}%` }}
              />
            </div>
            <span className="font-extrabold text-orange-600 font-mono">
              {totalDecisions} / {totalItems} decided
            </span>
          </div>

          <div className="text-slate-500 font-medium text-[11px]">
            *General Election Sample Ballot · Completely nonpartisan
          </div>
        </div>
      </div>

      {/* TWO PRIMARY SUBSECTIONS TOGGLE: 1. Races | 2. Amendments */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-1 p-1.5 bg-orange-100/70 rounded-2xl border border-orange-200">
          <button
            onClick={() => setActiveSubsection('all')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeSubsection === 'all'
                ? 'bg-white text-orange-950 shadow-xs'
                : 'text-orange-950/70 hover:text-orange-950'
            }`}
          >
            📋 Complete Ballot (All Items)
          </button>
          <button
            onClick={() => setActiveSubsection('races')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeSubsection === 'races'
                ? 'bg-white text-orange-950 shadow-xs'
                : 'text-orange-950/70 hover:text-orange-950'
            }`}
          >
            🏛️ 1. Contested Races ({candidateOffices.length})
          </button>
          <button
            onClick={() => setActiveSubsection('amendments')}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              activeSubsection === 'amendments'
                ? 'bg-white text-orange-950 shadow-xs'
                : 'text-orange-950/70 hover:text-orange-950'
            }`}
          >
            📜 2. Constitutional Amendments ({MOCK_AMENDMENTS.length})
          </button>
        </div>

        <button
          onClick={() => onNavigateTab('compare')}
          className="flex items-center gap-1.5 text-xs font-bold text-orange-950 bg-white hover:bg-orange-50 px-4 py-2 rounded-xl border border-orange-200 transition-colors shadow-2xs cursor-pointer"
        >
          <Scale className="w-3.5 h-3.5 text-orange-600" />
          <span>Launch Side-by-Side Compare</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* SUBSECTION 1: RACES (Split like an actual ballot!) */}
      {/* ========================================== */}
      {(activeSubsection === 'all' || activeSubsection === 'races') && (
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b-2 border-orange-200 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                <span>Part 1 of Ballot</span>
              </div>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                Candidates & Contested Races
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Organized by ballot office. Tap "+ Save to Plan" to select a candidate for your booth cheat sheet.
              </p>
            </div>
          </div>

          {/* Grouped by Office / Role */}
          <div className="space-y-10">
            {candidateOffices.map((officeName) => {
              const candidatesForOffice = MOCK_CANDIDATES.filter((c) => c.office === officeName);

              return (
                <div key={officeName} className="space-y-4">
                  {/* Official Ballot Role Header Bar */}
                  <div className="bg-slate-900 text-white px-5 py-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400 block">
                        Florida Official Ballot
                      </span>
                      <h4 className="font-display font-extrabold text-base sm:text-lg">
                        {officeName}
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                      Vote for One (1)
                    </span>
                  </div>

                  {/* Candidates Cards directly under this Role */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {candidatesForOffice.map((candidate) => {
                      const isSaved = savedCandidateIds.includes(candidate.id);
                      const partyBg =
                        candidate.party === 'Democratic'
                          ? 'bg-blue-600'
                          : candidate.party === 'Republican'
                          ? 'bg-red-600'
                          : candidate.party === 'Independent'
                          ? 'bg-orange-500'
                          : 'bg-emerald-600';

                      return (
                        <div
                          key={candidate.id}
                          className={`bg-white rounded-3xl border-2 transition-all p-5 flex flex-col justify-between space-y-4 hover:shadow-md ${
                            isSaved
                              ? 'border-orange-500 ring-2 ring-orange-100'
                              : 'border-orange-100 hover:border-orange-300'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Candidate Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold font-display text-sm shadow-xs ${partyBg}`}
                                >
                                  {candidate.name.split(' ').map((n) => n[0]).join('')}
                                </div>
                                <div>
                                  <h5 className="font-display font-extrabold text-base text-slate-900 leading-tight">
                                    {candidate.name}
                                  </h5>
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold mt-0.5">
                                    <span className={`w-2 h-2 rounded-full ${partyBg}`} />
                                    <span>{candidate.party} Party</span>
                                    <span>·</span>
                                    <span className="font-normal text-slate-500">{candidate.hometown}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Selection Button */}
                              <button
                                onClick={() => onToggleSaveCandidate(candidate.id)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                                  isSaved
                                    ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50'
                                }`}
                              >
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>{isSaved ? 'Selected ✓' : '+ Select'}</span>
                              </button>
                            </div>

                            {/* 1-Sentence Platform Focus */}
                            <div className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100 text-xs text-slate-700 space-y-1">
                              <span className="font-bold text-orange-950 block text-[11px] flex items-center gap-1">
                                <span>{getTopicIcon(candidate.keyIssues[0]?.topic || '')}</span>
                                <span>Top Stance: {candidate.keyIssues[0]?.topic}</span>
                              </span>
                              <p className="text-slate-600 leading-relaxed font-medium">
                                {candidate.keyIssues[0]?.headline}
                              </p>
                            </div>

                            {/* Quote snippet */}
                            <p className="text-[11px] text-slate-500 italic line-clamp-2 leading-relaxed">
                              {candidate.quotes}
                            </p>
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 border-t border-orange-100 flex items-center justify-between text-xs">
                            <button
                              onClick={() => onSelectCandidate(candidate)}
                              className="font-extrabold text-orange-600 hover:text-orange-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Full Profile & Record</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => onCompareCandidate(candidate)}
                              className="text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Scale className="w-3.5 h-3.5 text-slate-400" />
                              <span>Compare</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================== */}
      {/* SUBSECTION 2: CONSTITUTIONAL AMENDMENTS */}
      {/* ========================================== */}
      {(activeSubsection === 'all' || activeSubsection === 'amendments') && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b-2 border-orange-200 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 uppercase tracking-wider">
                <span>Part 2 of Ballot</span>
              </div>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                Florida Constitutional Amendments
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Constitutional amendments alter state law permanently and require at least <strong>60% voter approval</strong> to pass.
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {MOCK_AMENDMENTS.map((amendment) => {
              const currentVote = savedAmendmentVotes[amendment.id];
              const isOfficialOpen = !!expandedOfficialText[amendment.id];
              const categoryIcon = getCategoryIcon(amendment.category);

              return (
                <div
                  key={amendment.id}
                  className="bg-white rounded-3xl border-2 border-orange-200/90 shadow-sm overflow-hidden transition-all"
                >
                  {/* Card Title Bar */}
                  <div className="p-6 bg-[#FFFDF9] border-b border-orange-100">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-extrabold text-orange-600 bg-orange-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <span>{categoryIcon}</span>
                            <span>Amendment {amendment.number}</span>
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="font-bold text-slate-700">{amendment.category}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500 font-medium">Requires 60%</span>
                        </div>

                        <h4 className="font-display font-extrabold text-xl text-slate-900 leading-snug">
                          {amendment.shortTitle}
                        </h4>
                      </div>

                      {/* Vote Buttons */}
                      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-orange-200 shadow-2xs self-start sm:self-auto shrink-0">
                        <button
                          onClick={() => onSetAmendmentVote(amendment.id, 'yes')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            currentVote === 'yes'
                              ? 'bg-emerald-600 text-white shadow-xs scale-102'
                              : 'text-slate-700 hover:text-emerald-800 hover:bg-emerald-50'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4 text-emerald-500" />
                          <span>Vote YES</span>
                        </button>

                        <button
                          onClick={() => onSetAmendmentVote(amendment.id, 'no')}
                          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            currentVote === 'no'
                              ? 'bg-rose-600 text-white shadow-xs scale-102'
                              : 'text-slate-700 hover:text-rose-800 hover:bg-rose-50'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4 text-rose-500" />
                          <span>Vote NO</span>
                        </button>

                        <button
                          onClick={() => onSetAmendmentVote(amendment.id, 'undecided')}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            currentVote === 'undecided'
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          Skip
                        </button>
                      </div>
                    </div>

                    {/* 10-Second Translation */}
                    <div className="mt-4 p-4 rounded-2xl bg-orange-100/60 border border-orange-200 text-xs sm:text-sm text-orange-950 font-medium leading-relaxed">
                      <strong className="block text-orange-900 mb-0.5 font-extrabold">
                        💡 10-Second Translation:
                      </strong>
                      {amendment.plainEnglishSummary}
                    </div>
                  </div>

                  {/* YES vs NO Split */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* YES BOX */}
                    <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-950">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                          <ThumbsUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-display font-extrabold text-base text-emerald-900">
                            If you vote YES
                          </h5>
                          <span className="text-[11px] font-bold text-emerald-700">What changes:</span>
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-700">
                        {amendment.whatYesMeans.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold shrink-0">✓</span>
                            <span className="font-medium leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2 border-t border-emerald-200/80 text-[11px] text-emerald-900 font-semibold">
                        <span>Supporters: {amendment.supporters.join(', ')}</span>
                      </div>
                    </div>

                    {/* NO BOX */}
                    <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 text-slate-900">
                        <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold">
                          <ThumbsDown className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="font-display font-extrabold text-base text-slate-900">
                            If you vote NO
                          </h5>
                          <span className="text-[11px] font-bold text-slate-500">What stays the same:</span>
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-700">
                        {amendment.whatNoMeans.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-slate-400 font-bold shrink-0">•</span>
                            <span className="font-medium leading-relaxed">{point}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700 font-semibold">
                        <span>Opponents: {amendment.opponents.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Taxpayer Impact */}
                  <div className="px-6 pb-6">
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-start gap-3 text-xs">
                      <span className="text-2xl shrink-0">💰</span>
                      <div>
                        <strong className="font-extrabold text-amber-950 block mb-0.5">
                          Financial & Tax Impact:
                        </strong>
                        <p className="text-slate-700 leading-relaxed font-medium">
                          {amendment.financialImpact}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Official Legal Ballot Text Accordion */}
                  <div className="px-6 py-3.5 bg-[#FFFDF9] border-t border-orange-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => toggleOfficialText(amendment.id)}
                      className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                    >
                      <span>{isOfficialOpen ? 'Hide' : 'Inspect'} the official legal ballot language</span>
                      {isOfficialOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">Florida Division of Elections Filing</span>
                  </div>

                  {isOfficialOpen && (
                    <div className="p-6 bg-slate-900 text-slate-300 font-mono text-xs space-y-2 border-t border-slate-200 animate-fadeIn">
                      <span className="text-[10px] text-orange-400 uppercase tracking-widest block font-bold">
                        Official Legal Ballot Language
                      </span>
                      <p className="leading-relaxed text-slate-200 font-semibold">
                        {amendment.ballotTitle}
                      </p>
                      <p className="text-slate-400 text-[11px] leading-relaxed pt-2 border-t border-slate-800">
                        "{amendment.officialSummary}"
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
