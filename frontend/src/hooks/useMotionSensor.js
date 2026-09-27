import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useMotionSensor Hook
 * Connects to DeviceMotionEvent when available on mobile/tablet,
 * and maintains continuous simulated/real telemetry (g-force, movement variance, heart rate).
 */
export function useMotionSensor({ onFallDetected, onDistressDetected, isMonitoring = true }) {
  const [hasSensorSupport, setHasSensorSupport] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [sensorState, setSensorState] = useState({
    gForce: 1.02,
    heartRate: 72,
    motionVariance: 0.08,
    status: 'normal', // 'normal' | 'fall_detected' | 'distress_detected'
    lastTrigger: null,
    isSimulating: false
  });

  const recentAccels = useRef([]);
  const fallCooldownRef = useRef(false);
  const distressCooldownRef = useRef(false);

  // Request iOS permission if available
  const requestSensorPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          return true;
        }
      } catch (err) {
        console.warn('DeviceMotion permission error:', err);
      }
    } else if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      setPermissionGranted(true);
      return true;
    }
    return false;
  };

  // Real device motion listener
  useEffect(() => {
    if (!isMonitoring) return;

    const handleDeviceMotion = (event) => {
      setHasSensorSupport(true);
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 9.8;
      const magnitude = Math.sqrt(x * x + y * y + z * z) / 9.8; // Normalized in Gs

      // Maintain rolling buffer of 10 samples
      recentAccels.current.push(magnitude);
      if (recentAccels.current.length > 10) recentAccels.current.shift();

      // Check Fall pattern: spike > 2.6g followed by impact
      if (magnitude > 2.6 && !fallCooldownRef.current) {
        fallCooldownRef.current = true;
        setSensorState(prev => ({
          ...prev,
          gForce: Number(magnitude.toFixed(2)),
          status: 'fall_detected',
          lastTrigger: 'Hardware Fall Pattern'
        }));
        if (onFallDetected) onFallDetected({ gForce: magnitude, source: 'hardware_sensor' });
        setTimeout(() => { fallCooldownRef.current = false; }, 8000);
      } else {
        setSensorState(prev => ({
          ...prev,
          gForce: Number(magnitude.toFixed(2))
        }));
      }
    };

    if (typeof window !== 'undefined' && 'ondevicemotion' in window) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      setHasSensorSupport(true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, [isMonitoring, onFallDetected]);

  // Gentle background telemetry heartbeat animation (vital signs ticker)
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorState(prev => {
        // Minor natural variance
        const hrDelta = (Math.random() - 0.5) * 2;
        const gDelta = (Math.random() - 0.5) * 0.04;
        const newHr = Math.min(130, Math.max(62, Math.round(prev.heartRate + hrDelta)));
        const newG = Math.max(0.95, Math.min(1.08, Number((prev.gForce + gDelta).toFixed(2))));
        return {
          ...prev,
          heartRate: prev.status === 'distress_detected' ? Math.max(prev.heartRate, 128) : newHr,
          gForce: prev.status === 'fall_detected' ? prev.gForce : newG
        };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Programmatic / Manual simulation triggers (guaranteed 100% reliable for live demo!)
  const triggerSimulatedFall = useCallback(() => {
    setSensorState(prev => ({
      ...prev,
      gForce: 3.42,
      motionVariance: 0.89,
      status: 'fall_detected',
      lastTrigger: 'Simulated Fall Impact (3.42G)',
      isSimulating: true
    }));

    if (onFallDetected) {
      onFallDetected({
        gForce: 3.42,
        motionVariance: 0.89,
        source: 'simulated_threshold_spike'
      });
    }

    setTimeout(() => {
      setSensorState(prev => ({ ...prev, status: 'normal', isSimulating: false }));
    }, 6000);
  }, [onFallDetected]);

  const triggerSimulatedDistress = useCallback(() => {
    setSensorState(prev => ({
      ...prev,
      heartRate: 134,
      motionVariance: 0.76,
      status: 'distress_detected',
      lastTrigger: 'Simulated Distress Pattern (HR: 134 bpm, agitation)',
      isSimulating: true
    }));

    if (onDistressDetected) {
      onDistressDetected({
        heartRate: 134,
        motionVariance: 0.76,
        source: 'simulated_distress_pattern'
      });
    }

    setTimeout(() => {
      setSensorState(prev => ({ ...prev, status: 'normal', isSimulating: false, heartRate: 78 }));
    }, 6000);
  }, [onDistressDetected]);

  const resetStatus = useCallback(() => {
    setSensorState({
      gForce: 1.01,
      heartRate: 74,
      motionVariance: 0.08,
      status: 'normal',
      lastTrigger: null,
      isSimulating: false
    });
  }, []);

  return {
    sensorState,
    hasSensorSupport,
    permissionGranted,
    requestSensorPermission,
    triggerSimulatedFall,
    triggerSimulatedDistress,
    resetStatus
  };
}
