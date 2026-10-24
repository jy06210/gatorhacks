import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, HelpCircle, ArrowRight, Check, BookOpen, ExternalLink, RefreshCw, Citrus, CreditCard, Smartphone, Clock, ThumbsUp } from 'lucide-react';
import { MOCK_AI_KNOWLEDGE_BASE } from '../data/mockBallotData';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  followUps?: string[];
  visualCard?: {
    icon: string;
    title: string;
    bullets: string[];
  };
}

export const AskAIChat: React.FC = () => {
  const [tone, setTone] = useState<'plain' | 'student' | 'policy'>('plain');
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hey there! 🍊 I'm your orange you voting? guide.

No question is too simple! Whether you're voting for the first time or wondering what a ballot measure means, I break everything down into 10-second answers with zero legal jargon.

Tap one of the quick visual cards below or type any question!`,
      timestamp: 'Just now',
      followUps: [
        'Explain Amendment 2 like I am 20',
        'Compare Maya Rodriguez & David Vance on property insurance',
        'Can I vote using my Florida campus student ID?',
        'What does a Florida County Commissioner actually do?'
      ],
      sources: ['Florida Division of Elections 2026', 'Nonpartisan Public Records']
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let matchedEntry = MOCK_AI_KNOWLEDGE_BASE.find((entry) =>
        entry.keywords.some((k) => lower.includes(k))
      );

      let responseText = '';
      let visualCard: Message['visualCard'] = undefined;
      let responseSources = [
        'Florida Division of Elections 2026 Reference Guide',
        'Nonpartisan Legislative Policy Analysis'
      ];
      let followUps = [
        'Tell me more about Amendment 3',
        'How does Florida property insurance work?',
        'Where do candidates stand on college tuition?'
      ];

      if (lower.includes('student id') || lower.includes('id to vote') || lower.includes('what to bring')) {
        visualCard = {
          icon: '🪪',
          title: 'Florida Approved Voter ID Cheat Sheet',
          bullets: [
            'Florida Student ID (UF, UCF, FSU, UM, USF, etc.) ✓',
            'Florida Driver License or State ID card ✓',
            'U.S. Passport or Passport Card ✓',
            'Debit/Credit card with your photo & signature ✓',
            'Pro-Tip: If your student card lacks a signature, show a signed debit card as card #2!'
          ]
        };
      } else if (lower.includes('phone') || lower.includes('in the booth')) {
        visualCard = {
          icon: '📱',
          title: 'Can you use your phone in the voting booth?',
          bullets: [
            'YES! Under Florida state law, you can look at your phone in the voting booth.',
            'You can view your orange you voting? cheat sheet or photo notes.',
            'Only rule: You cannot take a selfie of your actual ballot paper!'
          ]
        };
      }

      if (matchedEntry) {
        if (tone === 'student') {
          responseText = `${matchedEntry.plainEnglish}\n\n🎓 Student Perspective:\n${matchedEntry.studentAngle}`;
        } else if (tone === 'policy') {
          responseText = `${matchedEntry.plainEnglish}\n\n🏛️ Legal & Policy Detail:\n${matchedEntry.policyAngle}`;
        } else {
          responseText = matchedEntry.plainEnglish;
        }
      } else {
        responseText = `Here is what you need to know about "${query}":

In Florida general elections, all candidate platforms and amendments are sourced from verified public candidate debates and legislative records.

• You can vote early on campus or at your local county early voting sites.
• Bring any valid Florida student ID or driver license.
• If you're in line before 7:00 PM on Election Day, you are legally entitled to vote!`;
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: 'Just now',
        sources: responseSources,
        followUps: followUps,
        visualCard: visualCard,
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Chat reset! Ask me anything about Florida candidates, ballot amendments, or voting rules! 🍊`,
        timestamp: 'Just now',
        followUps: [
          'Explain Amendment 2 like I am 20',
          'Compare Maya Rodriguez & David Vance on property insurance',
          'Can I vote using my Florida campus student ID?',
          'What does a Florida County Commissioner actually do?'
        ],
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fadeIn">
      {/* Visual Header */}
      <div className="bg-white p-6 rounded-3xl border-2 border-orange-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-xs">
              <Citrus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 lowercase">
                orange you <span className="text-orange-600">voting?</span> AI
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ask any question in plain English · Beginner & Student friendly
              </p>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Tone:</span>
            <div className="flex items-center gap-1 p-1 bg-orange-50 rounded-xl border border-orange-200">
              <button
                onClick={() => setTone('plain')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tone === 'plain'
                    ? 'bg-white text-orange-950 shadow-2xs'
                    : 'text-slate-600 hover:text-orange-950'
                }`}
              >
                ⚡ Simple
              </button>
              <button
                onClick={() => setTone('student')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tone === 'student'
                    ? 'bg-white text-orange-950 shadow-2xs'
                    : 'text-slate-600 hover:text-orange-950'
                }`}
              >
                🎒 Student Focus
              </button>
              <button
                onClick={() => setTone('policy')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  tone === 'policy'
                    ? 'bg-white text-orange-950 shadow-2xs'
                    : 'text-slate-600 hover:text-orange-950'
                }`}
              >
                🏛️ Deep Policy
              </button>
            </div>
            <button
              onClick={handleResetChat}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Instant Visual Question Cards */}
        <div className="pt-2 border-t border-orange-100">
          <span className="text-xs font-extrabold text-slate-700 block mb-2">
            Popular Beginner Questions (Tap to Ask):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleSend('Can I vote using my Florida campus student ID?')}
              className="p-2.5 bg-orange-50/70 hover:bg-orange-100 border border-orange-200 rounded-xl text-left text-xs font-bold text-orange-950 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🪪</span>
                <span>What ID do I need to bring?</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </button>

            <button
              onClick={() => handleSend('Can I bring my phone or cheat sheet into the voting booth?')}
              className="p-2.5 bg-orange-50/70 hover:bg-orange-100 border border-orange-200 rounded-xl text-left text-xs font-bold text-orange-950 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                <span>Can I use my phone in the booth?</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </button>

            <button
              onClick={() => handleSend('Explain Amendment 2 like I am 20')}
              className="p-2.5 bg-orange-50/70 hover:bg-orange-100 border border-orange-200 rounded-xl text-left text-xs font-bold text-orange-950 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🌊</span>
                <span>Explain Amendment 2 (Clean Water)</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </button>

            <button
              onClick={() => handleSend('Compare Maya Rodriguez & David Vance on property insurance')}
              className="p-2.5 bg-orange-50/70 hover:bg-orange-100 border border-orange-200 rounded-xl text-left text-xs font-bold text-orange-950 flex items-center justify-between transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <span>Who has a plan for property insurance?</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="bg-white rounded-3xl border-2 border-orange-200/90 shadow-sm overflow-hidden flex flex-col h-[520px]">
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Citrus className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white font-bold rounded-tr-xs'
                    : 'bg-[#FFFDF9] text-slate-800 border-2 border-orange-150 rounded-tl-xs space-y-3'
                }`}
              >
                <div className="whitespace-pre-line font-medium">{m.text}</div>

                {/* Visual Card if applicable */}
                {m.visualCard && (
                  <div className="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-950 space-y-2">
                    <div className="flex items-center gap-2 font-extrabold text-sm">
                      <span className="text-lg">{m.visualCard.icon}</span>
                      <span>{m.visualCard.title}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs font-medium">
                      {m.visualCard.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sources & Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="pt-2 border-t border-orange-100 text-[11px] text-slate-500 font-mono flex flex-wrap items-center gap-2">
                    <BookOpen className="w-3 h-3 text-orange-600" />
                    <span>Citations: {m.sources.join(' · ')}</span>
                  </div>
                )}

                {/* Follow-Ups */}
                {m.followUps && m.followUps.length > 0 && (
                  <div className="pt-2 border-t border-orange-100 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-orange-950/60 block">
                      Tap next question:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.followUps.map((f, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(f)}
                          className="text-[11px] bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-950 border border-orange-200 rounded-xl px-2.5 py-1 transition-colors flex items-center gap-1 font-bold cursor-pointer"
                        >
                          <span>{f}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-orange-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Citrus className="w-5 h-5 animate-citrus" />
              </div>
              <div className="bg-[#FFFDF9] border border-orange-200 rounded-2xl px-4 py-2.5 text-xs text-orange-900 flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span>Translating Florida election records into simple English...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#FFFDF9] border-t border-orange-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about voting, candidates, or Florida amendments..."
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-white border border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-6 py-3 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-[11px] text-slate-400 text-center font-medium">
            Strictly 100% nonpartisan · No endorsements · Zero political spin
          </div>
        </div>
      </div>
    </div>
  );
};
