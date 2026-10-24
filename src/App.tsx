/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FindBallotModal } from './components/FindBallotModal';
import { BallotDashboard } from './components/BallotDashboard';
import { CandidateModal } from './components/CandidateModal';
import { CompareCandidates } from './components/CompareCandidates';
import { AskAIChat } from './components/AskAIChat';
import { SourcesSection } from './components/SourcesSection';
import { MyBallotDrawer } from './components/MyBallotDrawer';
import { Footer } from './components/Footer';
import {
  Candidate,
  VotingLocation,
  FLORIDA_SAMPLE_LOCATIONS,
  MOCK_CANDIDATES,
  MOCK_AMENDMENTS,
} from './data/mockBallotData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMyBallotOpen, setIsMyBallotOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<VotingLocation>(
    FLORIDA_SAMPLE_LOCATIONS['32801'] // Default to Orlando / Orange County
  );

  // Candidate modal state
  const [activeCandidateModal, setActiveCandidateModal] = useState<Candidate | null>(null);

  // Target candidate when navigating to compare tool
  const [candidateToCompare, setCandidateToCompare] = useState<Candidate | null>(null);

  // User ballot selections (persisted in localStorage)
  const [savedCandidateIds, setSavedCandidateIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('orangeyouvoting_candidates');
      return stored ? JSON.parse(stored) : ['gov-maya-rodriguez'];
    } catch {
      return ['gov-maya-rodriguez'];
    }
  });

  const [savedAmendmentVotes, setSavedAmendmentVotes] = useState<Record<string, 'yes' | 'no' | 'undecided'>>(() => {
    try {
      const stored = localStorage.getItem('orangeyouvoting_amendments');
      return stored ? JSON.parse(stored) : { 'amendment-2': 'yes' };
    } catch {
      return { 'amendment-2': 'yes' };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('orangeyouvoting_candidates', JSON.stringify(savedCandidateIds));
    } catch {
      // storage unavailable
    }
  }, [savedCandidateIds]);

  useEffect(() => {
    try {
      localStorage.setItem('orangeyouvoting_amendments', JSON.stringify(savedAmendmentVotes));
    } catch {
      // storage unavailable
    }
  }, [savedAmendmentVotes]);

  const handleToggleSaveCandidate = (candidateId: string) => {
    setSavedCandidateIds((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
  };

  const handleSetAmendmentVote = (amendmentId: string, vote: 'yes' | 'no' | 'undecided') => {
    setSavedAmendmentVotes((prev) => ({
      ...prev,
      [amendmentId]: vote,
    }));
  };

  const handleRemoveCandidateFromPlan = (id: string) => {
    setSavedCandidateIds((prev) => prev.filter((cId) => cId !== id));
  };

  const handleRemoveAmendmentFromPlan = (id: string) => {
    setSavedAmendmentVotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleCompareFromCandidate = (candidate: Candidate) => {
    setCandidateToCompare(candidate);
    setActiveCandidateModal(null);
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSelectLocation = (zip: string) => {
    if (FLORIDA_SAMPLE_LOCATIONS[zip]) {
      setSelectedLocation(FLORIDA_SAMPLE_LOCATIONS[zip]);
    }
  };

  // Called when user submits address on landing page
  const handleExploreFromLanding = (inputQuery?: string) => {
    if (inputQuery) {
      const clean = inputQuery.trim();
      if (FLORIDA_SAMPLE_LOCATIONS[clean]) {
        setSelectedLocation(FLORIDA_SAMPLE_LOCATIONS[clean]);
      } else if (clean.length > 0) {
        // Build dynamic location
        setSelectedLocation({
          zip: clean,
          city: clean.length === 5 ? `Florida Precinct ${clean}` : clean,
          county: 'Florida County Division',
          precinct: `Precinct ${clean.slice(0, 3) || '01'}`,
          pollingPlace: 'Local Community Civic Center & Public Library',
          address: `${clean} Civic Center Dr, Florida`,
          earlyVotingDates: 'Oct 24 – Nov 1, 2026 (8:30 AM – 6:30 PM)',
          electionDay: 'Tuesday, November 3, 2026 (7:00 AM – 7:00 PM)',
        });
      }
    }
    setActiveTab('ballot');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalSavedCount = savedCandidateIds.length + Object.keys(savedAmendmentVotes).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-slate-800 font-body selection:bg-orange-200 selection:text-orange-950">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        selectedLocationZip={selectedLocation.zip}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenMyBallot={() => setIsMyBallotOpen(true)}
        savedCount={totalSavedCount}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* The Landing Page where you enter your ZIP code / address */}
            <Hero
              onExploreBallot={handleExploreFromLanding}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              selectedLocation={selectedLocation}
              onSelectQuickLocation={handleQuickSelectLocation}
              onNavigateTab={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Live Preview of Ballot Dashboard for currently loaded address */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-slate-900">
                    Your Official Florida Ballot: {selectedLocation.city}, FL
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Showing contested races and constitutional amendments for {selectedLocation.county}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('ballot');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer"
                >
                  Open Full Ballot Screen →
                </button>
              </div>

              <BallotDashboard
                location={selectedLocation}
                onOpenLocationModal={() => setIsLocationModalOpen(true)}
                onSelectCandidate={(cand) => setActiveCandidateModal(cand)}
                onCompareCandidate={handleCompareFromCandidate}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                savedCandidateIds={savedCandidateIds}
                onToggleSaveCandidate={handleToggleSaveCandidate}
                savedAmendmentVotes={savedAmendmentVotes}
                onSetAmendmentVote={handleSetAmendmentVote}
              />
            </div>
          </div>
        )}

        {/* Both Candidates & Amendments live cleanly inside My Ballot */}
        {activeTab === 'ballot' && (
          <BallotDashboard
            location={selectedLocation}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onSelectCandidate={(cand) => setActiveCandidateModal(cand)}
            onCompareCandidate={handleCompareFromCandidate}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            savedCandidateIds={savedCandidateIds}
            onToggleSaveCandidate={handleToggleSaveCandidate}
            savedAmendmentVotes={savedAmendmentVotes}
            onSetAmendmentVote={handleSetAmendmentVote}
          />
        )}

        {activeTab === 'compare' && (
          <CompareCandidates
            initialCandidateA={candidateToCompare}
            onOpenCandidate={(cand) => setActiveCandidateModal(cand)}
            savedCandidateIds={savedCandidateIds}
            onToggleSave={handleToggleSaveCandidate}
          />
        )}

        {activeTab === 'ask-ai' && <AskAIChat />}

        {activeTab === 'sources' && <SourcesSection />}
      </main>

      {/* Candidate Profile Modal */}
      <CandidateModal
        candidate={activeCandidateModal}
        onClose={() => setActiveCandidateModal(null)}
        onCompareWith={handleCompareFromCandidate}
        isSaved={activeCandidateModal ? savedCandidateIds.includes(activeCandidateModal.id) : false}
        onToggleSave={handleToggleSaveCandidate}
      />

      {/* Location / ZIP Search Modal */}
      <FindBallotModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentZip={selectedLocation.zip}
        onSelectLocation={(loc) => setSelectedLocation(loc)}
      />

      {/* "My Ballot Plan" Cheat Sheet Drawer */}
      <MyBallotDrawer
        isOpen={isMyBallotOpen}
        onClose={() => setIsMyBallotOpen(false)}
        savedCandidateIds={savedCandidateIds}
        onRemoveCandidate={handleRemoveCandidateFromPlan}
        savedAmendmentVotes={savedAmendmentVotes}
        onRemoveAmendmentVote={handleRemoveAmendmentFromPlan}
        location={selectedLocation}
      />

      {/* Footer */}
      <Footer
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
      />
    </div>
  );
}
