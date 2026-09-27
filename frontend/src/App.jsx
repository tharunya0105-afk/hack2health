import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  ShieldAlert, 
  Radio, 
  Sliders, 
  Sparkles, 
  Columns, 
  Maximize2, 
  HelpCircle, 
  X, 
  ShieldCheck, 
  Heart, 
  Activity, 
  ChevronRight,
  TrendingUp,
  Hand,
  Info,
  Compass,
  Users
} from 'lucide-react';

import { ConversationBridge } from './components/ConversationBridge';
import { SocialOrbit } from './components/SocialOrbit';
import { PeerCircles } from './components/PeerCircles';
import { HowItWorks } from './components/HowItWorks';
import { SafetyDashboard } from './components/SafetyDashboard';
import { GuardianDashboard } from './components/GuardianDashboard';
import { GestureTranslation } from './components/GestureTranslation';
import { BridgeInsights } from './components/BridgeInsights';
import { SettingsPanel } from './components/SettingsPanel';
import { DEFAULT_USER_PROFILE } from '../../shared/types';

const STORAGE_KEYS = {
  PROFILE: 'neurobridge_user_profile_v3',
  TURNS: 'neurobridge_conversation_turns_v3',
  FEEDBACK: 'neurobridge_feedback_tally_v3'
};

// National Level Submission Problem & Solution Definition for Hack2Health 2.0
const PROBLEM_BANNER = {
  id: 'nb-explainer',
  problem: 'Many autistic youth are homeschooled or study in separate special schools, facing acute social isolation from mainstream peer life. Misreading hidden subtext (banter, teasing, ambiguous cues) and sensory fatigue create a severe barrier to taking part in normal community life.',
  solution: 'provides the complete solution: LifeConnect interactive scenario flight simulator for confident peer re-entry, inclusive Peer Circles, real-time two-way subtext translation across speech, typed AAC, switch-scanning, and gestures, plus an autonomous biometric safety net. Always wearer-controlled — empowering autistic individuals to live normal, connected lives.'
};

// Honest fresh start: NO pre-seeded conversation. Every turn in the timeline is real.
// The explainer banner + one-click demo prompts make an empty session instantly playable.
const DEFAULT_DEMO_TURNS = [];

const loadFromStorage = (key, fallback) => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage?.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`[LocalStorage Read Warning: ${key}]:`, e);
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage?.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.warn(`[LocalStorage Write Warning: ${key}]:`, e);
  }
};

