import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info, Bookmark, HelpCircle, DollarSign, School, ChevronDown, ChevronUp, Citrus, ThumbsUp, ThumbsDown, Sparkles, Scale, AlertCircle } from 'lucide-react';
import { Amendment, MOCK_AMENDMENTS } from '../data/mockBallotData';

interface AmendmentExplainerProps {
  savedAmendmentVotes: Record<string, 'yes' | 'no' | 'undecided'>;
  onSetVote: (amendmentId: string, vote: 'yes' | 'no' | 'undecided') => void;
}

export const AmendmentExplainer: React.FC<AmendmentExplainerProps> = ({
  savedAmendmentVotes,
  onSetVote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedOfficialText, setExpandedOfficialText] = useState<Record<string, boolean>>({});

  const categories = ['All', 'Environment', 'Governance', 'Education', 'Economy'];

  const filteredAmendments = selectedCategory === 'All'
    ? MOCK_AMENDMENTS
    : MOCK_AMENDMENTS.filter((a) => a.category === selectedCategory);

  const toggleOfficialText = (id: string) => {
    setExpandedOfficialText((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
      {/* Visual Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-orange-200/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs text-orange-950 font-extrabold bg-orange-100 px-3 py-1 rounded-full mb-1">
              <Citrus className="w-3.5 h-3.5 text-orange-600" />
              <span>Florida Constitutional Amendments</span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
              Constitutional Amendment Decoder
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
              Amendments change the Florida State Constitution permanently and require a <strong>60% supermajority</strong>. Here is what they actually do without the confusing legal jargon.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-orange-50 rounded-2xl border border-orange-200 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-orange-950'
                }`}
              >
                {cat === 'All' ? 'All (4)' : `${getCategoryIcon(cat)} ${cat}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Amendments Feed */}
      <div className="space-y-8">
        {filteredAmendments.map((amendment) => {
          const currentVote = savedAmendmentVotes[amendment.id];
          const isOfficialOpen = !!expandedOfficialText[amendment.id];
          const icon = getCategoryIcon(amendment.category);

          return (
            <div
              key={amendment.id}
              className="bg-white rounded-3xl border-2 border-orange-200/90 shadow-sm overflow-hidden transition-all"
            >
              {/* Card Title Banner */}
              <div className="p-6 sm:p-7 bg-[#FFFDF9] border-b border-orange-100">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-extrabold text-orange-600 bg-orange-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span>{icon}</span>
                        <span>Amendment {amendment.number}</span>
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="font-bold text-slate-700">{amendment.category}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 font-medium">Needs 60% of votes</span>
                    </div>

                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
                      {amendment.shortTitle}
                    </h3>
                  </div>

                  {/* Visual Vote Decision Selector */}
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-orange-200 shadow-2xs self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => onSetVote(amendment.id, 'yes')}
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
                      onClick={() => onSetVote(amendment.id, 'no')}
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
                      onClick={() => onSetVote(amendment.id, 'undecided')}
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

                {/* 1-Sentence Plain English Translation */}
                <div className="mt-4 p-4 rounded-2xl bg-orange-100/60 border border-orange-200 text-xs sm:text-sm text-orange-950 font-medium leading-relaxed">
                  <span className="font-extrabold block text-orange-900 mb-0.5">
                    💡 The 10-Second Translation:
                  </span>
                  {amendment.plainEnglishSummary}
                </div>
              </div>

              {/* Big Visual YES vs NO Split */}
              <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* YES BOX */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border-2 border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-950">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-base text-emerald-900">
                        If you vote YES
                      </h4>
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
                    <span>Supporters include: {amendment.supporters.join(', ')}</span>
                  </div>
                </div>

                {/* NO BOX */}
                <div className="p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-slate-900">
                    <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold">
                      <ThumbsDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-base text-slate-900">
                        If you vote NO
                      </h4>
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
                    <span>Opponents include: {amendment.opponents.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Visual Badges for College Students & Cost */}
              <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 flex items-start gap-3 text-xs">
                  <span className="text-2xl shrink-0">🏛️</span>
                  <div>
                    <strong className="font-extrabold text-orange-950 block mb-0.5">
                      Who This Affects:
                    </strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      All registered Florida voters, local taxpayers, and community public services across Florida's 67 counties.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-start gap-3 text-xs">
                  <span className="text-2xl shrink-0">💰</span>
                  <div>
                    <strong className="font-extrabold text-amber-950 block mb-0.5">
                      Cost to Taxpayers:
                    </strong>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {amendment.financialImpact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Legal Text Drawer Accordion */}
              <div className="px-6 py-3.5 bg-[#FFFDF9] border-t border-orange-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleOfficialText(amendment.id)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  <span>{isOfficialOpen ? 'Hide' : 'Inspect'} the complicated legal text</span>
                  {isOfficialOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <span className="text-[11px] text-slate-400">Florida Division of Elections Filing</span>
              </div>

              {isOfficialOpen && (
                <div className="p-6 bg-slate-900 text-slate-300 font-mono text-xs space-y-2 border-t border-slate-200 animate-fadeIn">
                  <span className="text-[10px] text-orange-400 uppercase tracking-widest block font-bold">
                    Official Florida Division of Elections Ballot Text
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
    </div>
  );
};
