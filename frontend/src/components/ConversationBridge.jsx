import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MessageSquare, 
  Sparkles, 
  X, 
  RotateCcw, 
  Send, 
  ToggleLeft, 
  ToggleRight, 
  BrainCircuit, 
  CheckCircle, 
  Lightbulb, 
  ThumbsUp, 
  ThumbsDown,
  Keyboard,
  Sliders,
  Hand,
  Radio,
  Timer,
  Heart,
  Smile,
  Compass,
  Battery,
  LogOut,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export function ConversationBridge({ 
  userProfile, 
  onToggleBridge,
  turns: propTurns,
  onAddTurn: propOnAddTurn,
  analyzingTurnId: propAnalyzingTurnId,
  activeClarifications: propActiveClarifications,
  onFeedback: propOnFeedback,
  onDismissClarification: propOnDismissClarification,
  onClearChat: propOnClearChat,
  engineInfo: propEngineInfo
}) {
  const isBridgeActive = userProfile?.bridgeActive ?? true;
  const isScanningEnabledByProfile = userProfile?.scanningKeyboardEnabled ?? false;
  const scanningSpeed = userProfile?.scanningSpeedMs || 1200;

  // Local fallback turns if not provided via props — honest empty start
  const [localTurns, setLocalTurns] = useState([]);

  const turns = propTurns || localTurns;
  const setTurns = setLocalTurns;

  // Engine transparency badge: shows whether the live LLM or offline fallback produced a card
  const [healthInfo, setHealthInfo] = useState(propEngineInfo || null);
  useEffect(() => {
    if (propEngineInfo) {
      setHealthInfo(propEngineInfo);
      return;
    }
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setHealthInfo({ live: Boolean(d.llmConfigured ?? d.geminiConfigured), model: d.model }))
      .catch(() => setHealthInfo({ live: false, model: null }));
  }, [propEngineInfo]);

  const EngineBadge = ({ engine }) => {
    const isLlm = engine === 'gemini-llm';
    return (
      <span
        title={isLlm ? `Live AI model: ${healthInfo?.model || 'Google Gemini'}` : 'On-device fallback rules engine (works fully offline)'}
        className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border font-mono uppercase tracking-wide ${
          isLlm
            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
            : 'bg-slate-700/40 text-slate-400 border-slate-600/60'
        }`}
      >
        <Sparkles className="w-2.5 h-2.5" />
        {isLlm ? 'Live AI' : 'Offline Engine'}
      </span>
    );
  };

  const [localAnalyzingId, setLocalAnalyzingId] = useState(null);
  const analyzingTurnId = propAnalyzingTurnId !== undefined ? propAnalyzingTurnId : localAnalyzingId;

  const [manualText, setManualText] = useState({ autistic: '', neurotypical: '' });

  const [localClarifications, setLocalClarifications] = useState({
    forAutisticListener: null,
    forNeurotypicalListener: null
  });
  const activeClarifications = propActiveClarifications || localClarifications;

  // Switch-Scanning On-Screen Keyboard State
  const [isScanningOpen, setIsScanningOpen] = useState(isScanningEnabledByProfile);
  const [scanningBuffer, setScanningBuffer] = useState('');
  const [activeTileIndex, setActiveTileIndex] = useState(0);
  const [isScanningPaused, setIsScanningPaused] = useState(false);

  useEffect(() => {
    setIsScanningOpen(isScanningEnabledByProfile);
  }, [isScanningEnabledByProfile]);

  const chatBottomRef = useRef(null);

  // Auto scroll to latest conversation
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // Social Wingman & Turn-Taking Flowmeter State
  const [wingmanData, setWingmanData] = useState(null);
  const [isWingmanOpen, setIsWingmanOpen] = useState(true);

  // Compute Turn-Taking ratio
  const autisticTurnsCount = turns.filter(t => t.speaker === 'autistic').length;
  const ntTurnsCount = turns.filter(t => t.speaker === 'neurotypical').length;
  const totalTurns = autisticTurnsCount + ntTurnsCount;
  const alexPercent = totalTurns > 0 ? Math.round((autisticTurnsCount / totalTurns) * 100) : 50;
  const peerPercent = totalTurns > 0 ? 100 - alexPercent : 50;

  // Poll wingman data when turns arrive
  useEffect(() => {
    if (turns.length === 0) return;
    const lastTurn = turns[turns.length - 1];
    fetch('/api/social-connect/wingman', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lastTurnText: lastTurn.text,
        speaker: lastTurn.speaker,
        specialInterests: userProfile?.specialInterests || ["Robotics & Python", "Astronomy", "Gaming"]
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWingmanData(data);
        }
      })
      .catch(err => console.warn('Wingman fetch notice:', err));
  }, [turns.length]);

  // Turn Dispatcher: routes to propOnAddTurn or local
  const handleDispatchTurn = async (text, speaker, inputMethod = 'speech') => {
    if (!text || !text.trim()) return;

    if (propOnAddTurn) {
      propOnAddTurn(text, speaker, inputMethod);
      return;
    }

    const turnId = `turn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newTurn = {
      id: turnId,
      speaker,
      inputMethod,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      clarification: null,
      category: null,
      analyzed: false,
      dismissed: false
    };

    setTurns(prev => [...prev, newTurn]);

    if (!isBridgeActive) return;

    setLocalAnalyzingId(turnId);
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

      setTurns(prev => prev.map(t => t.id === turnId ? { ...t, clarification, category, analyzed: true } : t));

      if (clarification) {
        const clarificationPayload = {
          id: `card_${Date.now()}`,
          turnId,
          speakerWhoSaidIt: speaker,
          inputMethod,
          text: clarification,
          category,
          feedbackGiven: null,
          originalSaid: newTurn.text,
          expiresAt: Date.now() + 9500
        };

        if (speaker === 'autistic') {
          setLocalClarifications(prev => ({ ...prev, forNeurotypicalListener: clarificationPayload }));
        } else {
          setLocalClarifications(prev => ({ ...prev, forAutisticListener: clarificationPayload }));
        }

        setTimeout(() => {
          dismissClarification(speaker === 'autistic' ? 'neurotypical' : 'autistic', clarificationPayload.id);
        }, 9500);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLocalAnalyzingId(null);
    }
  };

  const handleFeedback = async (targetListener, card, isHelpful) => {
    if (propOnFeedback) {
      propOnFeedback(targetListener, card, isHelpful);
      return;
    }

    const feedbackType = isHelpful ? 'helpful' : 'unhelpful';
    if (targetListener === 'autistic') {
      setLocalClarifications(prev => prev.forAutisticListener ? {
        ...prev,
        forAutisticListener: { ...prev.forAutisticListener, feedbackGiven: feedbackType }
      } : prev);
    } else {
      setLocalClarifications(prev => prev.forNeurotypicalListener ? {
        ...prev,
        forNeurotypicalListener: { ...prev.forNeurotypicalListener, feedbackGiven: feedbackType }
      } : prev);
    }

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
      console.error('Feedback error:', err);
    }

    setTimeout(() => {
      dismissClarification(targetListener, card.id);
    }, 2000);
  };

  const dismissClarification = (targetListener, cardId) => {
    if (propOnDismissClarification) {
      propOnDismissClarification(targetListener, cardId);
      return;
    }
    if (targetListener === 'autistic') {
      setLocalClarifications(prev => prev.forAutisticListener?.id === cardId ? { ...prev, forAutisticListener: null } : prev);
    } else {
      setLocalClarifications(prev => prev.forNeurotypicalListener?.id === cardId ? { ...prev, forNeurotypicalListener: null } : prev);
    }
  };

  // Web Speech API hook
  const {
    isSupported,
    isListening,
    activeSpeaker,
    interimText,
    error: speechError,
    startListening,
    stopListening
  } = useSpeechRecognition({
    onTranscriptComplete: (text, speaker) => handleDispatchTurn(text, speaker, 'speech')
  });

  // Manual typed send
  const handleManualSend = (speaker) => {
    const text = manualText[speaker];
    if (!text.trim()) return;
    handleDispatchTurn(text, speaker, 'typed');
    setManualText(prev => ({ ...prev, [speaker]: '' }));
  };

  const handlePresetClick = (speaker, presetPhrase) => {
    handleDispatchTurn(presetPhrase, speaker, 'typed');
  };

  const clearChat = () => {
    if (propOnClearChat) {
      propOnClearChat();
    } else {
      setTurns([]);
      setLocalClarifications({ forAutisticListener: null, forNeurotypicalListener: null });
    }
  };

  // =========================================================================
  // SWITCH-SCANNING ON-SCREEN KEYBOARD LOGIC & TILES
  // =========================================================================
  const scanningTiles = [
    // Top Row: High-frequency Fast Phrases
    { id: 'p1', label: 'YES', type: 'phrase', text: 'Yes.' },
    { id: 'p2', label: 'NO', type: 'phrase', text: 'No.' },
    { id: 'p3', label: 'I NEED A BREAK', type: 'phrase', text: 'I need a break.' },
    { id: 'p4', label: 'WAIT', type: 'phrase', text: 'Please wait.' },
    { id: 'p5', label: 'THANK YOU', type: 'phrase', text: 'Thank you.' },
    { id: 'p6', label: 'HELP', type: 'phrase', text: 'I need help.' },

    // Letters A-Z
    { id: 'l_a', label: 'A', type: 'letter' },
    { id: 'l_b', label: 'B', type: 'letter' },
    { id: 'l_c', label: 'C', type: 'letter' },
    { id: 'l_d', label: 'D', type: 'letter' },
    { id: 'l_e', label: 'E', type: 'letter' },
    { id: 'l_f', label: 'F', type: 'letter' },
    { id: 'l_g', label: 'G', type: 'letter' },
    { id: 'l_h', label: 'H', type: 'letter' },
    { id: 'l_i', label: 'I', type: 'letter' },
    { id: 'l_j', label: 'J', type: 'letter' },
    { id: 'l_k', label: 'K', type: 'letter' },
    { id: 'l_l', label: 'L', type: 'letter' },
    { id: 'l_m', label: 'M', type: 'letter' },
    { id: 'l_n', label: 'N', type: 'letter' },
    { id: 'l_o', label: 'O', type: 'letter' },
    { id: 'l_p', label: 'P', type: 'letter' },
    { id: 'l_q', label: 'Q', type: 'letter' },
    { id: 'l_r', label: 'R', type: 'letter' },
    { id: 'l_s', label: 'S', type: 'letter' },
    { id: 'l_t', label: 'T', type: 'letter' },
    { id: 'l_u', label: 'U', type: 'letter' },
    { id: 'l_v', label: 'V', type: 'letter' },
    { id: 'l_w', label: 'W', type: 'letter' },
    { id: 'l_x', label: 'X', type: 'letter' },
    { id: 'l_y', label: 'Y', type: 'letter' },
    { id: 'l_z', label: 'Z', type: 'letter' },

    // Bottom Action Row
    { id: 'a_space', label: '␣ SPACE', type: 'action', action: 'space' },
    { id: 'a_back', label: '⌫ BACK', type: 'action', action: 'backspace' },
    { id: 'a_clear', label: 'CLEAR', type: 'action', action: 'clear' },
    { id: 'a_send', label: 'SEND ↵', type: 'action', action: 'send' }
  ];

  // Auto-scan cycle timer
  useEffect(() => {
    if (!isScanningOpen || isScanningPaused) return;

    const timer = setInterval(() => {
      setActiveTileIndex(prev => (prev + 1) % scanningTiles.length);
    }, scanningSpeed);

    return () => clearInterval(timer);
  }, [isScanningOpen, isScanningPaused, scanningSpeed, scanningTiles.length]);

  // Execute selection on tile
  const handleSelectTile = (tile) => {
    if (!tile) return;

    if (tile.type === 'phrase') {
      setScanningBuffer(prev => prev ? `${prev} ${tile.text}` : tile.text);
    } else if (tile.type === 'letter') {
      setScanningBuffer(prev => prev + tile.label);
    } else if (tile.type === 'action') {
      if (tile.action === 'space') {
        setScanningBuffer(prev => prev + ' ');
      } else if (tile.action === 'backspace') {
        setScanningBuffer(prev => prev.slice(0, -1));
      } else if (tile.action === 'clear') {
        setScanningBuffer('');
      } else if (tile.action === 'send') {
        if (scanningBuffer.trim()) {
          handleDispatchTurn(scanningBuffer.trim(), 'autistic', 'scanning');
          setScanningBuffer('');
        }
      }
    }
  };

  // Keyboard Spacebar / Enter single-switch trigger
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isScanningOpen) return;
      // Do not trigger single-switch if focus is in a normal text input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        const currentTile = scanningTiles[activeTileIndex];
        handleSelectTile(currentTile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScanningOpen, activeTileIndex, scanningBuffer]);

  // Quick preset suggestions
  const autisticPresets = [
    "Your presentation has several factual errors.",
    "Stop talking, it is way too loud in here.",
    "I need to leave now.",
    "Why are you looking at my eyes like that?"
  ];

  const neurotypicalPresets = [
    "Break a leg with your demo today!",
    "Oh great, another 8 AM meeting tomorrow!",
    "Let's just bite the bullet and spill the beans.",
    "Just read between the lines, you know?"
  ];

  const getInputMethodBadge = (method) => {
    switch (method) {
      case 'gesture':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold uppercase">
            <Hand className="w-2.5 h-2.5" />
            Gesture
          </span>
        );
      case 'scanning':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold uppercase">
            <Radio className="w-2.5 h-2.5" />
            Scan AAC
          </span>
        );
      case 'typed':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold uppercase">
            <Keyboard className="w-2.5 h-2.5" />
            Typed AAC
          </span>
        );
      case 'speech':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold uppercase">
            <Mic className="w-2.5 h-2.5" />
            Spoken
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Controller Bar */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Multimodal Communication Bridge</h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                v3 Unified Timeline
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              <strong className="text-cyan-400 font-semibold">Autonomous Living & Workplace Translation:</strong> Decrypts disabled speech, typed AAC, switch-scanning, and motor stims into clear social context for peers, and decodes idioms, sarcasm, and indirect subtext into literal clarity — so disabled individuals can work and live independently without anyone needing to learn a new language.
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* AAC Scanning Keyboard Mode Quick Toggle */}
          <button
            id="btn-toggle-scanning-keyboard-mode"
            onClick={() => setIsScanningOpen(!isScanningOpen)}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              isScanningOpen
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle On-Screen Switch-Scanning Keyboard"
          >
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>Switch AAC:</span>
            <strong className={isScanningOpen ? 'text-cyan-300' : 'text-slate-500'}>
              {isScanningOpen ? 'ON' : 'OFF'}
            </strong>
          </button>

          {/* Wearer Bridge ON/OFF */}
          <button
            onClick={() => onToggleBridge && onToggleBridge(!isBridgeActive)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition cursor-pointer ${
              isBridgeActive 
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-950/50' 
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <span>Bridge:</span>
            <strong className={isBridgeActive ? 'text-emerald-400' : 'text-slate-500'}>
              {isBridgeActive ? 'ACTIVE' : 'PAUSED'}
            </strong>
            {isBridgeActive ? (
              <ToggleRight className="w-5 h-5 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <button
            onClick={clearChat}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reset Conversation Timeline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {speechError && (
        <div className="p-3 bg-amber-950/50 border border-amber-600/50 rounded-xl text-amber-200 text-xs flex items-center justify-between">
          <span>Microphone note: {speechError}. (Direct typing, scanning keyboard, and gestures are fully available!)</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE SOCIAL WINGMAN & TURN-TAKING FLOWMETER               */}
      {/* ========================================================= */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-cyan-500/30 bg-slate-950/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base">
                  Live Social Wingman & Turn-Taking Flowmeter
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-medium">
                  Peer Connectivity Guard
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time conversational scaffolding to help homeschooled & special-school students navigate group dialogue with peers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleDispatchTurn(
                  "I've reached my sensory limit for today, so I'm heading out to recharge. Had great fun talking, let's catch up soon!",
                  'autistic',
                  'typed'
                );
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="Send a polite, non-awkward exit boundary turn into conversation"
            >
              <LogOut className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tactful Exit Card</span>
            </button>

            <button
              type="button"
              onClick={() => setIsWingmanOpen(!isWingmanOpen)}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-semibold"
            >
              {isWingmanOpen ? 'Minimize' : 'Expand'}
            </button>
          </div>
        </div>

        {isWingmanOpen && (
          <div className="space-y-3.5 animate-fade-in">
            {/* 1. Turn-Taking Flowmeter Bar */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-cyan-400">Alex ({alexPercent}%)</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    ({autisticTurnsCount} turns)
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] font-medium text-center">
                  {totalTurns === 0 ? (
                    <span className="text-slate-500 italic">Conversation starting — flowmeter standing by</span>
                  ) : alexPercent >= 40 && alexPercent <= 60 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Balanced Flow (Healthy back-and-forth)
                    </span>
                  ) : alexPercent > 60 ? (
                    <span className="text-cyan-300 font-semibold">
                      Sharing deep knowledge • Remember to ask their perspective!
                    </span>
                  ) : (
                    <span className="text-purple-300 font-semibold">
                      Listening mode • Ready to chime in whenever you like!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-purple-400">Peer ({peerPercent}%)</span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    ({ntTurnsCount} turns)
                  </span>
                </div>
              </div>

              {/* Progress split bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${alexPercent}%` }}
                ></div>
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                  style={{ width: `${peerPercent}%` }}
                ></div>
              </div>
            </div>

            {/* 2. Special-Interest Bridge & Wingman Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Special-Interest Bridge</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {wingmanData?.bridgeTip || `Bridging everyday peer topics to your passion in ${userProfile?.specialInterests?.[0] || 'Robotics & Python'} to build natural connection.`}
                  </p>
                </div>
                <span className="text-[10px] text-indigo-400/80 mt-2 font-mono">
                  Passion Focus: {userProfile?.specialInterests?.join(', ') || 'Robotics, Gaming'}
                </span>
              </div>

              <div className="md:col-span-7 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <span>⚡ Quick Conversational Prompt Chips (Click to Send)</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(wingmanData?.quickPrompts || [
                    { label: "Ask follow-up", text: "What inspired you to get into that?" },
                    { label: "Validate", text: "That makes a lot of sense, I agree." },
                    { label: "Share Detail", text: "I like breaking tasks into small modules like code!" }
                  ]).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDispatchTurn(p.text, 'autistic', 'typed')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-950/80 border border-slate-700 hover:border-cyan-400 text-xs text-slate-200 hover:text-cyan-200 transition cursor-pointer text-left"
                      title="Send this response as Alex"
                    >
                      <strong className="text-cyan-400 mr-1 text-[11px]">{p.label}:</strong>
                      <span>"{p.text}"</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SWITCH-SCANNING ON-SCREEN KEYBOARD (If Enabled)           */}
      {/* ========================================================= */}
      {isScanningOpen && (
        <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 border-2 border-cyan-500/40 bg-slate-950/90 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Switch-Scanning AAC Keyboard
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                    {(scanningSpeed / 1000).toFixed(1)}s dwell speed
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Single-switch access: Auto-advancing highlight. Press <strong>Spacebar</strong> or click the big Select button to pick.
                </p>
              </div>
            </div>

            {/* Scan Controls: Pause & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsScanningPaused(!isScanningPaused)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isScanningPaused
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {isScanningPaused ? 'Resume Auto-Scan' : 'Pause Scan'}
              </button>
              <button
                type="button"
                onClick={() => setIsScanningOpen(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                title="Minimize Scanning Keyboard"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AAC Composition Buffer & Big Action Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between min-h-[50px]">
              <div className="text-sm font-semibold text-white tracking-wide break-words">
                {scanningBuffer ? (
                  <span>{scanningBuffer}</span>
                ) : (
                  <span className="text-slate-500 italic text-xs">
                    Composing AAC turn... (Scan will not fire LLM analysis until you select SEND)
                  </span>
                )}
              </div>
              {scanningBuffer && (
                <button
                  type="button"
                  onClick={() => setScanningBuffer('')}
                  className="text-xs text-slate-400 hover:text-rose-400 ml-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Single-Switch Big Select Button */}
            <button
              type="button"
              id="btn-single-switch-select"
              onClick={() => handleSelectTile(scanningTiles[activeTileIndex])}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 transition"
            >
              <span>SELECT TILE:</span>
              <span className="px-2 py-0.5 rounded bg-black/30 border border-white/20 font-mono text-cyan-200">
                "{scanningTiles[activeTileIndex]?.label}"
              </span>
              <span className="hidden sm:inline text-[10px] text-cyan-200/80 font-normal">
                (or press Space)
              </span>
            </button>
          </div>

          {/* Tile Grid */}
          <div className="space-y-3">
            {/* 1. Fast Phrase Tiles */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                ⚡ Rapid Phrase Tiles (Instant Full-Turn AAC)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {scanningTiles.filter(t => t.type === 'phrase').map((tile) => {
                  const globalIdx = scanningTiles.findIndex(t => t.id === tile.id);
                  const isCurrent = globalIdx === activeTileIndex;
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleSelectTile(tile)}
                      className={`p-3 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center text-center cursor-pointer border ${
                        isCurrent
                          ? 'border-2 border-cyan-400 bg-cyan-500/30 text-white shadow-xl shadow-cyan-500/40 scale-105 z-10'
                          : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <span>{tile.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Alphabet Grid & Actions */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                🔤 Letter Grid & Action Keys
              </span>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-1.5">
                {scanningTiles.filter(t => t.type === 'letter' || t.type === 'action').map((tile) => {
                  const globalIdx = scanningTiles.findIndex(t => t.id === tile.id);
                  const isCurrent = globalIdx === activeTileIndex;
                  const isAction = tile.type === 'action';

                  return (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => handleSelectTile(tile)}
                      className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center cursor-pointer border text-center ${
                        isAction ? 'col-span-2 text-xs font-extrabold' : 'text-sm font-mono'
                      } ${
                        isCurrent
                          ? 'border-2 border-emerald-400 bg-emerald-500/30 text-white shadow-lg shadow-emerald-500/40 scale-110 z-10'
                          : isAction
                          ? 'border-slate-700 bg-slate-800/80 text-cyan-300 hover:bg-slate-800'
                          : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {tile.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-Panel Split Conversation Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: AUTISTIC SPEAKER (Alex Rivera)                 */}
        {/* ========================================================= */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-cyan-500/30 flex flex-col h-[660px] shadow-2xl relative">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                  Alex Rivera
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                    Wearer (Disabled / Autistic)
                  </span>
                </h3>
                <span className="text-[11px] text-cyan-200/80">Expresses naturally (Speech, AAC, Switch, Stims) • AI decrypts intent for peers</span>
              </div>
            </div>

            {/* Mic Toggle for Alex */}
            <button
              onClick={() => isListening && activeSpeaker === 'autistic' ? stopListening() : startListening('autistic')}
              className={`p-3 rounded-2xl font-bold flex items-center gap-2 text-xs transition shadow-lg cursor-pointer ${
                isListening && activeSpeaker === 'autistic'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
              }`}
            >
              {isListening && activeSpeaker === 'autistic' ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Speak</span>
                </>
              )}
            </button>
          </div>

          {/* Active Clarification Card for Alex (Clarifying what the neurotypical listener meant!) */}
          {activeClarifications.forAutisticListener && (
            <div className="mt-3 p-3.5 rounded-2xl bg-cyan-950/90 border-2 border-cyan-400 shadow-xl animate-bounce-short">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 mt-0.5">
                    <Lightbulb className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
                        Subtext Clarification
                      </span>
                      {activeClarifications.forAutisticListener.category && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/80 text-cyan-200 border border-cyan-700/60 uppercase font-mono">
                          {activeClarifications.forAutisticListener.category}
                        </span>
                      )}
                      <EngineBadge engine={activeClarifications.forAutisticListener.engine} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      "{activeClarifications.forAutisticListener.text}"
                    </p>

                    {/* Adaptive Feedback controls */}
                    <div className="mt-2.5 flex items-center gap-3">
                      {activeClarifications.forAutisticListener.feedbackGiven ? (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Feedback recorded — model adapts future {activeClarifications.forAutisticListener.category} flags!
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-cyan-400/80">Was this helpful?</span>
                          <button
                            id="btn-feedback-alex-yes"
                            onClick={() => handleFeedback('autistic', activeClarifications.forAutisticListener, true)}
                            className="p-1 px-2 rounded-lg bg-cyan-900/60 hover:bg-emerald-600 text-cyan-200 hover:text-white text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Helpful clarification"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Yes</span>
                          </button>
                          <button
                            id="btn-feedback-alex-no"
                            onClick={() => handleFeedback('autistic', activeClarifications.forAutisticListener, false)}
                            className="p-1 px-2 rounded-lg bg-cyan-900/60 hover:bg-rose-600 text-cyan-200 hover:text-white text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Unhelpful / unnecessary"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span>No</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissClarification('autistic', activeClarifications.forAutisticListener.id)}
                  className="text-cyan-300 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Conversation Stream (Shared Multimodal Timeline) */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
            {turns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs px-4">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
                <p>No messages yet. Speak, type AAC, use switch scanning, or gesture to start.</p>
              </div>
            ) : (
              turns.map((turn) => {
                const isMe = turn.speaker === 'autistic';
                const isGesture = turn.inputMethod === 'gesture';
                const isScanning = turn.inputMethod === 'scanning';

                return (
                  <div
                    key={turn.id}
                    className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span>{isMe ? 'Alex (You)' : 'Jordan (Partner)'}</span>
                      <span>•</span>
                      {getInputMethodBadge(turn.inputMethod)}
                      <span>•</span>
                      <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {turn.id === analyzingTurnId && (
                        <span className="text-[10px] text-cyan-400 animate-pulse font-mono">
                          analyzing...
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm shadow-md ${
                        isGesture
                          ? 'bg-purple-950/80 border-2 border-purple-400 text-purple-100 shadow-purple-950/50'
                          : isScanning
                          ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-100 shadow-emerald-950/40'
                          : isMe
                          ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-50'
                          : 'bg-slate-800/80 border border-slate-700 text-slate-200'
                      }`}
                    >
                      {isGesture && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                          <Hand className="w-3 h-3" />
                          <span>Sovereign Motor Gesture</span>
                        </div>
                      )}
                      <div>{turn.text}</div>

                      {turn.clarification && (
                        <div className="mt-2 pt-2 border-t border-cyan-500/20 text-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Lightbulb className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
                            Subtext Clarification
                          </span>
                          {turn.category && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-900/80 text-cyan-200 border border-cyan-700/60 uppercase font-mono font-bold">
                              {turn.category}
                            </span>
                          )}
                        </div>
                          <p className="text-cyan-100 italic font-medium text-[11px] sm:text-xs">
                            "{turn.clarification}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Interim Speech Output */}
            {isListening && activeSpeaker === 'autistic' && interimText && (
              <div className="flex flex-col items-start">
                <div className="text-[10px] text-cyan-400 mb-1 px-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                  Transcribing Alex...
                </div>
                <div className="max-w-[85%] rounded-2xl p-3 text-xs bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 italic">
                  {interimText}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Direct AAC / Typing Input Channel with Send Button (Always Available) */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {/* Quick Demo Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Demo Prompts:</span>
              {autisticPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick('autistic', preset)}
                  className="shrink-0 px-2 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800 text-cyan-200 hover:text-white transition cursor-pointer"
                >
                  "{preset.slice(0, 24)}..."
                </button>
              ))}
            </div>

            {/* Direct Text Input & Send Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="input-alex-text-aac"
                value={manualText.autistic}
                onChange={(e) => setManualText(prev => ({ ...prev, autistic: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSend('autistic')}
                placeholder="Type Alex's response (Direct AAC / Text Channel)..."
                className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                id="btn-alex-send-turn"
                onClick={() => handleManualSend('autistic')}
                disabled={!manualText.autistic.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL: NEUROTYPICAL SPEAKER (Jordan / Colleague)     */}
        {/* ========================================================= */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-indigo-500/30 flex flex-col h-[660px] shadow-2xl relative">
          
          {/* Panel Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                J
              </div>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                  Jordan Blake
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-semibold">
                    Partner (Colleague / Public / Neurotypical)
                  </span>
                </h3>
                <span className="text-[11px] text-indigo-200/80">Speaks naturally (Idioms, Sarcasm, Indirect Cues) • AI conveys subtext to Alex</span>
              </div>
            </div>

            {/* Mic Toggle for Jordan */}
            <button
              onClick={() => isListening && activeSpeaker === 'neurotypical' ? stopListening() : startListening('neurotypical')}
              className={`p-3 rounded-2xl font-bold flex items-center gap-2 text-xs transition shadow-lg cursor-pointer ${
                isListening && activeSpeaker === 'neurotypical'
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isListening && activeSpeaker === 'neurotypical' ? (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Speak</span>
                </>
              )}
            </button>
          </div>

          {/* Active Clarification Card for Jordan (Clarifying what Alex meant when Alex spoke/typed/gestured!) */}
          {activeClarifications.forNeurotypicalListener && (
            <div className="mt-3 p-3.5 rounded-2xl bg-indigo-950/90 border-2 border-indigo-400 shadow-xl animate-bounce-short">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5">
                    <Sparkles className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                        Subtext Clarification
                      </span>
                      {activeClarifications.forNeurotypicalListener.category && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 uppercase font-mono">
                          {activeClarifications.forNeurotypicalListener.category}
                        </span>
                      )}
                      <EngineBadge engine={activeClarifications.forNeurotypicalListener.engine} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white">
                      "{activeClarifications.forNeurotypicalListener.text}"
                    </p>

                    {/* Adaptive Feedback controls */}
                    <div className="mt-2.5 flex items-center gap-3">
                      {activeClarifications.forNeurotypicalListener.feedbackGiven ? (
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 animate-pulse">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Feedback recorded — model adapts future {activeClarifications.forNeurotypicalListener.category} flags!
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-indigo-400/80">Was this helpful?</span>
                          <button
                            id="btn-feedback-jordan-yes"
                            onClick={() => handleFeedback('neurotypical', activeClarifications.forNeurotypicalListener, true)}
                            className="p-1 px-2 rounded-lg bg-indigo-900/60 hover:bg-emerald-600 text-indigo-200 hover:text-white text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Helpful clarification"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Yes</span>
                          </button>
                          <button
                            id="btn-feedback-jordan-no"
                            onClick={() => handleFeedback('neurotypical', activeClarifications.forNeurotypicalListener, false)}
                            className="p-1 px-2 rounded-lg bg-indigo-900/60 hover:bg-rose-600 text-indigo-200 hover:text-white text-[11px] flex items-center gap-1 transition cursor-pointer"
                            title="Unhelpful / unnecessary"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            <span>No</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissClarification('neurotypical', activeClarifications.forNeurotypicalListener.id)}
                  className="text-indigo-300 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Conversation Stream for Jordan */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
            {turns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs px-4">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40 text-indigo-400" />
                <p>No messages yet. Speak or type to start the conversation.</p>
              </div>
            ) : (
              turns.map((turn) => {
                const isMe = turn.speaker === 'neurotypical';
                const isGesture = turn.inputMethod === 'gesture';
                const isScanning = turn.inputMethod === 'scanning';

                return (
                  <div
                    key={turn.id}
                    className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span>{isMe ? 'Jordan (You)' : 'Alex (Partner)'}</span>
                      <span>•</span>
                      {getInputMethodBadge(turn.inputMethod)}
                      <span>•</span>
                      <span>{new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {turn.id === analyzingTurnId && (
                        <span className="text-[10px] text-indigo-400 animate-pulse font-mono">
                          analyzing...
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm shadow-md ${
                        isGesture
                          ? 'bg-purple-950/80 border-2 border-purple-400 text-purple-100 shadow-purple-950/50'
                          : isScanning
                          ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-100 shadow-emerald-950/40'
                          : isMe
                          ? 'bg-indigo-950/70 border border-indigo-500/40 text-indigo-50'
                          : 'bg-slate-800/80 border border-slate-700 text-slate-200'
                      }`}
                    >
                      {isGesture && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-purple-300 uppercase tracking-wider mb-1">
                          <Hand className="w-3 h-3" />
                          <span>Alex's Sovereign Gesture</span>
                        </div>
                      )}
                      <div>{turn.text}</div>

                      {turn.clarification && (
                        <div className="mt-2 pt-2 border-t border-indigo-500/20 text-xs">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                              Subtext Clarification
                            </span>
                            {turn.category && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 uppercase font-mono font-bold">
                                {turn.category}
                              </span>
                            )}
                          </div>
                          <p className="text-indigo-100 italic font-medium text-[11px] sm:text-xs">
                            "{turn.clarification}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Interim Speech Output */}
            {isListening && activeSpeaker === 'neurotypical' && interimText && (
              <div className="flex flex-col items-start">
                <div className="text-[10px] text-indigo-400 mb-1 px-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
                  Transcribing Jordan...
                </div>
                <div className="max-w-[85%] rounded-2xl p-3 text-xs bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 italic">
                  {interimText}
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Direct Text Input & Presets for Jordan */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {/* Quick Demo Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 text-[10px] uppercase font-bold shrink-0">Demo Prompts:</span>
              {neurotypicalPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick('neurotypical', preset)}
                  className="shrink-0 px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-800 text-indigo-200 hover:text-white transition cursor-pointer"
                >
                  "{preset.slice(0, 24)}..."
                </button>
              ))}
            </div>

            {/* Input form with Send Button */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="input-jordan-text"
                value={manualText.neurotypical}
                onChange={(e) => setManualText(prev => ({ ...prev, neurotypical: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSend('neurotypical')}
                placeholder="Type Jordan's response..."
                className="flex-1 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                id="btn-jordan-send-turn"
                onClick={() => handleManualSend('neurotypical')}
                disabled={!manualText.neurotypical.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
