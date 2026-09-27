import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Helper: generate synthetic normalized 21-point hand landmark vector (63 numbers centered at wrist)
function generateBaselineVector(type) {
  const vec = [];
  for (let i = 0; i < 21; i++) {
    if (i === 0) {
      // Wrist is the origin anchor
      vec.push(0.0, 0.0, 0.0);
      continue;
    }
    if (type === 'open_spread') {
      // Fingers radiating outward and up from wrist
      const fingerIndex = Math.floor((i - 1) / 4);
      const jointIndex = (i - 1) % 4 + 1;
      const xOffset = Number(((fingerIndex - 2) * 0.04 * jointIndex).toFixed(3));
      const yOffset = Number((-0.06 * jointIndex).toFixed(3));
      vec.push(xOffset, yOffset, 0.005);
    } else if (type === 'fist_tuck') {
      // Fingers curled tight into palm
      const fingerIndex = Math.floor((i - 1) / 4);
      const jointIndex = (i - 1) % 4 + 1;
      const xOffset = Number(((fingerIndex - 2) * 0.015 * Math.min(jointIndex, 2)).toFixed(3));
      const yOffset = Number((-0.02 * Math.min(jointIndex, 2)).toFixed(3));
      vec.push(xOffset, yOffset, -0.015);
    } else {
      const xOffset = Number(((i % 5 - 2) * 0.03).toFixed(3));
      const yOffset = Number((-0.04 * Math.floor(i / 5)).toFixed(3));
      vec.push(xOffset, yOffset, 0.0);
    }
  }
  return vec;
}

// In-memory store for wearer's calibrated gestures
let gestures = [
  {
    id: "gesture_cal_01",
    wearerId: "wearer_alex_01",
    label: "Excited & Joyful Stim",
    landmarks: generateBaselineVector('open_spread'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    description: "Rapid open hand vibration indicating euphoric enthusiasm"
  },
  {
    id: "gesture_cal_02",
    wearerId: "wearer_alex_01",
    label: "Need a Sensory Break",
    landmarks: generateBaselineVector('fist_tuck'),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    description: "Tucked palms indicating auditory or visual sensory fatigue"
  }
];

// GET all calibrated gestures for wearer
router.get('/', (req, res) => {
  const wearerId = req.query.wearerId || 'wearer_alex_01';
  const wearerGestures = gestures.filter(g => g.wearerId === wearerId);
  res.json({ success: true, gestures: wearerGestures });
});

// POST a newly recorded gesture calibration
router.post('/', (req, res) => {
  const { label, landmarks, wearerId, description } = req.body;

  if (!label || !landmarks || !Array.isArray(landmarks)) {
    return res.status(400).json({ error: 'Label and landmark coordinate vector are required.' });
  }

  const newGesture = {
    id: `gesture_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    wearerId: wearerId || 'wearer_alex_01',
    label: label.trim(),
    landmarks,
    createdAt: new Date().toISOString(),
    description: description || 'User-recorded custom gesture'
  };

  gestures.push(newGesture);
  console.log(`[GESTURE CALIBRATED] ID: ${newGesture.id}, Label: "${newGesture.label}"`);

  res.status(201).json({ success: true, gesture: newGesture });
});

// DELETE a calibrated gesture
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const initialLength = gestures.length;
  gestures = gestures.filter(g => g.id !== id);

  if (gestures.length === initialLength) {
    return res.status(404).json({ error: 'Gesture not found' });
  }

  res.json({ success: true, message: 'Gesture calibration removed' });
});

export default router;
