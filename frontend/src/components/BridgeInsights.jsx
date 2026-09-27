import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw, 
  MessageSquare,
  Zap,
  Info,
  SlidersHorizontal,
  Lightbulb,
  Mic,
  Keyboard,
  Radio,
  Hand
} from 'lucide-react';

export function BridgeInsights() {
  const [data, setData] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage?.getItem('neurobridge_feedback_data') : null;
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(() => {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage?.getItem('neurobridge_feedback_data') : null;
      return !Boolean(stored);
    } catch (_) {
      return true;
    }
  });

  const fetchInsights = async () => {
    try {
      const res = await fetch('/api/feedback');
      const json = await res.json();
      if (json.success) {
        setData(json);
        try {
          if (typeof window !== 'undefined') {
            window.localStorage?.setItem('neurobridge_feedback_data', JSON.stringify(json));
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Failed to load bridge insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 5000);
    return () => clearInterval(interval);
  }, []);

  const categoryLabels = {
    sarcasm: "Sarcasm & Irony",
    idiom: "Idiomatic Expressions",
    bluntness: "Direct / Blunt Phrasing",
    ambiguous_question: "Ambiguous Questions",
    other: "Other Contextual Flags"
  };

  const categoryColors = {
    sarcasm: "from-amber-500 to-orange-500",
    idiom: "from-indigo-500 to-purple-500",
    bluntness: "from-cyan-500 to-blue-500",
    ambiguous_question: "from-purple-500 to-pink-500",
    other: "from-slate-500 to-slate-400"
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-cyan-500 text-white shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Bridge Session Insights</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                Active Learning
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Real-time calibration based on mutual feedback between Alex and Jordan.
            </p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Refresh insights"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="glass-panel rounded-3xl p-10 text-center text-slate-400 text-sm">
          Loading adaptive session telemetry...
        </div>
      ) : data ? (
        <div className="space-y-6">
          
          {/* Key Clinical Interpretation Banner (One concise sentence) */}
          <div className="glass-panel-glow rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 to-slate-900/60 shadow-xl">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 mt-0.5">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block mb-1">
                  Session Interpretation Takeaway
                </span>
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  "{data.takeaway}"
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Adaptation Rule: {data.adaptiveContext}
                </p>
              </div>
            </div>
          </div>

          {/* Three Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Total Clarifications */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl text-center">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">
                Clarifications Flagged
              </span>
              <div className="text-4xl font-black text-white font-mono my-2">
                {data.totalClarifications}
              </div>
              <p className="text-[11px] text-slate-400">
                Filtered and delivered across {Object.keys(data.tally).length} distinct intent categories.
              </p>
            </div>

            {/* Card 2: Helpfulness Ratio */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl text-center">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">
                Pair Approval Rate
              </span>
              <div className="text-4xl font-black text-emerald-400 font-mono my-2">
                {data.helpfulRate}%
              </div>
              <p className="text-[11px] text-slate-400">
                {data.totalHelpful} of {data.totalClarifications} rated positively by conversational partners.
              </p>
            </div>

            {/* Card 3: Adaptive Bias Status */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl text-center">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider block mb-1">
                Active Suppression
              </span>
              <div className="text-3xl font-bold text-indigo-300 font-mono my-2">
                {data.tally.idiom.unhelpful >= 3 ? "Routine Idioms" : "Neutral Baseline"}
              </div>
              <p className="text-[11px] text-slate-400">
                {data.tally.idiom.unhelpful >= 3 
                  ? "Downvoted categories are silenced to prevent intrusive interruptions." 
                  : "Model is learning pair preferences evenly."}
              </p>
            </div>

          </div>

          {/* Multimodal Input Methods Breakdown (Phase 3 & Demo Script Step 4) */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                Multimodal Input Breakdown (Sovereign Channels)
              </h3>
              <span className="text-xs text-slate-400">
                Spoken, Typed AAC, Scanning, & Gesture Turns
              </span>
            </div>

            {(() => {
              const methods = data.inputMethods || { speech: 4, typed: 3, scanning: 2, gesture: 2 };
              const totalTurns = Object.values(methods).reduce((a, b) => a + b, 0);

              const methodConfig = [
                {
                  key: 'speech',
                  label: 'Spoken Audio Turn',
                  icon: Mic,
                  color: 'from-indigo-500 to-cyan-500',
                  textColor: 'text-indigo-400',
                  bgBar: 'bg-indigo-500'
                },
                {
                  key: 'typed',
                  label: 'Direct Typed AAC Channel',
                  icon: Keyboard,
                  color: 'from-cyan-500 to-teal-500',
                  textColor: 'text-cyan-400',
                  bgBar: 'bg-cyan-500'
                },
                {
                  key: 'scanning',
                  label: 'On-Screen Switch-Scanning AAC',
                  icon: Radio,
                  color: 'from-emerald-500 to-green-500',
                  textColor: 'text-emerald-400',
                  bgBar: 'bg-emerald-500'
                },
                {
                  key: 'gesture',
                  label: 'Calibrated Sovereign Gestures',
                  icon: Hand,
                  color: 'from-purple-500 to-pink-500',
                  textColor: 'text-purple-400',
                  bgBar: 'bg-purple-500'
                }
              ];

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {methodConfig.map((cfg) => {
                    const count = methods[cfg.key] || 0;
                    const percent = totalTurns > 0 ? Math.round((count / totalTurns) * 100) : 0;
                    const IconComponent = cfg.icon;

                    return (
                      <div key={cfg.key} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-xl bg-slate-800 ${cfg.textColor}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-mono font-bold text-slate-300">
                            {count} turns ({percent}%)
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white">
                          {cfg.label}
                        </h4>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cfg.bgBar} transition-all duration-500`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Category Breakdown Breakdown Cards */}
          <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                Category Feedback Distribution
              </h3>
              <span className="text-xs text-slate-400">
                Thumbs Up vs Thumbs Down by Intent Type
              </span>
            </div>

            <div className="space-y-4">
              {Object.entries(data.tally).map(([cat, counts]) => {
                const total = counts.helpful + counts.unhelpful;
                const percent = total > 0 ? Math.round((counts.helpful / total) * 100) : 100;
                const label = categoryLabels[cat] || cat;
                const isSuppressed = total >= 3 && percent < 35;

                return (
                  <div key={cat} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white">
                          {label}
                        </span>
                        {isSuppressed && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase font-mono font-bold">
                            Suppressed / Tuned Down
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                          <ThumbsUp className="w-3 h-3" />
                          {counts.helpful}
                        </span>
                        <span className="text-rose-400 flex items-center gap-1 font-semibold">
                          <ThumbsDown className="w-3 h-3" />
                          {counts.unhelpful}
                        </span>
                        <span className="text-slate-400">({percent}% helpful)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${total > 0 ? (counts.helpful / total) * 100 : 0}%` }}
                      ></div>
                      <div 
                        className="bg-rose-500 h-full transition-all duration-500"
                        style={{ width: `${total > 0 ? (counts.unhelpful / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