export default function App() {
  // Remote Guardian Mode: open /?view=guardian on any other device (phone, second laptop)
  // to receive live SSE alerts + full console — the "guardian on their own phone" story.
  const isRemoteGuardianView = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('view') === 'guardian';

  const [activeTab, setActiveTab] = useState(isRemoteGuardianView ? 'guardian' : 'bridge'); // 'bridge' | 'gestures' | 'insights' | 'safety' | 'guardian' | 'settings'
  const [isSplitMode, setIsSplitMode] = useState(false); // Split screen for live pitch
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  
  // Hydrate userProfile from localStorage, falling back to DEFAULT_USER_PROFILE
  const [userProfile, setUserProfile] = useState(() => 
    loadFromStorage(STORAGE_KEYS.PROFILE, DEFAULT_USER_PROFILE)
  );
  const [lastDispatchedAlert, setLastDispatchedAlert] = useState(null);

  // Centralized Multimodal Conversation Turns Timeline: Hydrate from localStorage
  const [turns, setTurns] = useState(() => 
    loadFromStorage(STORAGE_KEYS.TURNS, DEFAULT_DEMO_TURNS)
  );

  const [analyzingTurnId, setAnalyzingTurnId] = useState(null);
  const [lastEmittedGesture, setLastEmittedGesture] = useState(null);
  const [engineInfo, setEngineInfo] = useState(null);
  const [activeClarifications, setActiveClarifications] = useState({
    forAutisticListener: null,
    forNeurotypicalListener: null
  });

  // Detect once whether the live LLM or the offline heuristic engine is running
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setEngineInfo({
          live: Boolean(data.llmConfigured ?? data.geminiConfigured),
          model: data.model || 'gemini-2.5-flash'
        });
      })
      .catch(() => setEngineInfo({ live: false, model: null }));
  }, []);

  // Load profile from backend if no localStorage copy exists
  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.profile) {
          // If no local storage exists yet, sync with backend
          const localProfile = loadFromStorage(STORAGE_KEYS.PROFILE, null);
          if (!localProfile) {
            setUserProfile(data.profile);
            saveToStorage(STORAGE_KEYS.PROFILE, data.profile);
          }
        }
      })
      .catch(err => console.warn('Profile fetch warning:', err));
  }, []);

  const handleToggleBridge = (newState) => {
    const updated = { ...userProfile, bridgeActive: newState };
    setUserProfile(updated);
    saveToStorage(STORAGE_KEYS.PROFILE, updated);
    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bridgeActive: newState })
    }).catch(e => console.warn(e));
  };

  const handleProfileUpdate = (newProfile) => {
    setUserProfile(newProfile);
    saveToStorage(STORAGE_KEYS.PROFILE, newProfile);
  };

  const handleResetDemoData = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem(STORAGE_KEYS.PROFILE);
        window.localStorage?.removeItem(STORAGE_KEYS.TURNS);
        window.localStorage?.removeItem(STORAGE_KEYS.FEEDBACK);
        window.localStorage?.removeItem('neurobridge_feedback_data');
        window.localStorage?.removeItem('neurobridge_custom_gestures_v3');
      }
    } catch (e) {
      console.warn('[LocalStorage Clear Warning]:', e);
    }

    setUserProfile(DEFAULT_USER_PROFILE);
    setTurns(DEFAULT_DEMO_TURNS);
    setActiveClarifications({ forAutisticListener: null, forNeurotypicalListener: null });
    setLastEmittedGesture(null);

    // Sync clean defaults back to backend
    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(DEFAULT_USER_PROFILE)
    }).catch(e => console.warn(e));
  };

  const handleTriggerAlert = (alert) => {
    setLastDispatchedAlert(alert);
    setUnreadAlerts(prev => prev + 1);
  };

  const dismissClarification = (targetListener, cardId) => {
    if (targetListener === 'autistic') {
      setActiveClarifications(prev => prev.forAutisticListener?.id === cardId ? { ...prev, forAutisticListener: null } : prev);
    } else {
      setActiveClarifications(prev => prev.forNeurotypicalListener?.id === cardId ? { ...prev, forNeurotypicalListener: null } : prev);
    }
  };

  const handleFeedback = async (targetListener, card, isHelpful) => {
    const feedbackType = isHelpful ? 'helpful' : 'unhelpful';
    if (targetListener === 'autistic') {
      setActiveClarifications(prev => prev.forAutisticListener ? {
        ...prev,
        forAutisticListener: { ...prev.forAutisticListener, feedbackGiven: feedbackType }
      } : prev);
    } else {
      setActiveClarifications(prev => prev.forNeurotypicalListener ? {
        ...prev,
        forNeurotypicalListener: { ...prev.forNeurotypicalListener, feedbackGiven: feedbackType }
      } : prev);
    }

    // Persist feedback tally to localStorage immediately
    try {
      const currentFeedback = loadFromStorage(STORAGE_KEYS.FEEDBACK, {});
      const cat = card.category || 'other';
      if (!currentFeedback[cat]) currentFeedback[cat] = { helpful: 0, unhelpful: 0 };
      if (isHelpful) currentFeedback[cat].helpful += 1;
      else currentFeedback[cat].unhelpful += 1;
      saveToStorage(STORAGE_KEYS.FEEDBACK, currentFeedback);
    } catch (_) {}

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: card.category || 'other',
          helpful: isHelpful,
          turnId: card.turnId
        })
      });
    } catch (err) {
      console.error('Feedback submit error:', err);
    }

    setTimeout(() => {
      dismissClarification(targetListener, card.id);
    }, 2000);
  };

  // Central Turn Dispatcher for Speech, Typed AAC, Switch-Scanning, and Gesture
  const handleAddTurn = async (text, speaker, inputMethod = 'speech') => {
    if (!text || !text.trim()) return;

    const turnId = `turn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newTurn = {
      id: turnId,
      speaker, // 'autistic' | 'neurotypical'
      inputMethod, // 'speech' | 'typed' | 'scanning' | 'gesture'
      text: text.trim(),
      timestamp: new Date().toISOString(),
      clarification: null,
      category: null,
      analyzed: false,
      dismissed: false
    };

    setTurns(prev => {
      const updated = [...prev, newTurn];
      saveToStorage(STORAGE_KEYS.TURNS, updated);
      return updated;
    });

    // If Bridge is toggled OFF, respect wearer control and skip LLM
    if (!userProfile.bridgeActive) {
      console.log('Bridge is toggled OFF by wearer. Skipping LLM analysis.');
      return;
    }

    setAnalyzingTurnId(turnId);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: newTurn.text,
          speaker: newTurn.speaker,
          inputMethod: newTurn.inputMethod
        })
      });

      const data = await res.json();
      const clarification = data.clarification;
      const category = data.category || 'other';
      const engine = data.engine || 'adaptive-heuristic-engine';

      setTurns(prev => {
        const updated = prev.map(t => t.id === turnId ? { ...t, clarification, category, analyzed: true } : t);
        saveToStorage(STORAGE_KEYS.TURNS, updated);
        return updated;
      });

      if (clarification) {
        const clarificationPayload = {
          id: `card_${Date.now()}`,
          turnId,
          speakerWhoSaidIt: speaker,
          inputMethod,
          text: clarification,
          category,
          engine,
          feedbackGiven: null,
          originalSaid: newTurn.text,
          expiresAt: Date.now() + 9500
        };

        if (speaker === 'autistic') {
          setActiveClarifications(prev => ({ ...prev, forNeurotypicalListener: clarificationPayload }));
        } else {
          setActiveClarifications(prev => ({ ...prev, forAutisticListener: clarificationPayload }));
        }

        setTimeout(() => {
          dismissClarification(speaker === 'autistic' ? 'neurotypical' : 'autistic', clarificationPayload.id);
        }, 9500);
      }
    } catch (err) {
      console.error('Turn analysis error:', err);
    } finally {
      setAnalyzingTurnId(null);
    }
  };

  const handleEmitGestureTurn = (gestureLabel) => {
    handleAddTurn(gestureLabel, 'autistic', 'gesture');
    setLastEmittedGesture({ label: gestureLabel, time: Date.now() });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo & Clinical Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('bridge')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  NeuroBridge
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v3 Multimodal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Autonomous Communication & Biometric Safety Net
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('bridge'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'bridge' && !isSplitMode
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Bridge</span>
            </button>

            <button
              onClick={() => { setActiveTab('lifeconnect'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lifeconnect' && !isSplitMode
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Social Re-Entry Flight Simulator for Homeschooled / Special-School youth"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>LifeConnect</span>
            </button>

            <button
              onClick={() => { setActiveTab('peercircles'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'peercircles' && !isSplitMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Inclusive Peer Circles & Shared Interests"
            >
              <Users className="w-4 h-4 text-purple-400" />
              <span>Peer Hub</span>
            </button>

            <button
              onClick={() => { setActiveTab('gestures'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'gestures' && !isSplitMode
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Hand className="w-4 h-4" />
              <span>Gestures</span>
            </button>

            <button
              onClick={() => { setActiveTab('insights'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'insights' && !isSplitMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Insights</span>
            </button>

            <button
              onClick={() => { setActiveTab('science'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'science' && !isSplitMode
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Science</span>
            </button>

            <button
              onClick={() => { setActiveTab('safety'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'safety' && !isSplitMode
                  ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Safety Net</span>
            </button>

            <button
              onClick={() => { setActiveTab('guardian'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'guardian' && !isSplitMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Guardian</span>
              {unreadAlerts > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setIsSplitMode(false); }}
              className={`px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'settings' && !isSplitMode
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Wearer Sovereignty & Settings"
            >
              <Sliders className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Quick Pitch Actions: Split Screen + Demo Guide Modal */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSplitMode(!isSplitMode)}
              className={`hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isSplitMode 
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30' 
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Split Screen: Wearer Safety on Left + Guardian Console on Right"
            >
              {isSplitMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
              <span>{isSplitMode ? 'Exit Split' : 'Pitch Split View'}</span>
            </button>

            <button
              onClick={() => setShowDemoModal(true)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/30 transition cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hack2Health 2.0 Pitch</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between px-2 py-2 border-t border-slate-800/80 bg-slate-950 text-xs overflow-x-auto space-x-1">
          <button
            onClick={() => setActiveTab('bridge')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'bridge' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Bridge
          </button>
          <button
            onClick={() => setActiveTab('lifeconnect')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'lifeconnect' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
          >
            LifeConnect
          </button>
          <button
            onClick={() => setActiveTab('peercircles')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'peercircles' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Peer Hub
          </button>
          <button
            onClick={() => setActiveTab('gestures')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'gestures' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Gestures
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'insights' ? 'bg-pink-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('science')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'science' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Science
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'safety' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Safety
          </button>
          <button
            onClick={() => setActiveTab('guardian')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'guardian' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Guardian
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'settings' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Settings
          </button>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Remote Guardian Link banner (when opened via /?view=guardian on a second device) */}
        {isRemoteGuardianView && (
          <div className="glass-panel rounded-2xl px-4 sm:px-6 py-4 mb-6 border border-rose-500/40 shadow-xl bg-rose-950/20">
            <div className="flex items-start sm:items-center gap-3 flex-col sm:flex-row sm:justify-between">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-white">Guardian Remote Link — Live</h2>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                    This device is acting as the guardian's console. Every safety trigger fires here <strong className="text-white">instantly via SSE</strong>, plus a real email with GPS. Keep this page open on your phone while the wearer demos on another device.
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                SSE Armed
              </span>
            </div>
          </div>
        )}
        
        {/* 10-Second Explainer Banner — problem + solution visible on every tab (hidden in remote guardian mode) */}
        {!isRemoteGuardianView && (
        <div id={PROBLEM_BANNER.id} className="glass-panel rounded-2xl px-4 sm:px-6 py-4 mb-6 border border-indigo-500/30 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs sm:text-sm leading-relaxed">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 px-2 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/40 font-bold uppercase tracking-wide text-[10px]">The Problem</span>
              <p className="text-slate-300">{PROBLEM_BANNER.problem}</p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 shrink-0 px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold uppercase tracking-wide text-[10px]">Our Bridge</span>
              <p className="text-slate-200"><strong className="text-white">NeuroBridge</strong> {PROBLEM_BANNER.solution}</p>
            </div>
          </div>
        </div>
        )}
        
        {/* Split Screen Mode for seamless presentation */}
        {isSplitMode ? (
          <div className="space-y-4">
            <div className="bg-indigo-950/40 p-3 rounded-2xl border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-200">
              <span className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-indigo-400" />
                <strong>Live Pitch Split View:</strong> Wearer Safety Net (Left) and Guardian Console (Right). Trigger "Simulate Fall" or "SOS" on the left and observe real-time SSE beacon on the right!
              </span>
              <button
                onClick={() => setIsSplitMode(false)}
                className="px-2 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
              >
                Close Split
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div>
                <SafetyDashboard 
                  userProfile={userProfile} 
                  onTriggerAlert={handleTriggerAlert}
                  lastDispatchedAlert={lastDispatchedAlert}
                />
              </div>
              <div>
                <GuardianDashboard 
                  userProfile={userProfile}
                  onAlertCountChange={(count) => setUnreadAlerts(count)} 
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'bridge' && (
              <ConversationBridge 
                userProfile={userProfile} 
                onToggleBridge={handleToggleBridge}
                turns={turns}
                onAddTurn={handleAddTurn}
                analyzingTurnId={analyzingTurnId}
                activeClarifications={activeClarifications}
                onFeedback={handleFeedback}
                onDismissClarification={dismissClarification}
                engineInfo={engineInfo}
                onClearChat={() => {
                  setTurns([]);
                  setActiveClarifications({ forAutisticListener: null, forNeurotypicalListener: null });
                }}
              />
            )}

            {activeTab === 'lifeconnect' && (
              <SocialOrbit userProfile={userProfile} />
            )}

            {activeTab === 'peercircles' && (
              <PeerCircles userProfile={userProfile} />
            )}

            {activeTab === 'gestures' && (
              <GestureTranslation 
                userProfile={userProfile}
                onEmitGestureTurn={handleEmitGestureTurn}
                lastEmittedGesture={lastEmittedGesture}
                onNavigateToBridge={() => setActiveTab('bridge')}
              />
            )}

            {activeTab === 'insights' && (
              <BridgeInsights />
            )}

            {activeTab === 'science' && (
              <HowItWorks />
            )}

            {activeTab === 'safety' && (
              <SafetyDashboard 
                userProfile={userProfile} 
                onTriggerAlert={handleTriggerAlert}
                lastDispatchedAlert={lastDispatchedAlert}
              />
            )}

            {activeTab === 'guardian' && (
              <GuardianDashboard 
                userProfile={userProfile}
                onAlertCountChange={(count) => setUnreadAlerts(count)} 
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPanel 
                userProfile={userProfile} 
                onUpdateProfile={handleProfileUpdate}
                onResetDemoData={handleResetDemoData}
              />
            )}
          </>
        )}

      </main>

      {/* Demo Script & Pitch Narration Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel max-w-2xl w-full rounded-3xl p-6 sm:p-8 border border-indigo-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">NeuroBridge • Hack2Health 2.0 National Pitch</h3>
                  <p className="text-xs text-slate-400">Social Re-Entry, Everyday Peer Connectivity & Biometric Safety Net</p>
                </div>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 my-6 text-xs sm:text-sm text-slate-300">

              {/* The National Differentiator — say this to the judges */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-indigo-950/60 to-slate-900/80 border border-emerald-500/40">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  The National Level Winning Differentiator (Say this to the judges)
                </div>
                <p className="text-slate-200 italic leading-relaxed">
                  "Over 30% of autistic youth are homeschooled or attend segregated special schools — isolated from mainstream peer life and dreading the 'Social Cliff'. NeuroBridge is the first complete ecosystem that solves this: giving them an interactive flight simulator (LifeConnect) to practice cafeteria and project scenarios, a live conversation wingman, inclusive peer circles, 4 sovereign AAC input channels, and an autonomous safety net. We don't watch autistic people from afar; we equip them to live normal, connected lives."
                </p>
              </div>

              {/* Step 1: LifeConnect */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs">1</span>
                  LifeConnect: The Social Re-Entry Flight Simulator
                </div>
                <p className="text-slate-300">
                  "Click the <strong>LifeConnect</strong> tab. Show the cafeteria lunchroom scenario: an autistic youth can practice joining a table, understand the peer's unwritten cues with the <em>Social Decoder</em>, receive neuro-affirming coaching tips, and use multi-tier response palettes or speech. Removes the fear of public social situations."
                </p>
              </div>

              {/* Step 2: Live Conversation Wingman */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
                  Live Conversation Bridge + Social Wingman & Turn Flowmeter
                </div>
                <p className="text-slate-300">
                  "Switch to the <strong>Bridge</strong> tab. Notice the new <em>Live Social Wingman</em>: the visual Turn-Taking Flowmeter ensures balanced conversation, the Interest Bridge links the peer's words to the wearer's passion (e.g. Robotics), and the <em>Tactful Exit Card</em> lets them set healthy sensory boundaries with one click."
                </p>
              </div>

              {/* Step 3: Peer Circles */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">3</span>
                  Inclusive Peer Hub: Passion-Anchored Connection
                </div>
                <p className="text-slate-300">
                  "Click the <strong>Peer Hub</strong> tab. Show the verified buddy circles (Robotics, Minecraft, Digital Art, Astronomy). Homeschooled students connect directly with inclusive peers around shared interests — no awkward small talk, camera optional, with parallel co-working."
                </p>
              </div>

              {/* Step 4: Calibrated Gestures & AAC */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-pink-400 font-bold mb-1">
                  <span className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-xs">4</span>
                  4 Sovereign Multimodal Input Channels
                </div>
                <p className="text-slate-300">
                  "Demonstrate that spoken voice, typed AAC, switch-scanning, and personally calibrated stim gestures flow into <em>one unified timeline</em>. MediaPipe HandLandmarker vectors match personal stims, and unmatched gestures produce silence rather than false guesses."
                </p>
              </div>

              {/* Step 5: Safety Net */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">5</span>
                  Autonomous Safety Net: Fall Simulation & Real Email Dispatch
                </div>
                <p className="text-slate-300">
                  "Click <strong>Pitch Split View</strong> and hit 'Simulate Fall'. Watch the Guardian Console illuminate instantly via Server-Sent Events, and a real email arrive with GPS coordinates and the wearer's Communication ID. Show the second-device <code>?view=guardian</code> remote phone link."
                </p>
              </div>

              {/* Step 6: Empirical Rigor */}
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-200">15/15 Automated Test Suite & Scientific Grounding:</strong> Run <code>node backend/test-suite.js</code> to prove all 15 clinical and multimodal tests pass with zero mock failures. Grounded in Dr. Damian Milton's Double Empathy Problem (2012) and CDC elopement statistics.
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                Got It — Ready to Pitch
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NeuroBridge Healthcare Innovation MVP • Hack2Heal 2.0</span>
          <span className="text-slate-400">Wearer-controlled adaptive communication & biometric safety net</span>
        </div>
      </footer>

    </div>
  );
}
