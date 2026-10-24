import React, { useState } from 'react';
import { Scale, Check, ArrowRight, Bookmark, AlertCircle, Info, Sparkles, ChevronRight, Citrus, ThumbsUp, DollarSign } from 'lucide-react';
import { Candidate, MOCK_CANDIDATES, COMPARISON_TOPICS } from '../data/mockBallotData';

interface CompareCandidatesProps {
  initialCandidateA?: Candidate | null;
  onOpenCandidate: (c: Candidate) => void;
  savedCandidateIds: string[];
  onToggleSave: (id: string) => void;
}

export const CompareCandidates: React.FC<CompareCandidatesProps> = ({
  initialCandidateA,
  onOpenCandidate,
  savedCandidateIds,
  onToggleSave,
}) => {
  const offices = Array.from(new Set(MOCK_CANDIDATES.map((c) => c.office)));
  const [selectedOffice, setSelectedOffice] = useState<string>(
    initialCandidateA ? initialCandidateA.office : 'Governor of Florida'
  );

  const availableCandidates = MOCK_CANDIDATES.filter((c) => c.office === selectedOffice);

  const [candidateAId, setCandidateAId] = useState<string>(
    initialCandidateA ? initialCandidateA.id : availableCandidates[0]?.id || ''
  );
  const [candidateBId, setCandidateBId] = useState<string>(
    availableCandidates[1]?.id || availableCandidates[0]?.id || ''
  );

  const candidateA = MOCK_CANDIDATES.find((c) => c.id === candidateAId) || availableCandidates[0];
  const candidateB = MOCK_CANDIDATES.find((c) => c.id === candidateBId) || availableCandidates[1] || availableCandidates[0];

  const handleOfficeChange = (office: string) => {
    setSelectedOffice(office);
    const inOffice = MOCK_CANDIDATES.filter((c) => c.office === office);
    if (inOffice.length > 0) {
      setCandidateAId(inOffice[0].id);
      setCandidateBId(inOffice[1]?.id || inOffice[0].id);
    }
  };

  const getPartyBadge = (party: string) => {
    switch (party) {
      case 'Democratic':
        return { bg: 'bg-blue-600', text: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'Republican':
        return { bg: 'bg-red-600', text: 'text-red-700 bg-red-50 border-red-200' };
      case 'Independent':
        return { bg: 'bg-orange-500', text: 'text-orange-700 bg-orange-50 border-orange-200' };
      default:
        return { bg: 'bg-emerald-600', text: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
  };

  const getTopicIcon = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes('education') || t.includes('tuition')) return '🎓';
    if (t.includes('insurance') || t.includes('housing')) return '🏠';
    if (t.includes('healthcare') || t.includes('mental')) return '🏥';
    if (t.includes('economic') || t.includes('tax')) return '💼';
    if (t.includes('water') || t.includes('coastal')) return '🌊';
    return '📌';
  };

  const getStance = (candidate: Candidate, topicKeyword: string) => {
    return candidate.keyIssues.find((issue) =>
      issue.topic.toLowerCase().includes(topicKeyword.toLowerCase().slice(0, 5))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Visual Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-orange-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-orange-950 font-extrabold bg-orange-100 px-3 py-1 rounded-full mb-1">
              <Scale className="w-3.5 h-3.5 text-orange-600" />
              <span>Side-by-Side Candidate Matchup</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              Compare Florida Candidates
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Pick two candidates in any race to see their key stances side-by-side in simple English.
            </p>
          </div>

          {/* Race Selector Dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <label className="text-xs font-extrabold text-slate-700 whitespace-nowrap">
              Select Race:
            </label>
            <select
              value={selectedOffice}
              onChange={(e) => handleOfficeChange(e.target.value)}
              className="text-xs font-extrabold bg-orange-50 border-2 border-orange-200 rounded-2xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
            >
              {offices.map((office) => (
                <option key={office} value={office}>
                  {office}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Candidate Selector Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-orange-100">
          {/* Candidate A Picker */}
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 flex items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-orange-900/70 mb-1">
                Candidate 1
              </label>
              <select
                value={candidateAId}
                onChange={(e) => setCandidateAId(e.target.value)}
                className="w-full text-xs font-extrabold text-slate-900 bg-white border border-orange-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
              >
                {availableCandidates.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === candidateBId}>
                    {c.name} ({c.party})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Candidate B Picker */}
          <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 flex items-center justify-between gap-3">
            <div className="flex-1">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-orange-900/70 mb-1">
                Candidate 2
              </label>
              <select
                value={candidateBId}
                onChange={(e) => setCandidateBId(e.target.value)}
                className="w-full text-xs font-extrabold text-slate-900 bg-white border border-orange-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
              >
                {availableCandidates.map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === candidateAId}>
                    {c.name} ({c.party})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Overview Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate A Visual Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-orange-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${getPartyBadge(candidateA.party).bg} text-white font-bold text-lg flex items-center justify-center font-display shadow-xs`}>
                {candidateA.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-900">
                  {candidateA.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${getPartyBadge(candidateA.party).text}`}>
                  {candidateA.party} Party
                </span>
              </div>
            </div>

            <button
              onClick={() => onToggleSave(candidateA.id)}
              className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                savedCandidateIds.includes(candidateA.id)
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50'
              }`}
              title="Add to My Ballot Plan"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs text-slate-700 leading-relaxed font-medium">
            <strong>In 1 sentence:</strong> {candidateA.quotes.replace(/"/g, '')}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Campaign Funds</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">{candidateA.campaignFinance.totalRaised}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Small Grassroots Donors</span>
              <span className="font-extrabold text-emerald-700 font-mono text-sm">{candidateA.campaignFinance.smallDonorPercent}</span>
            </div>
          </div>
        </div>

        {/* Candidate B Visual Card */}
        <div className="bg-white p-6 rounded-3xl border-2 border-orange-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl ${getPartyBadge(candidateB.party).bg} text-white font-bold text-lg flex items-center justify-center font-display shadow-xs`}>
                {candidateB.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <h3 className="font-display font-extrabold text-xl text-slate-900">
                  {candidateB.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${getPartyBadge(candidateB.party).text}`}>
                  {candidateB.party} Party
                </span>
              </div>
            </div>

            <button
              onClick={() => onToggleSave(candidateB.id)}
              className={`p-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                savedCandidateIds.includes(candidateB.id)
                  ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-orange-50'
              }`}
              title="Add to My Ballot Plan"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs text-slate-700 leading-relaxed font-medium">
            <strong>In 1 sentence:</strong> {candidateB.quotes.replace(/"/g, '')}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Campaign Funds</span>
              <span className="font-extrabold text-slate-900 font-mono text-sm">{candidateB.campaignFinance.totalRaised}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Small Grassroots Donors</span>
              <span className="font-extrabold text-emerald-700 font-mono text-sm">{candidateB.campaignFinance.smallDonorPercent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Issue Comparison Matrix */}
      <div className="space-y-4">
        <h3 className="font-display font-extrabold text-xl text-slate-900 flex items-center gap-2">
          <span>Compare on Florida Issues</span>
          <span className="text-xs font-normal text-slate-500">(Plain English side-by-side)</span>
        </h3>

        <div className="space-y-4">
          {COMPARISON_TOPICS.map((topic, idx) => {
            const stanceA = getStance(candidateA, topic);
            const stanceB = getStance(candidateB, topic);
            const icon = getTopicIcon(topic);

            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border-2 border-orange-100 overflow-hidden shadow-2xs hover:border-orange-300 transition-all"
              >
                {/* Topic Header Strip */}
                <div className="px-6 py-3.5 bg-orange-50/70 border-b border-orange-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span className="font-display font-extrabold text-sm sm:text-base text-slate-900">
                      {topic}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-orange-700 bg-white border border-orange-200 px-2.5 py-0.5 rounded-full">
                    Top Priority
                  </span>
                </div>

                {/* Side-by-Side Visual Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-orange-100">
                  {/* Candidate A Stance */}
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase block">
                      {candidateA.name} ({candidateA.party})
                    </span>
                    {stanceA ? (
                      <>
                        <div className="p-2.5 rounded-xl bg-orange-50/40 border border-orange-100 text-xs font-bold text-orange-950">
                          {stanceA.headline}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {stanceA.details}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific public platform recorded.</p>
                    )}
                  </div>

                  {/* Candidate B Stance */}
                  <div className="p-5 space-y-2">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase block">
                      {candidateB.name} ({candidateB.party})
                    </span>
                    {stanceB ? (
                      <>
                        <div className="p-2.5 rounded-xl bg-orange-50/40 border border-orange-100 text-xs font-bold text-orange-950">
                          {stanceB.headline}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {stanceB.details}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific public platform recorded.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
