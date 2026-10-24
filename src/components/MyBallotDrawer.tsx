import React, { useState } from 'react';
import { X, Bookmark, Printer, Check, Trash2, HelpCircle, MapPin, Share2, CheckCircle2, Citrus } from 'lucide-react';
import { Candidate, Amendment, VotingLocation, MOCK_CANDIDATES, MOCK_AMENDMENTS } from '../data/mockBallotData';

interface MyBallotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedCandidateIds: string[];
  onRemoveCandidate: (id: string) => void;
  savedAmendmentVotes: Record<string, 'yes' | 'no' | 'undecided'>;
  onRemoveAmendmentVote: (id: string) => void;
  location: VotingLocation;
}

export const MyBallotDrawer: React.FC<MyBallotDrawerProps> = ({
  isOpen,
  onClose,
  savedCandidateIds,
  onRemoveCandidate,
  savedAmendmentVotes,
  onRemoveAmendmentVote,
  location,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!isOpen) return null;

  const savedCandidates = MOCK_CANDIDATES.filter((c) => savedCandidateIds.includes(c.id));
  const votedAmendments = MOCK_AMENDMENTS.filter((a) => savedAmendmentVotes[a.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    let summaryText = `🍊 MY FLORIDA 2026 BALLOT PLAN (orange you voting?)\n`;
    summaryText += `Polling Place: ${location.pollingPlace}\n`;
    summaryText += `Early Voting: ${location.earlyVotingDates}\n\n`;

    if (savedCandidates.length > 0) {
      summaryText += `CANDIDATE PICKS:\n`;
      savedCandidates.forEach((c) => {
        summaryText += `• ${c.office}: ${c.name} (${c.party})\n`;
      });
      summaryText += `\n`;
    }

    if (votedAmendments.length > 0) {
      summaryText += `AMENDMENT DECISIONS:\n`;
      votedAmendments.forEach((a) => {
        const vote = savedAmendmentVotes[a.id]?.toUpperCase();
        summaryText += `• Amendment ${a.number} (${a.shortTitle}): Vote ${vote}\n`;
      });
    }

    navigator.clipboard.writeText(summaryText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slideInRight border-l border-orange-100">
        {/* Drawer Header */}
        <div className="p-6 bg-[#FFFDF9] border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <Citrus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                My Florida Ballot Plan
              </h3>
              <p className="text-xs text-slate-500">
                {location.city}, FL ({location.zip}) · Legal to take into booth
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-orange-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Polling reminder */}
          <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-100 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-orange-950 block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              Your Polling Site:
            </span>
            <p className="font-semibold text-slate-800">{location.pollingPlace}</p>
            <p className="text-slate-500">{location.address}</p>
            <div className="pt-1 text-[11px] text-orange-700 font-mono font-semibold">
              Election Day: {location.electionDay}
            </div>
          </div>

          {/* Empty state */}
          {savedCandidates.length === 0 && votedAmendments.length === 0 && (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mx-auto">
                <Citrus className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-sm text-slate-800">
                Your Ballot Plan is Empty
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                As you browse candidates and amendments, click the bookmark icon or "Vote YES / NO" buttons to add them to your personalized cheat sheet.
              </p>
            </div>
          )}

          {/* Saved Candidates */}
          {savedCandidates.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Saved Candidates ({savedCandidates.length})
              </span>
              <div className="space-y-2">
                {savedCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white rounded-xl border border-orange-100 shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 block">
                        {c.office}
                      </span>
                      <h5 className="font-display font-bold text-xs text-slate-900">
                        {c.name}
                      </h5>
                      <span className="text-[11px] text-slate-500">
                        {c.party} Party · {c.hometown}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveCandidate(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove candidate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Amendment Decisions */}
          {votedAmendments.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Amendment Decisions ({votedAmendments.length})
              </span>
              <div className="space-y-2">
                {votedAmendments.map((a) => {
                  const vote = savedAmendmentVotes[a.id];
                  const badgeColor =
                    vote === 'yes'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : vote === 'no'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300';

                  return (
                    <div
                      key={a.id}
                      className="p-3 bg-white rounded-xl border border-orange-100 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-orange-600">
                            Amendment {a.number}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}>
                            Vote {vote}
                          </span>
                        </div>
                        <h5 className="font-display font-semibold text-xs text-slate-900 leading-snug">
                          {a.shortTitle}
                        </h5>
                      </div>

                      <button
                        onClick={() => onRemoveAmendmentVote(a.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove decision"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Florida Legal Note */}
          <div className="p-3 bg-orange-50/70 rounded-xl border border-orange-200/80 text-[11px] text-orange-950 leading-relaxed">
            <strong className="block mb-0.5 font-bold">Florida Voter Rights Tip:</strong>
            Yes, you are legally permitted by Florida state election law to bring your phone or a printed paper sample ballot sheet into the voting booth to help you remember your votes!
          </div>
        </div>

        {/* Drawer Actions */}
        <div className="p-4 bg-[#FFFDF9] border-t border-orange-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              disabled={savedCandidates.length === 0 && votedAmendments.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-orange-50 disabled:opacity-50 rounded-xl transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>

            <button
              onClick={handleCopySummary}
              disabled={savedCandidates.length === 0 && votedAmendments.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 rounded-xl transition-colors shadow-2xs"
            >
              {copySuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 text-center"
          >
            Continue Browsing Ballot
          </button>
        </div>
      </div>
    </div>
  );
};
