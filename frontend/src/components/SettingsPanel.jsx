import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  Activity, 
  Heart, 
  BrainCircuit, 
  Save, 
  CheckCircle, 
  Lock, 
  EyeOff, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Keyboard,
  Timer,
  RotateCcw,
  Mail,
  Eraser,
  Compass,
  Sparkles
} from 'lucide-react';

// Accessible sovereign toggle: real switch semantics for screen readers & switch users
function SovereignToggle({ id, checked, onChange, label }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="text-cyan-400 hover:text-cyan-300 p-1 cursor-pointer"
    >
      {checked ? (
        <ToggleRight className="w-8 h-8 text-emerald-400" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-slate-600" />
      )}
    </button>
  );
}

export function SettingsPanel({ userProfile, onUpdateProfile, onResetDemoData }) {
  const [profile, setProfile] = useState(userProfile);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetDone, setIsResetDone] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  const handleToggle = (key) => {
    const updated = {
      ...profile,
      [key]: !profile[key]
    };
    setProfile(updated);
    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }

    // Auto-sync with backend
    fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.warn('Auto-sync error:', err));

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleContactChange = (field, value) => {
    const updated = {
      ...profile,
      guardianContact: {
        ...profile.guardianContact,
        [field]: value
      }
    };
    setProfile(updated);
    setIsSaved(false);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
        if (onUpdateProfile) onUpdateProfile(data.profile);
        setTimeout(() => setIsSaved(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Fresh Session: wipe server tallies + local browser data for a true clean start
  const handleCleanSession = async () => {
    try {
      await fetch('/api/feedback/reset', { method: 'POST' });
    } catch (err) {
      console.warn('Feedback reset warning:', err);
    }
    if (onResetDemoData) {
      onResetDemoData();
    }
    setIsResetDone(true);
    setTimeout(() => setIsResetDone(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner: Ethical Wearer-First Sovereignty */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3.5 mb-2">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Privacy & Wearer Sovereignty Controls</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Zero continuous surveillance. You decide what sensors run, when data leaves your device, and who is notified.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Monitoring Toggles */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Active Sensor & AI Telemetry Toggles
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Disable any module instantly. When disabled, hardware sensors are powered down and no AI calls occur.
              </p>
            </div>
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-pulse">
                <CheckCircle className="w-3.5 h-3.5" />
                Live Updated!
              </span>
            )}
          </div>

          <div className="space-y-3">
            
            {/* Toggle 1: Fall Detection */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Fall Impact Detection</h4>
                  <p className="text-xs text-slate-400">
                    Runs on-device accelerometer threshold rules (&gt;2.6G spike + stillness). No audio or video involved.
                  </p>
                </div>
              </div>
              <SovereignToggle
                id="toggle-fall-detection"
                checked={profile.fallDetectionActive}
                onChange={() => handleToggle('fallDetectionActive')}
                label="Toggle fall impact detection"
              />
            </div>

            {/* Toggle 2: Distress Detection */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 mt-0.5">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Distress & Agitation Detection</h4>
                  <p className="text-xs text-slate-400">
                    Monitors rapid kinetic variance and elevated heart rate indicators to detect sensory overload.
                  </p>
                </div>
              </div>
              <SovereignToggle
                id="toggle-distress-detection"
                checked={profile.distressDetectionActive}
                onChange={() => handleToggle('distressDetectionActive')}
                label="Toggle distress and agitation detection"
              />
            </div>

            {/* Toggle 3: Communication Bridge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 mt-0.5">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Live Communication Bridge (AI)</h4>
                  <p className="text-xs text-slate-400">
                    Analyzes spoken transcripts to clarify subtext, idioms, and sarcasm for your conversation partner.
                  </p>
                </div>
              </div>
              <SovereignToggle
                id="toggle-bridge"
                checked={profile.bridgeActive}
                onChange={() => handleToggle('bridgeActive')}
                label="Toggle live communication bridge"
              />
            </div>

            {/* Toggle 4: Location on Alert ONLY */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Share Location On Emergency Alert Only</h4>
                  <p className="text-xs text-slate-400">
                    GPS coordinates are strictly queried <span className="text-white font-medium">only upon a trigger event</span>. Never continuously tracked or stored.
                  </p>
                </div>
              </div>
              <SovereignToggle
                id="toggle-location-share"
                checked={profile.shareLocationOnAlert}
                onChange={() => handleToggle('shareLocationOnAlert')}
                label="Toggle share location on emergency alert"
              />
            </div>

          </div>
        </div>

        {/* Section 2: Adaptive Input & AAC Switch-Scanning Mode */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-cyan-400" />
                Multimodal Input & AAC Switch-Scanning
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose whichever input works best for you — spoken, typed, scanning, or gesture. You can mix all four in the same conversation.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle: Enable Scanning Keyboard */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Enable Scanning Keyboard</h4>
                  <p className="text-xs text-slate-400">
                    Displays an on-screen grid of letter and fast-phrase tiles with automatic row/tile scan highlight for single-switch access.
                  </p>
                </div>
              </div>
              <SovereignToggle
                id="toggle-scanning-keyboard"
                checked={profile.scanningKeyboardEnabled}
                onChange={() => handleToggle('scanningKeyboardEnabled')}
                label="Toggle scanning keyboard"
              />
            </div>

            {/* Slider: Scanning Speed */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-indigo-400" />
                  <span className="text-sm font-semibold text-white">Scanning Speed</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {((profile.scanningSpeedMs || 1200) / 1000).toFixed(1)}s / tile
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Adjusts the dwell time before the auto-scan cursor advances to the next tile.
              </p>
              <div className="pt-2 flex items-center space-x-3">
                <span className="text-[11px] text-slate-500 font-mono">0.6s (Fast)</span>
                <input
                  type="range"
                  id="slider-scanning-speed"
                  min="600"
                  max="2500"
                  step="100"
                  value={profile.scanningSpeedMs || 1200}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const updated = { ...profile, scanningSpeedMs: val };
                    setProfile(updated);
                    if (onUpdateProfile) onUpdateProfile(updated);
                  }}
                  className="flex-1 accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <span className="text-[11px] text-slate-500 font-mono">2.5s (Deliberate)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Designated Guardian Contact */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Designated Guardian Contact
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                The only person or service authorized to receive your alert broadcasts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Guardian Name</label>
              <input
                type="text"
                id="input-guardian-name"
                value={profile.guardianContact.name}
                onChange={(e) => handleContactChange('name', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Guardian Email (receives real emergency alerts)
              </label>
              <input
                type="email"
                id="input-guardian-email"
                placeholder="guardian@example.com"
                value={profile.guardianContact.email || ''}
                onChange={(e) => handleContactChange('email', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Every alert dispatches a live email with GPS map link to this address.
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Relationship / Role</label>
              <input
                type="text"
                id="input-guardian-relationship"
                value={profile.guardianContact.relationship}
                onChange={(e) => handleContactChange('relationship', e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Communication ID — what first responders & helpers should know */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Communication ID (Emergency Card)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                In your own words: what should a first responder, a stranger, or your guardian know in a crisis? This card rides inside every emergency alert.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">About me (one sentence)</label>
              <input
                type="text"
                id="input-card-about"
                value={profile.emergencyCard?.primaryChallenge || ''}
                onChange={(e) => {
                  const updated = { ...profile, emergencyCard: { ...profile.emergencyCard, primaryChallenge: e.target.value } };
                  setProfile(updated);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                placeholder="I am autistic and sometimes nonverbal under stress."
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">What helps me</label>
              <input
                type="text"
                id="input-card-helps"
                value={profile.emergencyCard?.whatHelps || ''}
                onChange={(e) => {
                  const updated = { ...profile, emergencyCard: { ...profile.emergencyCard, whatHelps: e.target.value } };
                  setProfile(updated);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                placeholder="Speak slowly and literally. No idioms. Give me time to type."
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Also notify</label>
              <input
                type="text"
                id="input-card-contact"
                value={profile.emergencyCard?.emergencyContact || ''}
                onChange={(e) => {
                  const updated = { ...profile, emergencyCard: { ...profile.emergencyCard, emergencyContact: e.target.value } };
                  setProfile(updated);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500"
                placeholder="Name (relationship) — phone"
              />
            </div>
          </div>
        </div>

        {/* Section 5: School Context & Social Re-Entry (LifeConnect) */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                School Context & Social Re-Entry Settings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Personalize your background and passions so the LifeConnect simulator and Wingman tailor social scenarios to your exact life goals.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">Integration Context / Current School Status</label>
              <input
                type="text"
                id="input-school-context"
                value={profile.schoolContext || ''}
                onChange={(e) => {
                  const updated = { ...profile, schoolContext: e.target.value };
                  setProfile(updated);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. Homeschooled student preparing for mainstream campus & peer life"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Passions & Special Interests (Comma-separated — feeds into your Wingman & Peer Circles)
              </label>
              <input
                type="text"
                id="input-special-interests"
                value={Array.isArray(profile.specialInterests) ? profile.specialInterests.join(', ') : (profile.specialInterests || '')}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  const updated = { ...profile, specialInterests: arr };
                  setProfile(updated);
                  setIsSaved(false);
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                placeholder="Robotics & Python, Astronomy, Indie Gaming, Digital Art"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                The AI Wingman bridges these exact passions to what peers say in casual conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Data Sovereignty Statement */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start space-x-3 text-xs text-slate-400">
          <EyeOff className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-200">Our Anti-Surveillance Guarantee:</strong> NeuroBridge is built as a protective shield for the neurodivergent individual, not an employer or parental surveillance camera. Telemetry is edge-computed in your browser sandbox, and alerts are dispatched only upon unambiguous physical or manual triggers.
          </div>
        </div>

        {/* Save Bar & Clean Session Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-clean-session"
              onClick={handleCleanSession}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Wipe server session tallies AND local browser data — a true fresh start for demos and new pairs"
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Clean Session (Fresh Start)</span>
            </button>
            {isResetDone && (
              <span className="text-xs text-emerald-400 font-medium animate-fade-in">
                Fresh session started!
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-pulse">
                <CheckCircle className="w-4 h-4" />
                Settings saved & applied!
              </span>
            )}

            <button
              type="submit"
              id="btn-save-settings"
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
