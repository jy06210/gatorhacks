import React from 'react';
import { X, Check, Bookmark, Scale, ExternalLink, GraduationCap, Briefcase, MapPin, DollarSign, Award, Quote, Citrus } from 'lucide-react';
import { Candidate } from '../data/mockBallotData';

interface CandidateModalProps {
  candidate: Candidate | null;
  onClose: () => void;
  onCompareWith: (cand: Candidate) => void;
  isSaved: boolean;
  onToggleSave: (candId: string) => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({
  candidate,
  onClose,
  onCompareWith,
  isSaved,
  onToggleSave,
}) => {
  if (!candidate) return null;

  const partyBg =
    candidate.party === 'Democratic'
      ? 'bg-blue-600 text-white'
      : candidate.party === 'Republican'
      ? 'bg-red-600 text-white'
      : candidate.party === 'Independent'
      ? 'bg-orange-500 text-white'
      : 'bg-emerald-600 text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 bg-[#FFFDF9] border-b border-orange-100 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-display shadow-sm ${partyBg}`}
            >
              {candidate.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-900">{candidate.party} Party</span>
                <span>·</span>
                <span>{candidate.office}</span>
                <span>·</span>
                <span>{candidate.category} Race</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900">
                {candidate.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {candidate.hometown}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(candidate.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSaved
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? 'In My Ballot Plan' : 'Add to Plan'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Quote Banner */}
          <div className="p-4 bg-orange-50/60 rounded-xl border border-orange-100 text-xs italic text-slate-700 flex items-start gap-3">
            <Quote className="w-5 h-5 text-orange-500 shrink-0 not-italic opacity-80" />
            <div>
              <p className="leading-relaxed">{candidate.quotes}</p>
              <span className="block mt-1 font-semibold text-slate-900 not-italic">
                — {candidate.name}, Official 2026 Candidate Statement
              </span>
            </div>
          </div>

          {/* Background & Qualifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-orange-100 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-2">
                <Briefcase className="w-4 h-4 text-orange-600" />
                <span>Professional Experience</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {candidate.experience}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-orange-100 bg-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-2">
                <GraduationCap className="w-4 h-4 text-orange-600" />
                <span>Education</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {candidate.education}
              </p>
            </div>
          </div>

          {/* Key Policy Positions */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
              <span>Key Policy Positions & Florida Issues</span>
              <span className="text-xs font-normal text-slate-500 font-mono">
                ({candidate.keyIssues.length} Topics Analyzed)
              </span>
            </h3>

            <div className="space-y-3">
              {candidate.keyIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-orange-100 bg-white hover:border-orange-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-bold text-slate-900">{issue.topic}</span>
                    <span className="text-[11px] text-orange-700 font-medium">Verified Platform</span>
                  </div>
                  <h4 className="font-semibold text-xs text-slate-800 mb-1 leading-snug">
                    {issue.headline}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {issue.details}
                  </p>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>Source: {issue.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Finance & Endorsements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Campaign Finance */}
            <div className="p-4 rounded-xl border border-orange-100 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  <span>Campaign Finance Snapshot</span>
                </div>
                <span className="text-xs font-semibold text-slate-900 font-mono">
                  {candidate.campaignFinance.totalRaised}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-orange-50/50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">Grassroots Small Donors</span>
                  <span className="font-bold text-slate-900 font-mono">{candidate.campaignFinance.smallDonorPercent}</span>
                </div>
                <div className="p-2 bg-orange-50/50 rounded-lg">
                  <span className="text-[10px] text-slate-500 block uppercase">PAC / Corporate Funds</span>
                  <span className="font-bold text-slate-900 font-mono">{candidate.campaignFinance.pacPercent}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                <strong className="text-slate-700">Top Donor Sectors:</strong>{' '}
                {candidate.campaignFinance.topSectors.join(', ')}
              </div>
            </div>

            {/* Notable Endorsements */}
            <div className="p-4 rounded-xl border border-orange-100 bg-white space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Award className="w-4 h-4 text-orange-600" />
                <span>Notable Florida Endorsements</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {candidate.topEndorsements.map((end, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                    <span>{end}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FFFDF9] border-t border-orange-100 flex items-center justify-between">
          <button
            onClick={() => onCompareWith(candidate)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-orange-950 bg-orange-100 hover:bg-orange-200 border border-orange-200 rounded-lg transition-colors"
          >
            <Scale className="w-4 h-4 text-orange-600" />
            <span>Compare with Competitor in This Race</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
