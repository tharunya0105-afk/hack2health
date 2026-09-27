/**
 * NeuroBridge Shared Types & Data Shapes (v3 Multimodal)
 */

/**
 * @typedef {Object} LocationData
 * @property {number} lat - Latitude
 * @property {number} lng - Longitude
 * @property {string} label - Human-readable address / landmark
 * @property {number} [accuracy] - Accuracy in meters
 */

/**
 * @typedef {Object} AlertEvent
 * @property {string} id - Unique alert ID
 * @property {"fall" | "distress" | "manual_sos"} type - Trigger type
 * @property {string} timestamp - ISO timestamp
 * @property {LocationData | null} location - Location snapshot at trigger
 * @property {"new" | "acknowledged" | "resolved"} status - Workflow state
 * @property {string} wearerId - ID of the wearer
 * @property {string} [wearerName] - Display name of the wearer
 * @property {string} [notes] - Additional sensor context / trigger notes
 * @property {Object} [metrics] - Sensor metrics (e.g. gForce, heartRate, motionVariance)
 * @property {Object} [emailDispatch] - Email notification delivery status and preview link
 */

/**
 * @typedef {Object} ConversationTurn
 * @property {string} id - Unique turn ID
 * @property {"autistic" | "neurotypical"} speaker - Speaker role
 * @property {"speech" | "typed" | "scanning" | "gesture"} inputMethod - Input method channel
 * @property {string} text - Spoken transcript, typed AAC message, or recognized gesture label
 * @property {string} timestamp - ISO timestamp
 * @property {string | null} clarification - Clarifying sentence for the listener (or null)
 * @property {"sarcasm" | "idiom" | "bluntness" | "ambiguous_question" | "other" | null} [category] - Clarification category
 * @property {"helpful" | "unhelpful" | null} [feedback] - Wearer feedback
 * @property {boolean} [analyzed] - Whether LLM analysis has completed
 */

/**
 * @typedef {Object} GestureSample
 * @property {string} id - Unique sample ID
 * @property {string} wearerId - Associated wearer ID
 * @property {string} label - Personalized meaning (e.g. "excited", "overstimulated", "need a break")
 * @property {number[]} landmarks - Flattened landmark coordinate vector (normalized)
 * @property {string} createdAt - ISO timestamp
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - Wearer ID
 * @property {string} name - Wearer display name
 * @property {boolean} bridgeActive - Whether Communication Bridge is enabled
 * @property {boolean} fallDetectionActive - Whether fall detection is enabled
 * @property {boolean} distressDetectionActive - Whether distress detection is enabled
 * @property {boolean} shareLocationOnAlert - Whether GPS location is shared on alerts only
 * @property {boolean} scanningKeyboardEnabled - Whether switch-scanning on-screen AAC keyboard is active
 * @property {number} scanningSpeedMs - Time in milliseconds between auto-scan tile advancements
 * @property {Object} guardianContact - Guardian details
 * @property {string} guardianContact.name - Guardian name
 * @property {string} guardianContact.phone - Guardian phone/SMS
 * @property {string} guardianContact.email - Guardian email for real-time dispatch
 * @property {string} guardianContact.relationship - Relationship
 */

export const DEFAULT_USER_PROFILE = {
  id: "wearer_alex_01",
  name: "Alex Rivera",
  bridgeActive: true,
  fallDetectionActive: true,
  distressDetectionActive: true,
  shareLocationOnAlert: true,
  scanningKeyboardEnabled: false,
  scanningSpeedMs: 1200,
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
  specialInterests: ["Robotics & Python", "Astronomy", "Indie Gaming", "Digital Art"],
  schoolContext: "Homeschooled student preparing for mainstream campus & peer life",
  socialBattery: 85
};
