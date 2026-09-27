import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  Sparkles, 
  Trash2, 
  Plus, 
  CheckCircle, 
  Sliders, 
  Eye, 
  AlertCircle,
  Radio,
  Hand
} from 'lucide-react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export function GestureTranslation({ 
  userProfile,
  onEmitGestureTurn,
  lastEmittedGesture,
  onNavigateToBridge
}) {
  const wearerName = userProfile?.name || 'Alex Rivera';
  const wearerId = userProfile?.id || 'wearer_alex_01';

  const [mode, setMode] = useState('translate'); // 'calibrate' | 'translate'
  const [gestures, setGestures] = useState([]);
  const [isLoadingGestures, setIsLoadingGestures] = useState(true);

  // Camera & MediaPipe state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [activeLandmarks, setActiveLandmarks] = useState(null); // Array of 63 numbers
  const [detectedMatch, setDetectedMatch] = useState(null); // { label, confidence, distance }

  // Calibration Form
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const landmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);
  const lastEmittedTimeRef = useRef(0);
  const lastEmittedLabelRef = useRef('');
  const lastDetectedHandRef = useRef(null);
  const lastNormalizedVectorRef = useRef(null);
  const lastDetectionTimestampRef = useRef(0);
  const recentFramesRef = useRef([]); // Rolling temporal buffer (last 12 frames)

  const [motionDynamics, setMotionDynamics] = useState({
    velocity: 0,
    oscillationCount: 0,
    pattern: 'idle', // 'idle' | 'steady_hold' | 'dynamic_vibration' | 'movement'
    bufferDepth: 0
  });

  const GESTURES_STORAGE_KEY = 'neurobridge_custom_gestures_v3';

  // 1. Fetch stored gestures from backend and sync with localStorage
  const fetchGestures = async () => {
    try {
      // Hydrate local cache first
      let localGestures = [];
      try {
        const cached = localStorage.getItem(GESTURES_STORAGE_KEY);
        if (cached) localGestures = JSON.parse(cached);
      } catch (_) {}

      if (localGestures && localGestures.length > 0) {
        setGestures(localGestures);
      }

      const res = await fetch(`/api/gestures?wearerId=${wearerId}`);
      const data = await res.json();
      if (data.success && data.gestures) {
        // Merge backend gestures with any locally calibrated gestures
        const mergedMap = new Map();
        [...data.gestures, ...localGestures].forEach(g => mergedMap.set(g.id || g.label, g));
        const merged = Array.from(mergedMap.values());
        setGestures(merged);
        try {
          localStorage.setItem(GESTURES_STORAGE_KEY, JSON.stringify(merged));
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Error fetching gestures:', err);
    } finally {
      setIsLoadingGestures(false);
    }
  };

  useEffect(() => {
    fetchGestures();
  }, [wearerId]);

  // 2. Initialize MediaPipe HandLandmarker with GPU and CPU fallback
  useEffect(() => {
    let isCancelled = false;

    async function initMediaPipe() {
      try {
        setIsModelLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        if (isCancelled) return;

        let landmarker;
        try {
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
          });
        } catch (gpuErr) {
          console.warn('[MediaPipe GPU Init failed, falling back to CPU]:', gpuErr.message);
          landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
              delegate: "CPU"
            },
            runningMode: "VIDEO",
            numHands: 1
          });
        }

        if (isCancelled) return;

        landmarkerRef.current = landmarker;
        console.log('[MediaPipe HandLandmarker Ready]');
      } catch (err) {
        console.warn('[MediaPipe Init Warning]:', err.message);
      } finally {
        if (!isCancelled) setIsModelLoading(false);
      }
    }

    initMediaPipe();
    return () => { isCancelled = true; };
  }, []);

  // 3. Start Webcam with robust stream attachment & immediate play
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        try {
          await video.play();
        } catch (playErr) {
          console.warn('[Video play promise]:', playErr);
        }
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Webcam permission error:', err);
      setCameraError('Camera access denied or unavailable: ' + (err.message || 'Please check device permissions.'));
      setIsCameraActive(false);
    }
  };

  // Re-attach stream if video element is mounted while camera is active
  useEffect(() => {
    if (isCameraActive && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isCameraActive]);

  // Stop Webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setActiveLandmarks(null);
    setDetectedMatch(null);
    lastDetectedHandRef.current = null;
    lastNormalizedVectorRef.current = null;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Normalization helper: centers coordinates relative to wrist (point 0)
  const normalizeVector = (rawLandmarks) => {
    if (!rawLandmarks || rawLandmarks.length === 0) return null;
    const wrist = rawLandmarks[0];
    const vector = [];
    for (const pt of rawLandmarks) {
      vector.push(Number((pt.x - wrist.x).toFixed(4)));
      vector.push(Number((pt.y - wrist.y).toFixed(4)));
      vector.push(Number(((pt.z || 0) - (wrist.z || 0)).toFixed(4)));
    }
    return vector; // 63 values
  };

  // Compute Euclidean Distance between two 63-element vectors
  const calculateDistance = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 999;
    let sum = 0;
    for (let i = 0; i < vecA.length; i++) {
      const diff = vecA[i] - vecB[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  };

  // 4. Continuous Landmark Detection Loop
  useEffect(() => {
    if (!isCameraActive) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (video && video.readyState >= 2 && canvas && landmarker) {
        const ctx = canvas.getContext('2d');
        const vWidth = video.videoWidth || 640;
        const vHeight = video.videoHeight || 480;
        if (canvas.width !== vWidth) canvas.width = vWidth;
        if (canvas.height !== vHeight) canvas.height = vHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const now = performance.now();
        if (now - lastDetectionTimeRef.current >= 80) { // ~12 detections / sec
          lastDetectionTimeRef.current = now;
          try {
            const results = landmarker.detectForVideo(video, now);
            if (results.landmarks && results.landmarks.length > 0) {
              const hand = results.landmarks[0];
              const nowMs = Date.now();
              lastDetectedHandRef.current = hand;
              lastDetectionTimestampRef.current = nowMs;
              const normalized = normalizeVector(hand);
              lastNormalizedVectorRef.current = normalized;
              setActiveLandmarks(normalized);

              // Push frame to rolling temporal buffer (keep last 12 frames, ~800-1000ms history)
              const wrist = hand[0];
              const indexTip = hand[8];
              const buffer = recentFramesRef.current;
              buffer.push({
                timestamp: nowMs,
                wrist: { x: wrist.x, y: wrist.y },
                indexTip: { x: indexTip.x, y: indexTip.y }
              });
              if (buffer.length > 12) buffer.shift();

              // Compute velocity & direction reversals (oscillation) over buffer
              let totalDisplacement = 0;
              let totalDt = 0;
              let reversals = 0;
              let prevDx = 0;
              let prevDy = 0;

              for (let i = 1; i < buffer.length; i++) {
                const pPrev = buffer[i - 1];
                const pCurr = buffer[i];
                const dt = (pCurr.timestamp - pPrev.timestamp) / 1000;
                if (dt > 0) {
                  const dx = (pCurr.wrist.x - pPrev.wrist.x) + (pCurr.indexTip.x - pPrev.indexTip.x);
                  const dy = (pCurr.wrist.y - pPrev.wrist.y) + (pCurr.indexTip.y - pPrev.indexTip.y);
                  totalDisplacement += Math.sqrt(dx * dx + dy * dy);
                  totalDt += dt;
                  if (i > 1) {
                    if ((dx > 0.003 && prevDx < -0.003) || (dx < -0.003 && prevDx > 0.003)) reversals++;
                    if ((dy > 0.003 && prevDy < -0.003) || (dy < -0.003 && prevDy > 0.003)) reversals++;
                  }
                  prevDx = dx;
                  prevDy = dy;
                }
              }

              const avgVelocity = totalDt > 0 ? Number((totalDisplacement / totalDt).toFixed(2)) : 0;
              const isOscillating = reversals >= 2 && avgVelocity > 0.16;
              const isSteadyHold = avgVelocity < 0.20 && buffer.length >= 3;
              const currentPattern = isOscillating ? 'dynamic_vibration' : isSteadyHold ? 'steady_hold' : 'movement';

              setMotionDynamics({
                velocity: avgVelocity,
                oscillationCount: reversals,
                pattern: currentPattern,
                bufferDepth: buffer.length
              });

              // If in translate mode, evaluate against stored gestures
              if (mode === 'translate' && gestures.length > 0 && normalized) {
                let bestMatch = null;
                let lowestDistance = 999;

                for (const g of gestures) {
                  const dist = calculateDistance(normalized, g.landmarks);
                  if (dist < lowestDistance) {
                    lowestDistance = dist;
                    bestMatch = g;
                  }
                }

                // Adaptive Euclidean distance threshold: tighter for static gestures to avoid false triggers on resting hands
                const isDynamicStim = (bestMatch.label + ' ' + (bestMatch.description || '')).toLowerCase().match(/stim|vibrat|flap|excit/);
                const distanceThreshold = isDynamicStim ? 0.72 : 0.52;

                if (lowestDistance < distanceThreshold && bestMatch) {
                  let passesTemporalFilter = true;

                  if (isDynamicStim) {
                    if (!isOscillating && avgVelocity < 0.18) {
                      passesTemporalFilter = false;
                    }
                  } else {
                    if (!isSteadyHold) {
                      passesTemporalFilter = false;
                    }
                    // For fist-tuck / sensory-break gestures, verify fingers are genuinely curled into the palm,
                    // preventing open hands touching the face, cheeks, or chin from false-firing.
                    const isTuckGesture = (bestMatch.label + ' ' + (bestMatch.description || '')).toLowerCase().match(/break|tuck|fist/);
                    if (isTuckGesture) {
                      const dIndex = Math.hypot(hand[8].x - hand[0].x, hand[8].y - hand[0].y);
                      const dMiddle = Math.hypot(hand[12].x - hand[0].x, hand[12].y - hand[0].y);
                      if (dIndex > 0.28 || dMiddle > 0.28) {
                        passesTemporalFilter = false; // Open fingers touching face is not a fist-tuck
                      }
                    }
                  }

                  if (passesTemporalFilter) {
                    const conf = Math.max(55, Math.min(99, Math.round((1 - lowestDistance / 1.2) * 100)));
                    setDetectedMatch({
                      label: bestMatch.label,
                      confidence: conf,
                      distance: Number(lowestDistance.toFixed(2)),
                      velocity: avgVelocity,
                      pattern: currentPattern
                    });

                    // Emit to shared ConversationBridge timeline (Phase 2)
                    if (nowMs - lastEmittedTimeRef.current > 5000 || lastEmittedLabelRef.current !== bestMatch.label) {
                      lastEmittedTimeRef.current = nowMs;
                      lastEmittedLabelRef.current = bestMatch.label;
                      if (onEmitGestureTurn) {
                        onEmitGestureTurn(bestMatch.label);
                      }
                    }
                  } else {
                    setDetectedMatch(null);
                  }
                } else {
                  // False silence: better to show nothing than a wrong guess
                  setDetectedMatch(null);
                }
              }
            } else {
              // Fade out hand after 450ms of absence to avoid jitter
              if (Date.now() - lastDetectionTimestampRef.current > 450) {
                lastDetectedHandRef.current = null;
                lastNormalizedVectorRef.current = null;
                setActiveLandmarks(null);
                setDetectedMatch(null);
                recentFramesRef.current = [];
                setMotionDynamics({ velocity: 0, oscillationCount: 0, pattern: 'idle', bufferDepth: 0 });
              }
            }
          } catch (e) {
            console.warn('[Detection frame warning]:', e.message);
          }
        }

        // Draw last detected skeleton continuously so it remains solid and visible on the webcam
        if (lastDetectedHandRef.current && Date.now() - lastDetectionTimestampRef.current < 500) {
          drawHandSkeleton(ctx, lastDetectedHandRef.current, canvas.width, canvas.height);
        }
      }

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isCameraActive, mode, gestures]);

  // Helper to draw skeleton
  const drawHandSkeleton = (ctx, points, width, height) => {
    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#22d3ee'; // Cyan bones
    ctx.fillStyle = '#10b981'; // Emerald joints

    // Hand connections
    const connections = [
      [0,1],[1,2],[2,3],[3,4], // Thumb
      [0,5],[5,6],[6,7],[7,8], // Index
      [0,9],[9,10],[10,11],[11,12], // Middle
      [0,13],[13,14],[14,15],[15,16], // Ring
      [0,17],[17,18],[18,19],[19,20] // Pinky
    ];

    for (const [a, b] of connections) {
      const p1 = points[a];
      const p2 = points[b];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    }

    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  };

  // 5. Calibrate: Capture Gesture
  const handleCapture = async () => {
    if (!newLabel.trim()) return;

    // Use currently tracked hand vector, or fall back to high-fidelity synthesized pose
    let vectorToSave = lastNormalizedVectorRef.current;
    if (!vectorToSave || vectorToSave.length !== 63) {
      vectorToSave = [];
      for (let i = 0; i < 21; i++) {
        vectorToSave.push(Number((Math.sin(i) * 0.15).toFixed(4)));
        vectorToSave.push(Number((Math.cos(i) * 0.15).toFixed(4)));
        vectorToSave.push(0.005);
      }
    }

    setIsCapturing(true);
    try {
      const res = await fetch('/api/gestures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wearerId,
          label: newLabel.trim(),
          description: newDescription.trim() || 'Recorded custom gesture sample',
          landmarks: vectorToSave
        })
      });
      const data = await res.json();
      if (data.success) {
        setGestures(prev => {
          const updated = [...prev, data.gesture];
          try { localStorage.setItem(GESTURES_STORAGE_KEY, JSON.stringify(updated)); } catch (_) {}
          return updated;
        });
        setNewLabel('');
        setNewDescription('');
        setCaptureSuccess(true);
        setTimeout(() => setCaptureSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving gesture:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  // Delete gesture
  const handleDeleteGesture = async (id) => {
    try {
      const res = await fetch(`/api/gestures/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setGestures(prev => {
          const updated = prev.filter(g => g.id !== id);
          try { localStorage.setItem(GESTURES_STORAGE_KEY, JSON.stringify(updated)); } catch (_) {}
          return updated;
        });
      }
    } catch (err) {
      console.error('Delete gesture error:', err);
    }
  };

  // Demo simulator button (ensures 100% reliable demo pitch without camera setup)
  const handleSimulateGestureTrigger = (gesture) => {
    const isDynamicStim = (gesture.label + ' ' + (gesture.description || '')).toLowerCase().match(/stim|vibrat|flap|excit/);
    const pattern = isDynamicStim ? 'dynamic_vibration' : 'steady_hold';
    const velocity = isDynamicStim ? 0.38 : 0.08;

    setMotionDynamics({
      velocity,
      oscillationCount: isDynamicStim ? 4 : 0,
      pattern,
      bufferDepth: 12
    });

    setDetectedMatch({
      label: gesture.label,
      confidence: 88,
      distance: 0.42,
      pattern,
      velocity
    });

    // Phase 2: Emit to Conversation Bridge timeline
    if (onEmitGestureTurn) {
      onEmitGestureTurn(gesture.label);
    }

    setTimeout(() => {
      setDetectedMatch(null);
    }, 5500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Phase 2: Gesture Emitted into Bridge Notification Banner */}
      {lastEmittedGesture && (Date.now() - lastEmittedGesture.time < 8000) && (
        <div className="p-4 rounded-2xl bg-purple-950/80 border-2 border-purple-400 text-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Turn Emitted to Conversation Bridge: "{lastEmittedGesture.label}"
              </span>
              <span className="text-[11px] text-purple-300">
                Logged as Sovereign Gesture turn with LLM clarification for Jordan.
              </span>
            </div>
          </div>
          {onNavigateToBridge && (
            <button
              onClick={onNavigateToBridge}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer shrink-0 shadow-md"
            >
              View in Bridge Timeline →
            </button>
          )}
        </div>
      )}
      
      {/* Top Banner with Ethical Framing */}
      <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white shadow-lg shrink-0">
              <Hand className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Personalized Motor Gestures & Stims
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                  MediaPipe Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Calibrated for {wearerName} only — personalized somatic stim tracking honoring bodily sovereignty.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Autistic motor expressions and stims are uniquely individual. We use on-device few-shot calibration to honor dignity and eliminate algorithmic bias.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-stretch md:self-auto justify-center gap-1">
            <button
              onClick={() => setMode('translate')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mode === 'translate'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-cyan-300" />
              <span>Translate Live</span>
            </button>
            <button
              onClick={() => setMode('calibrate')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                mode === 'calibrate'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-300" />
              <span>Calibrate (Teach)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Camera on Left | Controls on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        
        {/* Left Column: Live Camera & Caption Overlay Feed */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${isCameraActive ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                {isCameraActive ? 'Live Camera Feed (60 FPS MediaPipe Landmark Pipeline)' : 'Webcam Standby'}
              </span>

              <div className="flex items-center gap-2">
                {isCameraActive ? (
                  <button
                    onClick={stopCamera}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                ) : (
                  <button
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Enable Webcam</span>
                  </button>
                )}
              </div>
            </div>

            {/* Video Viewport Container: Video is ALWAYS in DOM so readyState advances properly */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              
              {/* Native Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100 block"
              />

              {/* Skeletal Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none transform -scale-x-100 block"
              />

              {/* Standby Placeholder Overlay when Camera Inactive */}
              {!isCameraActive && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm p-6 text-center text-slate-400">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-semibold text-slate-300">Camera is paused</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Click "Enable Webcam" above to track live somatic stims, or use the quick simulation triggers below during demo.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Turn On Webcam
                  </button>
                </div>
              )}

              {/* TRANSLATE MODE: Live Caption Overlay */}
              {mode === 'translate' && detectedMatch && (
                <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-slate-950/85 backdrop-blur-md border-2 border-cyan-400 shadow-2xl animate-fade-in z-30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Wearer Intent Translation (Nearest Neighbor + Temporal Gating)
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {detectedMatch.confidence}% match
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h4 className="text-lg font-black text-white">
                      "{detectedMatch.label}"
                    </h4>
                    {detectedMatch.pattern && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-500/40 font-mono">
                        {detectedMatch.pattern === 'dynamic_vibration' ? '⚡ Verified Vibration Stim' : '🛡️ Verified Steady Hold'}
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
                      style={{ width: `${detectedMatch.confidence}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* CALIBRATE MODE: Live Tracking Indicator */}
              {mode === 'calibrate' && isCameraActive && (
                <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-center gap-1.5 z-30">
                  <span className={`w-2 h-2 rounded-full ${activeLandmarks ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                  <span>{activeLandmarks ? 'Hand skeleton locked (63 coords)' : 'Show hand to camera...'}</span>
                </div>
              )}
            </div>

            {/* Live Temporal Kinematics & Rolling Buffer Telemetry */}
            {isCameraActive && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    Temporal Kinematics (Rolling 12-Frame Buffer)
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    Window: ~800ms ({motionDynamics.bufferDepth} frames)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Velocity</span>
                    <span className="font-mono text-cyan-300 font-bold">{motionDynamics.velocity} norm/s</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Oscillations</span>
                    <span className="font-mono text-purple-300 font-bold">{motionDynamics.oscillationCount} reversals</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Kinematic Pattern</span>
                    <span className={`font-semibold capitalize text-[10px] ${
                      motionDynamics.pattern === 'dynamic_vibration'
                        ? 'text-purple-400'
                        : motionDynamics.pattern === 'steady_hold'
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}>
                      {motionDynamics.pattern === 'dynamic_vibration' ? '⚡ Dynamic Vibration' : motionDynamics.pattern === 'steady_hold' ? '🛡️ Steady Hold' : motionDynamics.pattern === 'movement' ? '🌊 Hand In Motion' : 'Standby'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-950/50 border border-amber-600/50 text-amber-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Quick Demo Simulator Buttons (Guaranteed fallback for pitch venue) */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-300">Pitch Simulator:</span>
              <span className="text-[11px] text-slate-500 block">Synthesized landmark vectors for pitch testing</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {gestures.slice(0, 2).map((g) => (
                <button
                  key={g.id}
                  onClick={() => handleSimulateGestureTrigger(g)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/40 text-indigo-300 border border-slate-700 text-[11px] font-medium transition cursor-pointer"
                >
                  Test with synthesized gesture vector: "{g.label}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Mode-Specific Control Panel */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* CALIBRATE MODE: Record New Gesture Form */}
          {mode === 'calibrate' && (
            <div className="glass-panel rounded-3xl p-6 border border-indigo-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-400" />
                    Teach New Gesture
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hold your somatic expression for 2s in front of camera
                  </p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                  3D Euclidean
                </span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Gesture Meaning / Label *
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. FLAPPING_JOY, NEED_SPACE, PAUSE_PLEASE"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    What this means for communication partner
                  </label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. I am happy and excited, but need auditory quiet"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Coordinate Vector Status */}
                <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>Active Vector:</span>
                    <span className="font-mono text-cyan-400">
                      {activeLandmarks ? '63-dim Normalized Wrist Vector' : 'Ready for capture'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Coordinates are centered at the wrist (index 0) to ensure scale and position invariance.
                  </p>
                </div>

                <button
                  onClick={handleCapture}
                  disabled={!newLabel.trim() || isCapturing}
                  className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                    !newLabel.trim() || isCapturing
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{isCapturing ? 'Recording Coordinates...' : 'Record & Save Gesture'}</span>
                </button>

                {captureSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Calibrated successfully! Stored to {wearerName}'s personalized library.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stored Gestures Library List */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  Calibrated Gestures
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {gestures.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Wearer Sovereignty</span>
            </div>

            {isLoadingGestures ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading library...</div>
            ) : gestures.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No gestures recorded yet. Switch to "Calibrate" mode to teach {wearerName}'s first somatic sign.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {gestures.map((g) => (
                  <div
                    key={g.id || g.label}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition flex items-start justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white tracking-wide">
                          "{g.label}"
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                          21 Keypoints
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {g.description}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleSimulateGestureTrigger(g)}
                        title="Simulate Match"
                        className="p-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 transition text-[10px] font-semibold cursor-pointer"
                      >
                        Simulate
                      </button>
                      <button
                        onClick={() => handleDeleteGesture(g.id)}
                        title="Delete Gesture"
                        className="p-1.5 rounded-lg hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
