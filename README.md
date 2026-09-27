# NeuroBridge: LifeConnect & SocialOrbit 🧠🪐🛡️
> **The National-Level Assistive Communication, Social Re-Entry & Safety Ecosystem for Autistic Individuals.**
> *Official Submission for Hack2Health 2.0 Healthcare Innovation Hackathon*
>
> 🌐 **Try it Live (Production)**: [https://hack2health.vercel.app](https://hack2health.vercel.app)

---

## 🎯 The Core Problem: The Social Cliff & Isolation

Many autistic youth and young adults are **homeschooled or attend segregated special education schools**. While these environments provide tailored academic pacing, they also unintentionally create a profound **social barrier**:

1. **Isolation from Mainstream Peer Life**: Homeschooled and special-school autistic students lack natural everyday exposure to casual peer environments. When stepping into college campuses, workplaces, or community spaces, they encounter **"The Social Cliff"** — high anxiety, fear of missteps, and unfamiliarity with unwritten social norms.
2. **Hidden Subtext & Double-Empathy Miscommunication**: Casual peer life runs on implicit nuance: cafeteria banter, light teasing vs bullying, ambiguous questions, and indirect sarcasm. Autistic directness is frequently misread as rudeness, while neurotypical subtext is taken literally, triggering misunderstandings and withdrawal.
3. **Severe Sensory Overload & Lack of Safe Practice**: Without a safe sandbox to rehearse everyday interactions (lunchrooms, group projects, cafe ordering), the risk of cognitive exhaustion and autistic burnout is immense.
4. **Physical Vulnerability in Crisis**: **1 in 3 autistic children elope** (wander into danger), and many become nonverbal under extreme stress, unable to call for help when an emergency occurs.

Existing tools each tackle only **isolated fragments**: an AAC app, an idiom dictionary, or a parent-controlled surveillance tracker. **None equip the autistic person to confidently step into everyday peer life and take part in society with autonomy.**

---

## 💡 The Solution: 4 Pillars of Normal Life Integration

**NeuroBridge solves the full journey — from social re-entry practice to live peer dialogue and crisis safety:**

### 1. 🪐 LifeConnect: The Social Re-Entry Flight Simulator
A realistic, interactive scenario simulator designed specifically for homeschooled and segregated autistic youth transitioning into mainstream life:
- **School / Campus Cafeteria**: Practicing approaching a table, reading open vs closed body posture, and joining casual group chatter.
- **Group Project Collaboration**: Dividing tasks fairly, clarifying vague assignments, and giving factual input without sounding blunt.
- **Special-Interest Clubs**: Introducing yourself, connecting over shared passions (robotics, gaming, science), and avoiding info-dump overwhelm.
- **Casual Banter vs Teasing**: Deciphering friendly peer ribbing from unkind teasing, with safe, dignified response pathways.
- **Ordering at a Busy Public Cafe**: Navigating rapid counter transactions and ambient noise with confidence.
- **The Graceful Recharge Exit**: Excusing oneself smoothly when social battery depletes without guilt or peer confusion.
- **Features in Every Scenario**:
  - 👁️ **Social Decoder Ring**: Deciphers unwritten body language, tone, and emotional cues.
  - ✨ **Empowerment Coach Tips**: Neuro-affirming, encouraging feedback explaining why your response succeeded.
  - ⚡ **Multi-Tier Response Palettes**: 3 authentic pathways per turn (*Casual & Warm*, *Direct & Honest*, *Low-Energy AAC*), plus free typing/speech.
  - 🔋 **Live Social Battery Gauge**: Real-time energy drain and recovery tracking.
  - 🔊 **Voice Audio Playback**: Realistic peer spoken inflection via Web Speech Synthesis.

### 2. 🤝 Inclusive Peer Circles & Passion-Anchored Connection
- Connects homeschooled and special-school students with inclusive peer buddies and neuro-affirming interest circles:
  - 🤖 **Robotics & Creative Coding** (Python, Arduino, Raspberry Pi, Blender)
  - 🎨 **Digital Art & Worldbuilding** (Procreate, Anime/Manga, Sci-Fi Lore)
  - 🎮 **Minecraft & Indie Game Crafters** (Redstone engineering, low-stimulation servers)
  - 🔭 **Astronomy & Deep Science** (Astrophysics, James Webb discoveries)
- **Parallel Play & Body Doubling**: Quiet co-working spaces with low stimulation — text-first, camera optional, zero forced small talk.
- **Interactive Peer Buddy Chat**: One-click icebreaker prompts and live simulated buddy messaging.

### 3. 🧠 Multimodal Conversation Bridge with Live Social Wingman
- **Unified Timeline**: Speech (Web Speech API), Typed AAC, On-Screen Switch Scanning, and Calibrated Stims/Gestures flow into **one shared conversation**.
- **Two-Way Subtext Translation**: Detects idioms, sarcasm, bluntness, and ambiguous questions in *both directions*, showing warm clarification cards badged **"LIVE AI"** (Google Gemini) or **"OFFLINE ENGINE"**.
- **Live Social Wingman**:
  - 📊 **Turn-Taking Flowmeter**: Real-time visual balance indicator encouraging healthy reciprocal dialogue.
  - 💡 **Special-Interest Bridge**: Connects what peers say to the wearer's passions (e.g. Robotics).
  - ⚡ **Quick Prompt Chips**: Instant follow-up, empathy, and validation phrases.
  - 🚪 **Tactful Exit Card**: One-tap boundary phrase: *"I've reached my sensory limit, heading out to recharge. Had great fun, talk soon!"*

### 4. 🛡️ Autonomous Safety Net with Real Guardian Dispatch
- **Wearer Sovereignty**: The wearer controls every sensor and feature — no continuous surveillance or GPS breadcrumbing.
- **Biometric Emergency Trigger**: Real G-Force impact spike (>2.6G) + stillness detection, distress triggers, and manual SOS.
- **Real-Time Guardian Console**: Live updates via **Server-Sent Events (SSE)** + **Real HTML Email dispatch** (Nodemailer) with Google Maps GPS link and the wearer's Communication ID.
- **Guardian Remote Link**: Open `/?view=guardian` on any phone or second screen for a live guardian command center.

---

## 🔍 Competitive Landscape Comparison

| Feature / System | NeuroTranslator | Avaz / Proloquo2Go ($300) | AngelSense / SafeReturn | NeuroBridge (Hack2Health 2.0) |
|---|---|---|---|---|
| **Social Re-Entry Flight Simulator** | ❌ None | ❌ None | ❌ None | ✅ **LifeConnect (Cafeteria, Projects, Banter, Cafes)** |
| **Peer Circles & Passion Connect** | ❌ None | ❌ None | ❌ None | ✅ **Inclusive Peer Hub (Robotics, Art, Gaming, STEM)** |
| **Live Social Wingman & Turn Flowmeter** | ❌ None | ❌ None | ❌ None | ✅ **Real-time turn balance & special-interest bridge** |
| **Two-Way Live Subtext Clarification** | ❌ Review only | ❌ None | ❌ None | ✅ **Mid-conversation, both directions, live** |
| **Multimodal Inputs in Unified Feed** | ❌ Text only | ❌ AAC grid only | ❌ No conversation | ✅ **Speech + Typed AAC + Switch Scan + Gestures** |
| **Calibrated Personal Stim Gestures** | ❌ None | ❌ None | ❌ None | ✅ **MediaPipe 63D vectors (False-Silence Principle)** |
| **Crisis Safety Net with Real Dispatch** | ❌ None | ❌ None | ⚠️ Passive surveillance | ✅ **Wearer-controlled SSE + Real Email + GPS** |
| **Wearer Sovereignty (Zero Surveillance)** | ❌ No | ❌ N/A | ❌ Strict parental tracker | ✅ **100% wearer controlled, zero surveillance** |

---

## 🏗️ Architecture

```
/hack2health
  /frontend                      -> React 19 + Vite + Tailwind CSS
    /src
      /components
        SocialOrbit.jsx          -> LifeConnect: Social re-entry simulator, decoder, coach, battery
        PeerCircles.jsx          -> Inclusive peer circles & shared passion buddy hub
        ConversationBridge.jsx   -> Unified timeline + Live Social Wingman & Turn Flowmeter
        GestureTranslation.jsx   -> MediaPipe HandLandmarker: calibrated stims -> bridge turns
        BridgeInsights.jsx       -> Honest zero-start analytics & input-channel breakdown
        HowItWorks.jsx           -> Clinical & empirical science (Double Empathy, Social Cliff)
        SafetyDashboard.jsx      -> Wearer biometric safety meters, manual SOS, fall simulation
        GuardianDashboard.jsx    -> Guardian console: live SSE, GPS, email dispatch
        SettingsPanel.jsx        -> Sovereignty toggles, school context, special interests
      /hooks
        useSpeechRecognition.js  -> Web Speech API with interim results
        useMotionSensor.js       -> DeviceMotion API with fall/distress simulators
      App.jsx                    -> Top navigation, turn router, ?view=guardian, pitch deck
  /backend                       -> Node.js + Express (ES Modules)
    /routes
      socialConnect.js           -> /api/social-connect: scenarios, interact, wingman, circles
      analyze.js                 -> /api/analyze: Google Gemini LLM / adaptive heuristic engine
      feedback.js                -> /api/feedback: zero-start tallies, adaptive context
      gestures.js                -> /api/gestures: 63-coordinate hand landmark vectors
      alert.js                   -> /api/alert + SSE /events + Nodemailer email dispatch
      profile.js                 -> /api/profile: whitelist-merged settings + emergency card
    server.js                    -> Express server on port 3001, JSON 404s, 32 KB limit
  /shared
    types.js                     -> Shared types, social context, and default profile
  backend/test-suite.js          -> 15 automated end-to-end tests (100% PASS)
```

---

## 🧪 Automated Test Suite (15/15 Passing)

Run the full end-to-end test suite:
```bash
node backend/test-suite.js                           # Against local server
node backend/test-suite.js https://hack2health.vercel.app  # Against production
```

### Covered Test Matrix:
1. ✅ **API Health & Version Check** (Healthy, v3.0.0, provider report)
2. ✅ **Settings Panel: Scanning Keyboard & Speed Profile Update**
3. ✅ **Phase 1: Direct Typed AAC Input Turn Analysis**
4. ✅ **Phase 1: Switch-Scanning AAC Input Turn Analysis**
5. ✅ **Phase 2: Gesture Match Unified Timeline**
6. ✅ **Phase 3: Multimodal Input Breakdown (Speech, Typed, Scan, Gesture)**
7. ✅ **Adaptive Learning: Downvoting Idioms triggers suppression rule**
8. ✅ **Safety Net: Fall Trigger & Real Guardian Email Dispatch**
9. ✅ **Fresh Session Guarantee: /api/feedback/reset zeroes ALL tallies**
10. ✅ **Natural Phrasing: Free-typed corrections without keywords clarified**
11. ✅ **Communication ID & Guardian Email Persistence**
12. ✅ **LifeConnect Scenarios: GET /api/social-connect/scenarios**
13. ✅ **LifeConnect Simulation: POST /api/social-connect/interact (Decoder & Coach)**
14. ✅ **Social Wingman: POST /api/social-connect/wingman (Interest Bridging)**
15. ✅ **Peer Hub: GET /api/social-connect/circles (Inclusive Circles)**

---

## 🔬 Scientific & Empirical Grounding

1. **The Double Empathy Problem (Milton, 2012)**:
   Research by Dr. Damian Milton demonstrates that autistic communication breakdowns are not due to an autistic "deficit," but a bi-directional mismatch in communicative styles between different neurotypes. NeuroBridge provides bi-directional translation so neither person is forced to mask.
2. **The Social Cliff & Homeschool / Special-Ed Isolation**:
   Studies from the Interactive Autism Network (IAN) and CDC document that over 30% of autistic students spend formative years homeschooled or in segregated classrooms. Without scaffolded peer re-entry tools like **LifeConnect**, transition into adulthood carries elevated rates of depression and isolation.
3. **Special-Interest Anchoring (Baron-Cohen et al.)**:
   Neurodivergent individuals form deeper, more stable friendships when bonded over shared intense passions (coding, gaming, robotics, science) rather than superficial neurotypical small talk. **Peer Circles** leverages this exact mechanism.
4. **The False-Silence Principle in Assistive Tech**:
   In stim-gesture matching, a false positive puts unintended words in an autistic person's mouth. NeuroBridge enforces an Euclidean threshold: unmatched stims produce dignified silence, never false guesses.

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js v18+ (tested on Node v24), npm v9+

### 1. Install Dependencies
```bash
npm install
npm run postinstall
```

### 2. Configure Environment (`backend/.env`)
```ini
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-flash-latest
```

### 3. Launch Development
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

Open **http://localhost:5173** to experience NeuroBridge. Open **http://localhost:5173/?view=guardian** on a phone for the real-time guardian console!

---

*NeuroBridge was developed with dedication to autistic autonomy, social connectivity, and safety for Hack2Health 2.0.*
