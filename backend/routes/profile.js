import express from 'express';

const router = express.Router();

let userProfile = {
  id: "wearer_alex_01",
  name: "Alex Rivera",
  bridgeActive: true,
  fallDetectionActive: true,
  distressDetectionActive: true,
  shareLocationOnAlert: true,
  scanningKeyboardEnabled: false,
  scanningSpeedMs: 1200,
  inwardAffectSensorActive: true,
  // Communication ID: what a first responder or stranger should know in an emergency.
  // Shown on the wearer's lock-screen card + attached to every guardian alert email.
  emergencyCard: {
    primaryChallenge: "I am autistic and sometimes nonverbal under stress.",
    whatHelps: "Speak slowly and literally. No idioms or sarcasm. Give me time to type a reply.",
    emergencyContact: "Sarah Rivera (Mother) — +1 (555) 234-8901"
  },
  guardianContact: {
    name: "Sarah Rivera",
    phone: "+1 (555) 234-8901",
    email: "guardian.sarah@neurobridge.demo",
    relationship: "Mother / Primary Guardian"
  },
  sensorSensitivity: "standard", // "gentle" | "standard" | "high"
  specialInterests: ["Robotics & Python", "Astronomy", "Indie Gaming", "Digital Art"],
  schoolContext: "Homeschooled student preparing for mainstream campus & peer life",
  socialBattery: 85,
  lastUpdated: new Date().toISOString()
};

// Exported getter so other routes (alert dispatch) can read the current guardian contact
export function getUserProfile() {
  return userProfile;
}

// GET current profile & guardian settings
router.get('/', (req, res) => {
  res.json({ success: true, profile: userProfile });
});

// Whitelisted updatable fields — arbitrary junk keys from the client are ignored
// so the profile store can never be polluted with unexpected shape.
const UPDATABLE_KEYS = [
  'name', 'bridgeActive', 'fallDetectionActive', 'distressDetectionActive',
  'shareLocationOnAlert', 'scanningKeyboardEnabled', 'scanningSpeedMs',
  'inwardAffectSensorActive', 'guardianContact', 'emergencyCard', 'sensorSensitivity',
  'specialInterests', 'schoolContext', 'socialBattery'
];

// PUT / PATCH update profile & settings
router.put('/', (req, res) => {
  const updates = req.body || {};
  const picked = {};
  for (const key of UPDATABLE_KEYS) {
    if (updates[key] !== undefined) picked[key] = updates[key];
  }

  userProfile = {
    ...userProfile,
    ...picked,
    guardianContact: {
      ...userProfile.guardianContact,
      ...(typeof picked.guardianContact === 'object' && picked.guardianContact ? picked.guardianContact : {})
    },
    emergencyCard: {
      ...userProfile.emergencyCard,
      ...(typeof picked.emergencyCard === 'object' && picked.emergencyCard ? picked.emergencyCard : {})
    },
    lastUpdated: new Date().toISOString()
  };

  console.log('[USER PROFILE UPDATED]', userProfile);
  res.json({ success: true, profile: userProfile });
});

export default router;
