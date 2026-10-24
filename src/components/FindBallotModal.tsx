import React, { useState } from 'react';
import { X, MapPin, Search, Check, AlertCircle, Building2, Citrus } from 'lucide-react';
import { FLORIDA_SAMPLE_LOCATIONS, VotingLocation } from '../data/mockBallotData';

interface FindBallotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentZip: string;
  onSelectLocation: (loc: VotingLocation) => void;
}

export const FindBallotModal: React.FC<FindBallotModalProps> = ({
  isOpen,
  onClose,
  currentZip,
  onSelectLocation,
}) => {
  const [inputZip, setInputZip] = useState(currentZip);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputZip.trim();
    if (!clean) {
      setErrorMsg('Please enter a Florida 5-digit ZIP code or street address.');
      return;
    }

    if (FLORIDA_SAMPLE_LOCATIONS[clean]) {
      onSelectLocation(FLORIDA_SAMPLE_LOCATIONS[clean]);
      setErrorMsg(null);
      onClose();
    } else {
      const dynamicLoc: VotingLocation = {
        zip: clean,
        city: clean.length === 5 ? `Florida Precinct ${clean}` : clean,
        county: 'Florida County Division',
        precinct: `Precinct ${clean.slice(0, 3) || '01'}`,
        pollingPlace: 'Local Community Civic Center & Public Library',
        address: `${clean} Civic Center Dr, Florida`,
        earlyVotingDates: 'Oct 24 – Nov 1, 2026 (8:30 AM – 6:30 PM)',
        electionDay: 'Tuesday, November 3, 2026 (7:00 AM – 7:00 PM)',
      };
      onSelectLocation(dynamicLoc);
      setErrorMsg(null);
      onClose();
    }
  };

  const handlePresetClick = (loc: VotingLocation) => {
    onSelectLocation(loc);
    setInputZip(loc.zip);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-orange-100 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FFFDF9] border-b border-orange-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center">
              <Citrus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-slate-900">
                Find My Florida Ballot
              </h3>
              <p className="text-xs text-slate-500">
                Enter your Florida address or ZIP code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Demo disclaimer notice */}
          <div className="p-3 bg-orange-50/80 border border-orange-200 rounded-2xl flex items-start gap-2.5 text-xs text-orange-950">
            <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Florida General Election Sample:</span>
              <p className="mt-0.5 text-orange-900/80">
                Select a Florida county or enter your ZIP code below to see your assigned polling location, early voting hours, and specific ballot items!
              </p>
            </div>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Florida ZIP Code or Address
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputZip}
                onChange={(e) => {
                  setInputZip(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="e.g. 32801, 33101, or 32202"
                className="w-full pl-10 pr-24 py-2.5 text-sm bg-[#FFFDF9] border border-orange-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all font-semibold"
              />
              <Search className="w-4 h-4 text-orange-400 absolute left-3.5" />
              <button
                type="submit"
                className="absolute right-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors cursor-pointer"
              >
                Lookup
              </button>
            </div>
            {errorMsg && (
              <p className="text-xs text-rose-600 font-bold">{errorMsg}</p>
            )}
          </form>

          {/* Florida Counties & Metros */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">
              Sample Florida Metro Areas:
            </span>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {Object.values(FLORIDA_SAMPLE_LOCATIONS).map((loc) => {
                const isSelected = loc.zip === currentZip;
                return (
                  <button
                    key={loc.zip}
                    onClick={() => handlePresetClick(loc)}
                    className={`w-full p-3 text-left rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50 border-orange-500 text-orange-950 shadow-2xs font-bold'
                        : 'bg-white hover:bg-orange-50/50 border-orange-100 text-slate-700'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">
                          {loc.city}, FL ({loc.zip})
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {loc.county}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        <span>{loc.pollingPlace}</span>
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-orange-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FFFDF9] border-t border-orange-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
