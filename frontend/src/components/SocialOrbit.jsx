import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  MessageSquare,
  Sparkles,
  Volume2,
  VolumeX,
  Battery,
  ShieldCheck,
  Send,
  RefreshCw,
  Award,
  HelpCircle,
  ArrowRight,
  Smile,
  Zap,
  Ear,
  Eye,
  CheckCircle2,
  Coffee,
  Users,
  Briefcase,
  Layers,
  HeartHandshake
} from 'lucide-react';

export function SocialOrbit({ userProfile }) {
  const [scenarios, setScenarios] = useState([]);
  const [activeScenarioId, setActiveScenarioId] = useState('cafeteria_lunch');
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  
  // Conversation session state
  const [history, setHistory] = useState([]);
  const [inputTurn, setInputTurn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastDecoder, setLastDecoder] = useState(null);
  const [lastCoachTip, setLastCoachTip] = useState(null);
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const [socialBattery, setSocialBattery] = useState(userProfile?.socialBattery || 85);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [completedScenarios, setCompletedScenarios] = useState(new Set());
  const [streakCount, setStreakCount] = useState(1);

  const chatEndRef = useRef(null);

  // Fetch scenarios from API
  useEffect(() => {
    fetch('/api/social-connect/scenarios')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.scenarios) {
          setScenarios(data.scenarios);
          initScenario(data.scenarios[0]);
        }
      })
      .catch(err => console.error('Failed to load scenarios:', err))
      .finally(() => setLoadingScenarios(false));
  }, []);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  const initScenario = (scenario) => {
    if (!scenario) return;
    setHistory([
      {
        speaker: scenario.peerName,
        text: scenario.initialPrompt,
        isPeer: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setLastDecoder(scenario.intentDecoder);
    setLastCoachTip("This is an open, friendly peer invitation. Choose a reply or write your own to practice stepping in!");
    setSuggestedReplies(scenario.suggestedResponses || []);
    
    // Play initial prompt via TTS if enabled
    if (ttsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      playTts(scenario.initialPrompt);
    }
  };

  const handleSelectScenario = (scenarioId) => {
    setActiveScenarioId(scenarioId);
    const scen = scenarios.find(s => s.id === scenarioId);
    if (scen) initScenario(scen);
  };

  const playTts = (text) => {
    if (!ttsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS playback issue:', e);
    }
  };

  // Auto scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSendTurn = async (replyText) => {
    const textToSend = (replyText || inputTurn).trim();
    if (!textToSend || isSubmitting) return;

    const userEntry = {
      speaker: userProfile?.name || 'Alex Rivera',
      text: textToSend,
      isPeer: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...history, userEntry];
    setHistory(newHistory);
    setInputTurn('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/social-connect/interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: activeScenarioId,
          userTurn: textToSend,
          conversationHistory: newHistory.map(h => ({
            speaker: h.isPeer ? 'peer' : 'autistic_wearer',
            text: h.text
          }))
        })
      });

      const data = await res.json();
      if (data.success && data.peerReply) {
        const peerEntry = {
          speaker: activeScenario?.peerName || 'Peer',
          text: data.peerReply,
          isPeer: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [...prev, peerEntry]);
        setLastDecoder(data.socialDecoder);
        setLastCoachTip(data.coachTip);
        setSuggestedReplies(data.suggestedReplies || []);
        
        // Adjust social battery
        const cost = data.batteryCost || 4;
        setSocialBattery(prev => Math.max(10, prev - cost));

        // Mark scenario completed & increment streak
        setCompletedScenarios(prev => new Set([...prev, activeScenarioId]));
        setStreakCount(prev => prev + 1);

        // TTS
        if (ttsEnabled) {
          playTts(data.peerReply);
        }
      }
    } catch (err) {
      console.error('Error submitting scenario turn:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetScenario = () => {
    if (activeScenario) {
      initScenario(activeScenario);
      setSocialBattery(prev => Math.min(100, prev + 15));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero Card for LifeConnect Mission */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-purple-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>LifeConnect Social Re-Entry Simulator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bridging from Homeschool & Special Ed to Mainstream Life
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              When autistic individuals are homeschooled or study in separate schools, mainstream social life feels like an uncharted world. <strong className="text-white">LifeConnect</strong> gives you a safe, judgment-free flight simulator to practice everyday peer conversations, understand unwritten body language, and step into school and community life with unstoppable confidence.
            </p>
          </div>

          {/* Social Battery & Confidence Stats */}
          <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-1">
                <Battery className={`w-4 h-4 ${socialBattery > 40 ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="font-semibold">Social Battery</span>
              </div>
              <div className="text-xl font-extrabold text-white">
                {socialBattery}%
              </div>
              <div className="w-20 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    socialBattery > 50 ? 'bg-emerald-400' : socialBattery > 25 ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                  style={{ width: `${socialBattery}%` }}
                ></div>
              </div>
            </div>

            <div className="h-10 w-[1px] bg-slate-800"></div>

            <div className="text-center px-2">
              <div className="flex items-center justify-center gap-1 text-xs text-slate-400 mb-1">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold">Practice Runs</span>
              </div>
              <div className="text-xl font-extrabold text-cyan-300">
                {completedScenarios.size} / {scenarios.length || 6}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Scenarios Mastered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scenario Selector & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 4 Cols: Scenario Carousel & Filters */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Practice Scenario
            </h3>
            <span className="text-[11px] text-cyan-400 font-semibold">
              {scenarios.length} Real-World Scenarios
            </span>
          </div>

          <div className="space-y-2.5">
            {scenarios.map((scenario) => {
              const isActive = scenario.id === activeScenarioId;
              const isDone = completedScenarios.has(scenario.id);

              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-950/70 via-indigo-950/60 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/10 scale-[1.01]'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {isDone && (
                    <span className="absolute top-3 right-3 text-emerald-400" title="Completed">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0">
                      {scenario.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                          {scenario.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          scenario.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          scenario.difficulty === 'Medium' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-purple-950 text-purple-300 border border-purple-800'
                        }`}>
                          {scenario.difficulty}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white truncate">
                        {scenario.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {scenario.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sensory Self-Advocacy Card */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-300">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>Sensory & Energy Tip</span>
            </div>
            <p className="leading-relaxed text-[11px] text-slate-300">
              In real peer situations, your sensory battery is your boundary. You never need to mask exhaustion. Saying <em>"I had fun, but I need 10 minutes of quiet to recharge"</em> is authentic self-advocacy.
            </p>
          </div>
        </div>

        {/* Right 8 Cols: Interactive Simulation Stage */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Active Scenario Card Header */}
          {activeScenario && (
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-slate-900/90 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{activeScenario.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {activeScenario.title}
                      <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800 font-normal">
                        Practicing with: {activeScenario.peerName}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeScenario.backgroundContext}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTtsEnabled(!ttsEnabled)}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                      ttsEnabled
                        ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                    title={ttsEnabled ? 'Spoken Voice Audio On' : 'Voice Audio Off'}
                  >
                    {ttsEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                    <span className="hidden sm:inline">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
                  </button>

                  <button
                    onClick={handleResetScenario}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Reset scenario conversation"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Real-Time Social Decoder & Coach Tip Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {lastDecoder && (
                  <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold mb-1">
                      <Eye className="w-3.5 h-3.5 text-purple-400" />
                      <span>Social Decoder (Unwritten Cues)</span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">
                      {lastDecoder}
                    </p>
                  </div>
                )}

                {lastCoachTip && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Coach Feedback</span>
                    </div>
                    <p className="text-slate-200 text-[11px] leading-relaxed">
                      {lastCoachTip}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive Chat Stream */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-950/80 min-h-[380px] max-h-[460px] overflow-y-auto flex flex-col space-y-3.5 shadow-inner">
            {history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.isPeer ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[10px] font-bold ${msg.isPeer ? 'text-cyan-400' : 'text-indigo-400'}`}>
                    {msg.speaker}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                    msg.isPeer
                      ? 'bg-slate-900 border border-slate-700/80 text-white rounded-tl-sm'
                      : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-medium rounded-tr-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {isSubmitting && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2 italic animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeScenario?.peerName} is thinking & reacting...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested Response Palettes (One-Tap Authentic Paths) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Recommended Response Palettes (Choose or Type Below)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {suggestedReplies.map((reply, i) => (
                <button
                  key={i}
                  disabled={isSubmitting}
                  onClick={() => handleSendTurn(reply.text)}
                  className="p-3 rounded-xl bg-slate-900/90 hover:bg-indigo-950/80 border border-slate-700 hover:border-cyan-400 text-left transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      {reply.label}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2">
                    "{reply.text}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Free-Form Composition Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendTurn();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputTurn}
              onChange={(e) => setInputTurn(e.target.value)}
              placeholder="Or type your own natural reply (speech, typed AAC, or stim meaning)..."
              disabled={isSubmitting}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="submit"
              disabled={!inputTurn.trim() || isSubmitting}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
