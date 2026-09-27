import React from 'react';
import { 
  Sparkles, 
  Camera, 
  Sliders, 
  Layers, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Eye, 
  Lock,
  Cpu,
  Smile,
  ShieldCheck
} from 'lucide-react';

export function GestureRoadmap() {
  const exampleMockCards = [
    {
      gesture: "Rapid hand fluttering / flapping",
      translation: "High positive valence: Excited, stimming with joy & engagement",
      confidence: 94,
      note: "Often misread by neurotypicals as distress; calibrated as positive emotional regulation.",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    },
    {
      gesture: "Head rested in palms with gentle rocking",
      translation: "Sensory decompression requested: Overstimulated, prefers low lighting / non-verbal",
      confidence: 89,
      note: "Prompts conversation partner to lower vocal volume and give visual processing time.",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30"
    },
    {
      gesture: "Rhythmic bilateral finger tapping",
      translation: "Deep cognitive processing & listening intently (not fidgeting or bored)",
      confidence: 92,
      note: "Reassures partner that wearer is fully engaged even without direct eye contact.",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Phase 2 Architecture Preview
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Mockup & Spec Only
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Personalized Action Translation — Coming Soon
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time somatic gesture and body-language translation calibrated specifically to each wearer's unique motor expressions.
            </p>
          </div>
        </div>
      </div>

      {/* Ethical & Clinical Rationale Box */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-indigo-500/30 bg-indigo-950/20 shadow-xl">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 mt-1">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white mb-2">
              Why Generic Models Fail (And Why We Refuse to Rush One)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Autistic presentation varies vastly across individuals. One wearer’s repetitive hand motion signifies euphoric focus and joy, while for another it indicates sensory overload and imminent meltdown. Off-the-shelf "sentiment analysis" or generic pose classifiers systematically misclassify autistic stimming as aggression, panic, or disorder. Building this responsibly demands a <strong className="text-white">user-owned calibration phase</strong> — where the wearer labels 3 to 5 examples of their personal gestures on-device. This guarantees accurate, dignified translation without algorithmic prejudice.
            </p>
          </div>
        </div>
      </div>

      {/* Illustrative Calibration Examples (Mockup Cards) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            Calibrated Gesture Dossier (Illustrative Prototype)
          </h3>
          <span className="text-xs text-slate-400 italic">
            *Simulated examples based on user calibration trials
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {exampleMockCards.map((card, idx) => (
            <div 
              key={idx}
              className="glass-panel rounded-3xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${card.badgeColor}`}>
                    Mock Profile #{idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    {card.confidence}% match
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5">
                  {card.gesture}
                </h4>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 font-medium mb-3">
                  "{card.translation}"
                </div>

                <p className="text-xs text-slate-400 leading-normal">
                  {card.note}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${card.confidence}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Few-shot calibrated on 5 user recordings
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture Diagram (SVG / Box Flow) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              Phase 2 Pipeline Architecture (Roadmap)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Strictly privacy-preserving: video frames never leave client memory; only vector coordinates are evaluated.
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
            Phase 2 Scope
          </span>
        </div>

        {/* Visual Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
          
          {/* Step 1: Camera */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Step 1</span>
              <h4 className="text-sm font-bold text-white mt-1">Local Camera</h4>
              <p className="text-xs text-slate-400 mt-1.5">
                Front-facing mobile or webcam feed processed in browser canvas.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-slate-500">Zero cloud upload</div>
          </div>

          {/* Step 2: Pose Estimation */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Step 2</span>
              <h4 className="text-sm font-bold text-white mt-1">MediaPipe Pose</h4>
              <p className="text-xs text-slate-400 mt-1.5">
                Extracts 33 skeletal landmarks & joint velocity vectors in real time.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-slate-500">60 FPS on-device</div>
          </div>

          {/* Step 3: Few-Shot Classifier */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Sliders className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Step 3</span>
              <h4 className="text-sm font-bold text-white mt-1">Per-User KNN</h4>
              <p className="text-xs text-slate-400 mt-1.5">
                Matched against wearer's own 3-5 labeled gesture calibration seeds.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-slate-500">Wearer-calibrated</div>
          </div>

          {/* Step 4: Live Caption */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-center relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <Smile className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Step 4</span>
              <h4 className="text-sm font-bold text-white mt-1">Contextual Banner</h4>
              <p className="text-xs text-slate-400 mt-1.5">
                Presents non-intrusive intent translation cards to conversation partner.
              </p>
            </div>
            <div className="mt-3 text-[10px] text-slate-500">Live subtext card</div>
          </div>

        </div>

        {/* Milestone info banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            Post-Hackathon Roadmap: User study scheduled with clinical occupational therapists for ethical calibration protocols.
          </span>
          <span className="text-indigo-400 font-medium">Q3 Milestone</span>
        </div>
      </div>

    </div>
  );
}
