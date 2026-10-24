import React from 'react';
import { Citrus, Shield, ExternalLink, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenLocationModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onOpenLocationModal }) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold shadow-xs">
                <Citrus className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-xl text-white tracking-tight lowercase">
                orange you <span className="text-orange-500">voting?</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An independent, Florida civic intelligence guide helping first-time voters, college students, and Sunshine State residents unpeel their ballots without partisan spin.
            </p>

            <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
              <Shield className="w-3.5 h-3.5 text-orange-400" />
              <span>100% Nonpartisan · 0% Political Endorsements · Open Data</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-4 space-y-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block mb-2">
              Explore The Ballot
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <button
                onClick={() => onNavigateTab('home')}
                className="text-left hover:text-orange-400 transition-colors"
              >
                Enter Address / ZIP
              </button>
              <button
                onClick={() => onNavigateTab('ballot')}
                className="text-left hover:text-orange-400 transition-colors"
              >
                Ballot Dashboard
              </button>
              <button
                onClick={() => onNavigateTab('candidates')}
                className="text-left hover:text-orange-400 transition-colors"
              >
                Candidate Profiles
              </button>
              <button
                onClick={() => onNavigateTab('amendments')}
                className="text-left hover:text-orange-400 transition-colors"
              >
                Constitutional Amendments
              </button>
              <button
                onClick={() => onNavigateTab('compare')}
                className="text-left hover:text-orange-400 transition-colors"
              >
                Compare Candidates
              </button>
              <button
                onClick={() => onNavigateTab('ask-ai')}
                className="text-left hover:text-orange-400 transition-colors"
              >
                Ask AI Assistant
              </button>
            </div>
          </div>

          {/* Official Florida State Voting Resources */}
          <div className="md:col-span-3 space-y-2 text-xs">
            <span className="font-bold text-white uppercase tracking-wider block mb-2">
              Official FL Resources
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <a
                  href="https://registration.elections.myflorida.com/CheckVoterStatus"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  <span>Check Voter Registration Status</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://dos.myflorida.com/elections/for-voters/check-your-voter-status-and-polling-place/voter-precinct-lookup/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  <span>Find Official Supervisor of Elections</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://dos.myflorida.com/elections/for-voters/voting/military-and-overseas-citizens-voting/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-400 transition-colors flex items-center gap-1"
                >
                  <span>Vote-By-Mail & Military Ballots</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                Florida Voter Assistance Hotline: <span className="text-orange-400 font-mono font-bold">1-866-308-6739</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal Notice */}
        <div className="pt-8 border-t border-slate-900 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            orange you voting? · Nonpartisan Florida Civic Literacy Prototype · Fictional demonstration candidates and amendments for hackathon evaluation.
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with care for Sunshine State voters 🍊</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
