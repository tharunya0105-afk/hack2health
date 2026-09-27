import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Heart, 
  MapPin, 
  UserCheck, 
  Send, 
  CheckCircle2, 
  Radio, 
  Zap, 
  Sparkles,
  Info,
  Clock,
  Eye,
  Sliders
} from 'lucide-react';
import { useMotionSensor } from '../hooks/useMotionSensor';

export function SafetyDashboard({ userProfile, onTriggerAlert, lastDispatchedAlert }) {
  const [sosCountdown, setSosCountdown] = useState(null);
  const [userLocation, setUserLocation] = useState({
    lat: 37.7749,
    lng: -122.4194,
    label: "Moscone Center West, San Francisco, CA (Demo Venue)",
    accuracy: 8
  });
  const [locationStatus, setLocationStatus] = useState('Standby (Acquired on alert only)');
  const [lastDispatchedInfo, setLastDispatchedInfo] = useState(lastDispatchedAlert || null);

  // Sync prop changes
  useEffect(() => {
    if (lastDispatchedAlert) {
      setLastDispatchedInfo(lastDispatchedAlert);
    }
  }, [lastDispatchedAlert]);

  // Request browser location if available
  const acquireLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation && userProfile.shareLocationOnAlert) {
        setLocationStatus('Acquiring precise GPS...');
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = {
              lat: Number(pos.coords.latitude.toFixed(5)),
              lng: Number(pos.coords.longitude.toFixed(5)),
              label: `GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`,
              accuracy: Math.round(pos.coords.accuracy)
            };
            setUserLocation(loc);
            setLocationStatus('GPS Coordinates Locked');
            resolve(loc);
          },
          (err) => {
            console.warn('Geolocation fallback:', err.message);
            setLocationStatus('Demo Venue Fallback');
            resolve(userLocation);
          },
          { timeout: 4000 }
        );
      } else {
        resolve(userLocation);
      }
    });
  };

  // Dispatch alert to backend / Guardian
  const dispatchAlert = async (type, notes, metrics) => {
    const loc = await acquireLocation();
    const payload = {
      type,
      location: userProfile.shareLocationOnAlert ? loc : null,
      wearerId: userProfile.id,
      wearerName: userProfile.name,
      notes: notes || `Triggered via Wearer Safety Console (${type})`,
      metrics: metrics || { gForce: sensorState.gForce, heartRate: sensorState.heartRate }
    };

    try {
      const res = await fetch('/api/alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setLastDispatchedInfo(data.alert);
        if (onTriggerAlert) onTriggerAlert(data.alert);
      }
    } catch (err) {
      console.error('Failed to dispatch alert:', err);
    }
  };

  // Motion sensor hook
  const {
    sensorState,
    hasSensorSupport,
    triggerSimulatedFall,
    triggerSimulatedDistress,
    resetStatus
  } = useMotionSensor({
    isMonitoring: userProfile.fallDetectionActive || userProfile.distressDetectionActive,
    onFallDetected: (data) => {
      if (userProfile.fallDetectionActive) {
        dispatchAlert('fall', `Fall detected: ${data.gForce.toFixed(2)}G impact pattern`, data);
      }
    },
    onDistressDetected: (data) => {
      if (userProfile.distressDetectionActive) {
        dispatchAlert('distress', `Distress pattern: elevated vitals (${data.heartRate} bpm) + kinetic variance`, data);
      }
    }
  });

  // Manual SOS trigger with safety countdown
  const handleSosClick = () => {
    if (sosCountdown !== null) return;
    // 3-second countdown to avoid accidental presses while allowing immediate cancellation
    setSosCountdown(3);
  };

  useEffect(() => {
    let timer;
    if (sosCountdown !== null && sosCountdown > 0) {
      timer = setTimeout(() => {
        setSosCountdown(sosCountdown - 1);
      }, 1000);
    } else if (sosCountdown === 0) {
      setSosCountdown(null);
      dispatchAlert('manual_sos', 'Manual SOS initiated directly by wearer Alex', {
        gForce: sensorState.gForce,
        heartRate: sensorState.heartRate
      });
    }
    return () => clearTimeout(timer);
  }, [sosCountdown]);

  const cancelSos = () => {
    setSosCountdown(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner: Wearer Sovereignty Notice */}
      <div className="glass-panel rounded-2xl p-4 border-l-4 border-indigo-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
              Wearer Safety Console
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                ACTIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              You are in full control. No passive audio recording or continuous tracking is transmitted without your trigger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-slate-300">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Guardian: <strong className="text-white">{userProfile.guardianContact.name}</strong></span>
        </div>
      </div>

      {/* Main Grid: SOS Hero + Sensor Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Big Manual SOS Button */}
        <div className="lg:col-span-6 flex flex-col justify-between glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-rose-500/20 shadow-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold tracking-wider uppercase text-rose-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
                Emergency Assistance
              </span>
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                1-Touch Dispatch
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Immediate SOS Broadcast</h2>
            <p className="text-sm text-slate-300 mb-6">
              Press to immediately send your GPS coordinates and an urgent high-priority distress signal to{' '}
              <span className="text-rose-300 font-medium">{userProfile.guardianContact.name}</span>.
            </p>
          </div>

          {/* Central SOS Trigger Button */}
          <div className="my-4 flex flex-col items-center justify-center">
            {sosCountdown !== null ? (
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-rose-600 to-red-700 flex flex-col items-center justify-center text-white shadow-2xl animate-pulse relative border-4 border-rose-300">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-200">Dispatching in</span>
                <span className="text-6xl font-black my-1">{sosCountdown}s</span>
                <button
                  onClick={cancelSos}
                  className="mt-2 px-4 py-1.5 text-xs font-bold bg-white text-rose-700 rounded-full hover:bg-slate-100 transition shadow-md"
                >
                  CANCEL NOW
                </button>
              </div>
            ) : (
              <button
                id="btn-manual-sos"
                onClick={handleSosClick}
                className="group relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-red-500 text-white flex flex-col items-center justify-center shadow-2xl animate-sos-pulse active:scale-95 transition-all duration-200 cursor-pointer border-4 border-rose-400/40"
              >
                <div className="absolute inset-2 rounded-full border border-white/20 group-hover:border-white/40 transition"></div>
                <AlertTriangle className="w-12 h-12 mb-1 drop-shadow group-hover:scale-110 transition-transform duration-200" />
                <span className="text-3xl font-black tracking-tight drop-shadow">SOS</span>
                <span className="text-[11px] font-medium tracking-wide uppercase text-rose-100 mt-1 opacity-90">
                  Tap to Notify
                </span>
              </button>
            )}
          </div>

          {/* Safety Transparency Footer */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              Location on alert: <strong className="text-slate-200">{userProfile.shareLocationOnAlert ? 'Enabled' : 'Disabled'}</strong>
            </span>
            <span className="text-slate-400">
              Target: <strong className="text-slate-300">{userProfile.guardianContact.phone}</strong>
            </span>
          </div>
        </div>

        {/* Right Column: Sensor Monitoring & Guaranteed Demo Fallbacks */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Live Sensor Metrics Card */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-white text-sm">Autonomous Sensory Monitor</h3>
              </div>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                userProfile.fallDetectionActive 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {userProfile.fallDetectionActive ? 'Rules Engine Active' : 'Sensors Paused'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Accelerometer / G-Force */}
              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Kinetic G-Force</span>
                  <Zap className={`w-3.5 h-3.5 ${sensorState.gForce > 2.0 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-2xl font-bold font-mono ${sensorState.gForce > 2.0 ? 'text-rose-400' : 'text-white'}`}>
                    {sensorState.gForce.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">G</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${sensorState.gForce > 2.0 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                    style={{ width: `${Math.min(100, (sensorState.gForce / 3.5) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Impact Threshold: &gt; 2.6G</span>
              </div>

              {/* Heart Rate / Vitals */}
              <div className="bg-slate-900/70 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Distress Biomarker</span>
                  <Heart className={`w-3.5 h-3.5 ${sensorState.heartRate > 110 ? 'text-rose-400 animate-pulse' : 'text-rose-400'}`} />
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className={`text-2xl font-bold font-mono ${sensorState.heartRate > 110 ? 'text-rose-400' : 'text-white'}`}>
                    {sensorState.heartRate}
                  </span>
                  <span className="text-xs text-slate-400">BPM</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${sensorState.heartRate > 110 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                    style={{ width: `${Math.min(100, (sensorState.heartRate / 140) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">Distress Threshold: &gt; 120 BPM</span>
              </div>
            </div>

            {/* Hardware Status Note */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Sensor Source: {hasSensorSupport ? 'Device Accelerometer (Active)' : 'Web Hardware API / Simulated Gyro'}
              </span>
              <span className="text-[11px] text-slate-400">Polling: 20Hz</span>
            </div>
          </div>

          {/* Guaranteed Demo Trigger Box (Fires 100% reliably regardless of venue wifi/hardware) */}
          <div className="glass-panel-glow rounded-3xl p-6 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">Live Pitch Simulation Triggers</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                Guaranteed Demo
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Real device sensors can vary across venue hardware. Use these manual test triggers to fire the exact autonomous detection pipeline into the Guardian Dashboard:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-simulate-fall"
                onClick={triggerSimulatedFall}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg hover:shadow-orange-500/20 active:scale-98 transition cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-200" />
                <span>Simulate Fall (Sensor Spike Test)</span>
              </button>

              <button
                id="btn-simulate-distress"
                onClick={triggerSimulatedDistress}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/20 active:scale-98 transition cursor-pointer"
              >
                <Heart className="w-4 h-4 text-purple-200" />
                <span>Simulate Distress (Vitals Spike Test)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800/80 leading-relaxed">
              This hackathon build uses manual test triggers standing in for continuous accelerometer/heart-rate sensors — the alert pipeline itself (detection → Guardian Dashboard → email) is fully real and live.
            </p>
          </div>

        </div>
      </div>

      {/* Dispatched Alert Transparency Card (Shows what data was shared and to whom) */}
      {lastDispatchedInfo && (
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/40 bg-emerald-950/20 shadow-xl transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
                  Alert Successfully Transmitted to Guardian
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 font-mono">
                    ID: {lastDispatchedInfo.id.slice(-8)}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Recipient: <strong className="text-white">{userProfile.guardianContact.name} ({userProfile.guardianContact.phone})</strong>
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(lastDispatchedInfo.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Type: <strong className="text-amber-300 uppercase">{lastDispatchedInfo.type}</strong>
                  </span>
                  {lastDispatchedInfo.location && (
                    <span className="bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {lastDispatchedInfo.location.label}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setLastDispatchedInfo(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
