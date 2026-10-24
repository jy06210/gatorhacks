import React, { useState } from 'react';
import { ArrowRight, MapPin, Search, Citrus, ShieldCheck, Sparkles, Scale, BookOpen, Smartphone, CheckCircle2, ChevronRight, HelpCircle, Check, ThumbsUp, ThumbsDown, Building2 } from 'lucide-react';
import { FLORIDA_SAMPLE_LOCATIONS, VotingLocation } from '../data/mockBallotData';
import { Voting101Banner } from './Voting101Banner';

interface HeroProps {
  onExploreBallot: (customZipOrLoc?: string) => void;
  onOpenLocationModal: () => void;
  selectedLocation: VotingLocation;
  onSelectQuickLocation: (zip: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreBallot,
  onOpenLocationModal,
  selectedLocation,
  onSelectQuickLocation,
  onNavigateTab,
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = addressInput.trim();
    if (!clean) {
      setInputError('Please enter a Florida 5-digit ZIP code or street address.');
      return;
    }
    setInputError(null);
    onExploreBallot(clean);
  };

  const handleQuickPreset = (zip: string) => {
    onSelectQuickLocation(zip);
    setAddressInput(zip);
    onExploreBallot(zip);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF7ED]/50 to-[#FFFDF9] pt-6 pb-16 lg:pt-10 lg:pb-20 border-b border-orange-100">
      {/* Citrus background radial blooms */}
      <div className="absolute top-0 right-1/4 -mr-24 -mt-20 w-96 h-96 rounded-full bg-orange-200/40 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 -ml-24 w-80 h-80 rounded-full bg-amber-200/30 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-10">
        {/* Header Branding */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 border border-orange-200 rounded-full text-xs font-bold text-orange-950 shadow-2xs">
            <Citrus className="w-4 h-4 text-orange-600 animate-citrus" />
            <span>100% Nonpartisan Florida Voter Guide · General Public Tool</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
            <span className="lowercase">orange you </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
              voting?
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-700 font-medium leading-relaxed">
            Florida election language is confusing on purpose. <br className="hidden sm:inline" />
            Enter your address or ZIP to see your ballot split into simple, plain English summaries.
          </p>
        </div>

        {/* PROMINENT LANDING ACTION: Enter Address or ZIP */}
        <div className="max-w-2xl mx-auto bg-white p-5 sm:p-6 rounded-3xl shadow-xl border-2 border-orange-300 hover:border-orange-500 transition-all">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Enter Your Florida ZIP Code or Street Address:</span>
              </label>
              <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                Step 1 of 2
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setInputError(null);
                  }}
                  placeholder="e.g. 32801, 33101, or 100 Main St..."
                  className="w-full pl-11 pr-4 py-3.5 text-sm sm:text-base bg-[#FFFDF9] border border-orange-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 font-semibold placeholder:text-slate-400 shadow-2xs"
                />
                <Search className="w-5 h-5 text-orange-400 absolute left-3.5 top-3.5" />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 active:scale-98 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <span>Find My Ballot</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {inputError && (
              <p className="text-xs text-rose-600 font-bold">{inputError}</p>
            )}
          </form>

          {/* Florida City / Metro Area Quick Selectors */}
          <div className="pt-4 mt-3 border-t border-orange-100">
            <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Or select a sample Florida county / metro area:</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset('33101')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 border cursor-pointer ${
                  selectedLocation.zip === '33101'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border-orange-200'
                }`}
              >
                <div>
                  <div className="font-extrabold">Miami</div>
                  <div className="text-[10px] opacity-75">Miami-Dade County</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('32801')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 border cursor-pointer ${
                  selectedLocation.zip === '32801'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border-orange-200'
                }`}
              >
                <div>
                  <div className="font-extrabold">Orlando</div>
                  <div className="text-[10px] opacity-75">Orange County</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('33602')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 border cursor-pointer ${
                  selectedLocation.zip === '33602'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border-orange-200'
                }`}
              >
                <div>
                  <div className="font-extrabold">Tampa</div>
                  <div className="text-[10px] opacity-75">Hillsborough County</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('32202')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 border cursor-pointer ${
                  selectedLocation.zip === '32202'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border-orange-200'
                }`}
              >
                <div>
                  <div className="font-extrabold">Jacksonville</div>
                  <div className="text-[10px] opacity-75">Duval County</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('32301')}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center gap-2 border cursor-pointer ${
                  selectedLocation.zip === '32301'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                    : 'bg-orange-50/70 hover:bg-orange-100 text-orange-950 border-orange-200'
                }`}
              >
                <div>
                  <div className="font-extrabold">Tallahassee</div>
                  <div className="text-[10px] opacity-75">Leon County</div>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenLocationModal}
                className="p-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🔍 Other FL ZIP?</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Voting 101 Step Guide */}
        <Voting101Banner />

        {/* Visual "How We Simplify It" Before/After Demo Card */}
        <div className="bg-white rounded-3xl border border-orange-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
                Visual Comparison
              </span>
              <h3 className="font-display font-extrabold text-xl text-slate-900">
                How We Make Ballots Easy for Everyone
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              Official ballot text vs. orange you voting?
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* The Confusing Way */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 opacity-80">
              <div className="flex items-center gap-2 text-rose-700 font-bold">
                <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-xs">❌</span>
                <span>Traditional Confusing Ballot Text</span>
              </div>
              <p className="font-mono text-[11px] text-slate-500 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                "Shall Section 5 of Article XI of the State Constitution be amended to require that any proposed amendment or revision by citizen initiative must receive fifty-five percent elector concurrence..."
              </p>
              <span className="text-[11px] text-slate-400 block italic">
                Over 50 words of legal jargon that confuses everyday voters.
              </span>
            </div>

            {/* The orange you voting? Way */}
            <div className="p-4 bg-orange-50/80 rounded-2xl border-2 border-orange-300 space-y-2">
              <div className="flex items-center gap-2 text-orange-950 font-bold">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                <span>The orange you voting? Visual Translation</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-orange-200 space-y-2">
                <div className="flex items-start gap-2 text-emerald-800 font-semibold">
                  <ThumbsUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Vote YES:</strong> Makes citizen petitions pass with 55% instead of 60%.</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700 font-semibold">
                  <ThumbsDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>Vote NO:</strong> Keeps the hard 60% requirement in place.</span>
                </div>
              </div>
              <span className="text-[11px] text-orange-800 font-bold block">
                Explained in 5 seconds with zero spin.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
