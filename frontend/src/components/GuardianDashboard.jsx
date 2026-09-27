import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle, 
  MapPin, 
  Clock, 
  Phone, 
  User, 
  ExternalLink, 
  Trash2, 
  Activity, 
  Radio, 
  AlertOctagon, 
  Smartphone, 
  RefreshCw,
  Heart,
  Zap,
  ChevronRight
} from 'lucide-react';

export function GuardianDashboard({ userProfile, onAlertCountChange }) {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNotification, setActiveNotification] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'new' | 'resolved'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch alerts from backend
  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.alerts);
        if (onAlertCountChange) {
          const newCount = data.alerts.filter(a => a.status === 'new').length;
          onAlertCountChange(newCount);
        }
      }
    } catch (err) {
      console.warn('Error fetching alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to SSE stream for instantaneous live pushes
  useEffect(() => {
    fetchAlerts();

    let eventSource;
    try {
      eventSource = new EventSource('/events');
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'NEW_ALERT') {
            const newAlert = data.alert;
            setAlerts(prev => [newAlert, ...prev.filter(a => a.id !== newAlert.id)]);
            setActiveNotification(newAlert);
            setSelectedAlert(newAlert);

            // Audio alert tone simulation (gentle web audio beep)
            if (soundEnabled && typeof window !== 'undefined' && window.AudioContext) {
              try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.6);
              } catch (_) {}
            }

            // Auto dismiss notification banner after 9s
            setTimeout(() => {
              setActiveNotification(prev => (prev?.id === newAlert.id ? null : prev));
            }, 9000);
          } else if (data.type === 'UPDATE_ALERT') {
            setAlerts(prev => prev.map(a => a.id === data.alert.id ? data.alert : a));
          } else if (data.type === 'CLEAR_ALERTS') {
            setAlerts([]);
            setSelectedAlert(null);
          }
        } catch (e) {
          console.error('SSE JSON error:', e);
        }
      };

      eventSource.onerror = () => {
        // Fallback to polling every 4 seconds if SSE disconnects
        console.warn('SSE disconnected, polling fallback active');
      };
    } catch (e) {
      console.error('SSE initialization error:', e);
    }

    const pollInterval = setInterval(fetchAlerts, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollInterval);
    };
  }, [soundEnabled]);

  // Acknowledge or Resolve alert
  const updateAlertStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(prev => prev.map(a => a.id === id ? data.alert : a));
        if (selectedAlert?.id === id) {
          setSelectedAlert(data.alert);
        }
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Clear demo alerts
  const clearAllAlerts = async () => {
    try {
      await fetch('/api/alerts', { method: 'DELETE' });
      setAlerts([]);
      setSelectedAlert(null);
    } catch (err) {
      console.error('Clear failed:', err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'new') return a.status === 'new';
    if (filter === 'resolved') return a.status === 'resolved';
    return true;
  });

  const activeAlertsCount = alerts.filter(a => a.status === 'new').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header & Guardian Status Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <ShieldAlert className="w-7 h-7" />
            </div>
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-ping"></span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Guardian Console</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SSE LINK
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Receiving telemetry & alerts for wearer <strong className="text-slate-200">{userProfile?.name || 'Alex Rivera'}</strong> (Primary Contact: {userProfile?.guardianContact?.name || 'Sarah Rivera'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
          <button
            onClick={fetchAlerts}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={clearAllAlerts}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700/50 text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Log</span>
          </button>
        </div>
      </div>

      {/* Simulated Push Notification Toast (appears when new alert is received) */}
      {activeNotification && (
        <div className="glass-panel-glow rounded-2xl p-4 sm:p-5 border-2 border-rose-500 bg-rose-950/40 shadow-2xl animate-alert-beacon transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3.5">
              <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-lg animate-bounce">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Simulated SMS & Push Alert Delivered
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(activeNotification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                  CRITICAL ALERT: {activeNotification.type === 'manual_sos' ? 'Manual SOS Initiated' : activeNotification.type === 'fall' ? 'Impact Fall Detected' : 'Acute Distress Detected'}
                </h4>
                <p className="text-xs sm:text-sm text-rose-100/90 mt-1">
                  Wearer <strong>{activeNotification.wearerName}</strong> triggered an emergency event. Location:{' '}
                  <span className="underline">{activeNotification.location?.label || 'Latitude/Longitude available'}</span>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => updateAlertStatus(activeNotification.id, 'acknowledged')}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => updateAlertStatus(activeNotification.id, 'resolved')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveNotification(null)}
              className="text-xs text-rose-300 hover:text-white px-2 py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Alerts Feed + Selected Alert Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Alerts Feed List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Event Incident History ({filteredAlerts.length})
            </h3>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${filter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`px-2.5 py-1 rounded-lg transition ${filter === 'new' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Active ({activeAlertsCount})
              </button>
              <button
                onClick={() => setFilter('resolved')}
                className={`px-2.5 py-1 rounded-lg transition ${filter === 'resolved' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Resolved
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400 text-sm">
              Loading alert telemetry...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center border border-slate-800">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-300">All clear — No active alerts</p>
              <p className="text-xs text-slate-400 mt-1">
                Trigger a "Simulate Fall", "Simulate Distress", or "SOS" in the Wearer Safety tab to test live reception.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id;
                const isNew = alert.status === 'new';

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`glass-panel rounded-2xl p-4 transition-all cursor-pointer border ${
                      isNew 
                        ? 'border-rose-500/50 bg-rose-950/20 shadow-lg' 
                        : isSelected 
                          ? 'border-indigo-500/60 bg-indigo-950/20' 
                          : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-xl mt-0.5 ${
                          alert.type === 'manual_sos' 
                            ? 'bg-rose-500/20 text-rose-400' 
                            : alert.type === 'fall' 
                              ? 'bg-amber-500/20 text-amber-400' 
                              : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {alert.type === 'manual_sos' ? (
                            <AlertOctagon className="w-4 h-4" />
                          ) : alert.type === 'fall' ? (
                            <Zap className="w-4 h-4" />
                          ) : (
                            <Heart className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm uppercase">
                              {alert.type.replace('_', ' ')}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              alert.status === 'new' 
                                ? 'bg-rose-500 text-white animate-pulse' 
                                : alert.status === 'acknowledged'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {alert.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mt-1 line-clamp-1">
                            {alert.notes || 'Automated sensor event'}
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </span>
                            {alert.location && (
                              <span className="flex items-center gap-1 truncate max-w-[180px]">
                                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                                {alert.location.label}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-400 mt-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Alert Detailed Inspector & Action Suite */}
        <div className="lg:col-span-6">
          {selectedAlert ? (
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5 sticky top-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-400">
                    Incident Dossier
                  </span>
                  <h3 className="text-lg font-bold text-white capitalize mt-0.5">
                    {selectedAlert.type.replace('_', ' ')} Event
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    selectedAlert.status === 'new' 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : selectedAlert.status === 'acknowledged'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {selectedAlert.status}
                  </span>
                </div>
              </div>

              {/* Wearer & Dispatch Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Wearer Identity</span>
                  <span className="font-semibold text-white text-sm">{selectedAlert.wearerName || 'Alex Rivera'}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Logged Timestamp</span>
                  <span className="font-mono text-slate-200">{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Sensor Metrics Snapshot */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Biometric & Kinetic Sensor Snapshot
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-800/70 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Peak G-Force</span>
                    <span className="text-base font-bold text-amber-400 font-mono">
                      {selectedAlert.metrics?.gForce ? `${selectedAlert.metrics.gForce.toFixed(2)}G` : '1.02G'}
                    </span>
                  </div>
                  <div className="bg-slate-800/70 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                    <span className="text-base font-bold text-rose-400 font-mono">
                      {selectedAlert.metrics?.heartRate ? `${selectedAlert.metrics.heartRate} bpm` : '78 bpm'}
                    </span>
                  </div>
                  <div className="bg-slate-800/70 p-2.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Kinetic State</span>
                    <span className="text-base font-bold text-cyan-400 font-mono">
                      {selectedAlert.type === 'fall' ? 'Impact' : selectedAlert.type === 'distress' ? 'Agitated' : 'User SOS'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Geographic Location Box */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  GPS Geolocation Snapshot
                </h4>
                {selectedAlert.location ? (
                  <div>
                    <p className="text-sm font-medium text-white mb-1">
                      {selectedAlert.location.label}
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      Coordinates: {selectedAlert.location.lat.toFixed(5)}, {selectedAlert.location.lng.toFixed(5)}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedAlert.location.lat},${selectedAlert.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in External Map Navigation
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Location withheld by wearer privacy configuration.
                  </p>
                )}
              </div>

              {/* Real Email Dispatch Status (Phase 4) */}
              {selectedAlert.emailDispatch && (
                <div className="bg-slate-900/60 p-4 rounded-2xl border border-emerald-500/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Real-Time Email Notification
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      SMTP DELIVERED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Dispatched to guardian: <strong className="text-white">{selectedAlert.emailDispatch.recipient}</strong>
                  </p>
                  {selectedAlert.emailDispatch.previewUrl && (
                    <a
                      href={selectedAlert.emailDispatch.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-bold underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Live Rendered HTML Email (Ethereal Inbox)
                    </a>
                  )}
                </div>
              )}

              {/* Guardian Action Suite */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  {selectedAlert.status !== 'resolved' && (
                    <button
                      onClick={() => updateAlertStatus(selectedAlert.id, 'resolved')}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Resolved</span>
                    </button>
                  )}

                  {selectedAlert.status === 'new' && (
                    <button
                      onClick={() => updateAlertStatus(selectedAlert.id, 'acknowledged')}
                      className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Acknowledge</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <a
                    href="tel:+15552348901"
                    onClick={(e) => { e.preventDefault(); alert("Initiating simulated emergency call to Wearer Alex Rivera (+1-555-0199)"); }}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Wearer</span>
                  </a>
                  <button
                    onClick={() => alert("Simulated Emergency Medical Dispatch (EMS) payload compiled with patient coordinates and vitals.")}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-rose-900/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-2 border border-rose-900/50 transition"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Contact EMS</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-10 text-center border border-slate-800 text-slate-400">
              <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-300">No Incident Selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Select an alert from the left column to inspect vital biomarkers, coordinates, and execute guardian resolution actions.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
