import React from 'react';
import { Citrus, MapPin, Bookmark, Sparkles, Scale, BookOpen, Vote } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLocationZip: string;
  onOpenLocationModal: () => void;
  onOpenMyBallot: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedLocationZip,
  onOpenLocationModal,
  onOpenMyBallot,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-orange-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text wordmark */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Citrus className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-tight text-slate-900 whitespace-nowrap leading-none lowercase">
                orange you <span className="text-orange-600">voting?</span>
              </span>
              <span className="text-[10px] text-orange-950/60 font-semibold tracking-wide">Florida Election Guide</span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (Candidates and Amendments are inside "My Ballot") */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('home')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeTab === 'home'
                  ? 'border-orange-500 text-orange-950 font-extrabold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Enter Address
            </button>
            <button
              onClick={() => setActiveTab('ballot')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeTab === 'ballot'
                  ? 'border-orange-500 text-orange-950 font-extrabold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              My Ballot (Races & Amendments)
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeTab === 'compare'
                  ? 'border-orange-500 text-orange-950 font-extrabold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Compare Candidates
            </button>
            <button
              onClick={() => setActiveTab('ask-ai')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ask-ai'
                  ? 'border-orange-500 text-orange-950 font-extrabold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Ask AI
            </button>
            <button
              onClick={() => setActiveTab('sources')}
              className={`hover:text-orange-600 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeTab === 'sources'
                  ? 'border-orange-500 text-orange-950 font-extrabold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Sources & Ethics
            </button>
          </nav>

          {/* Zone 3: 1 primary action cluster */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenLocationModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-950 bg-orange-50/80 border border-orange-200/90 rounded-lg hover:bg-orange-100 transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>FL {selectedLocationZip}</span>
              <span className="text-orange-400 font-normal">· Change</span>
            </button>

            <button
              onClick={onOpenMyBallot}
              className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-orange-600 active:scale-98 transition-all shadow-xs whitespace-nowrap cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>My Ballot Plan</span>
              {savedCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white font-mono text-[11px] flex items-center justify-center font-bold">
                  {savedCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile subnavigation bar */}
      <div className="md:hidden flex items-center justify-around px-4 py-2 border-t border-orange-100 bg-[#FFFDF9] text-xs font-medium text-slate-600 gap-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`whitespace-nowrap ${activeTab === 'home' ? 'text-orange-600 font-bold' : ''}`}
        >
          Address
        </button>
        <button
          onClick={() => setActiveTab('ballot')}
          className={`whitespace-nowrap ${activeTab === 'ballot' ? 'text-orange-600 font-bold' : ''}`}
        >
          My Ballot
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`whitespace-nowrap ${activeTab === 'compare' ? 'text-orange-600 font-bold' : ''}`}
        >
          Compare
        </button>
        <button
          onClick={() => setActiveTab('ask-ai')}
          className={`whitespace-nowrap flex items-center gap-1 ${activeTab === 'ask-ai' ? 'text-orange-600 font-bold' : ''}`}
        >
          <Sparkles className="w-3 h-3 text-orange-500" />
          AI
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`whitespace-nowrap ${activeTab === 'sources' ? 'text-orange-600 font-bold' : ''}`}
        >
          Sources
        </button>
      </div>
    </header>
  );
};
