import React, { useState } from 'react';
import { CreditCard, Clock, Smartphone, ChevronRight, Check, HelpCircle, AlertCircle, Citrus, Sparkles } from 'lucide-react';

export const Voting101Banner: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps = [
    {
      id: 1,
      icon: CreditCard,
      color: 'bg-orange-500 text-white',
      badge: 'Step 1: ID',
      title: 'What to bring to the polls',
      shortText: 'Any valid Florida driver license, state ID, U.S. passport, or student ID works!',
      deepText: 'Florida law accepts 12 forms of government photo ID. If your primary photo ID lacks a signature, you can simply bring a second card with your signature (like a signed debit or credit card).',
    },
    {
      id: 2,
      icon: Clock,
      color: 'bg-amber-500 text-white',
      badge: 'Step 2: Time',
      title: 'When to vote',
      shortText: 'Polls open 7 AM – 7 PM. If you are in line by 7 PM, you vote!',
      deepText: 'Pro-tip: Early voting lets you vote at any early voting site in your county! On Election Day, go to your assigned precinct. As long as you are physically in line by 7:00 PM, you must legally be allowed to vote.',
    },
    {
      id: 3,
      icon: Smartphone,
      color: 'bg-emerald-500 text-white',
      badge: 'Step 3: In the booth',
      title: 'You can use your phone',
      shortText: 'Yes! You can legally look at your phone or cheat sheet inside the booth.',
      deepText: 'You do not have to memorize anything. Save your picks on orange you voting?, take a screenshot or print your cheat sheet, and reference it right inside the voting booth!',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-orange-50 via-amber-50/60 to-orange-50 border border-orange-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-900 bg-orange-200/60 px-3 py-1 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>First time voting or need a refresher? Zero stress.</span>
          </div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
            Voting in Florida in 3 Simple Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Everything you need to know to cast your ballot with total confidence.
          </p>
        </div>

        <span className="text-xs font-bold text-orange-700 bg-white border border-orange-200 px-3 py-1.5 rounded-xl self-start md:self-auto shadow-2xs">
          100% Legal & Nonpartisan Guide
        </span>
      </div>

      {/* 3 Visual Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isExpanded = activeStep === step.id;

          return (
            <div
              key={step.id}
              onClick={() => setActiveStep(isExpanded ? null : step.id)}
              className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:shadow-md ${
                isExpanded
                  ? 'border-orange-500 ring-2 ring-orange-200'
                  : 'border-orange-100 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${step.color} flex items-center justify-center shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-extrabold tracking-wide text-orange-800 bg-orange-50 border border-orange-200/70 px-2.5 py-0.5 rounded-full">
                  {step.badge}
                </span>
              </div>

              <h3 className="font-display font-bold text-base text-slate-900 mb-1.5">
                {step.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {step.shortText}
              </p>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-orange-100 text-xs text-orange-950 bg-orange-50/60 p-2.5 rounded-xl animate-fadeIn">
                  {step.deepText}
                </div>
              )}

              <div className="mt-3 flex items-center text-[11px] font-bold text-orange-600 gap-0.5">
                <span>{isExpanded ? 'Show less' : 'Tap for quick tip'}</span>
                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
