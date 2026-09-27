# NeuroBridge: LifeConnect & SocialOrbit 🧠🪐🛡️
> **Assistive Communication, Social Re-Entry & Safety Ecosystem for Autistic Youth & Young Adults.**  
> *Hack2Health 2.0 Healthcare Innovation Hackathon Submission*  
>  
> 🌐 **Try it Live (Production)**: [https://hack2health.vercel.app](https://hack2health.vercel.app)

---

## 🎯 Primary Problem & Focused User Persona

### Primary Focused Persona: Autistic Youth & Young Adults in Social Transition
NeuroBridge is focused specifically on **verbal and semi-verbal autistic adolescents and young adults (ages 14–24)** navigating the transition from homeschooling or segregated special education environments into mainstream social settings (high school cafeterias, university study groups, workplace meetings, and community clubs).

### The Challenge: "The Social Cliff" & The Double Empathy Gap
1. **Educational Isolation & Segregation**: According to NCES Digest Table 204.60 and U.S. Dept. of Education IDEA Section 618 data, **over 40% of autistic students spend the majority or entirety of their school day in segregated classrooms (<40% regular class time) or separate special education schools**. When transitioning into mainstream post-secondary environments, they encounter the "Social Cliff"—abrupt loss of structured aides and severe anxiety around unwritten social expectations.
2. **Double-Empathy Miscommunication**: Grounded in Dr. Damian Milton's *Double Empathy Problem (2012)*, miscommunication between autistic and neurotypical individuals is a two-way mismatch in communicative norms, not a one-way autistic deficit. In casual peer interactions, autistic directness is often misread as rudeness, while neurotypical sarcasm and idioms are taken literally.
3. **Situational Mutism & Emergency Vulnerability**: During moments of acute sensory overwhelm, severe anxiety, or shutdown, many autistic adolescents and young adults experience situational mutism—a temporary inability to produce spoken words despite wanting to communicate. Transitioning youth face heightened physical and communicative vulnerability if disorientation or an emergency occurs while they are unable to verbally call for help.

---

## 💡 The Solution: 4 Pillars of Focused Everyday Support

### 1. 🪐 LifeConnect: The Social Re-Entry Flight Simulator
An interactive scenario simulator designed for youth preparing to step into mainstream peer environments:
- **Scenarios**: Campus Cafeteria, Group Project Collaboration, Special-Interest Clubs, Friendly Banter vs. Teasing, Cafe Ordering, and Tactful Sensory Exits.
- **Social Decoder Ring**: Identifies implicit body language, posture, and tone markers.
- **Empowerment Coach**: Affirming, strengths-based explanations for conversational pacing.
- **Multi-Tier Response Palettes**: Three dignity-preserving response pathways per turn (*Casual & Warm*, *Direct & Honest*, *Low-Energy AAC*), plus free speech/typing.
- **Live Social Battery Gauge**: Real-time visualization of cognitive energy drain and recovery.

### 2. 🤝 Inclusive Peer Circles & Passion-Anchored Connection
- Connects transitioning students around authentic shared interests rather than forced small talk:
  - 🤖 **Robotics & Creative Coding** (Python, Arduino, Raspberry Pi)
  - 🎨 **Digital Art & Worldbuilding** (Procreate, Sci-Fi Lore)
  - 🎮 **Minecraft & Indie Game Crafters** (Low-stimulation servers)
  - 🔭 **Astronomy & Astrophysics** (James Webb discoveries)
- **Parallel Play & Body Doubling**: Low-stimulation virtual study rooms—text-first, camera optional, zero forced socialization.

### 3. 🧠 Multimodal Conversation Bridge with Live Social Wingman
- **Unified Conversation Timeline**: Spoken audio (Web Speech API), Typed AAC, Switch-Scanning Keyboard, and Calibrated Stims/Gestures flow into **one shared conversation stream**.
- **Bidirectional Subtext Clarification**: Driven by Milton's Double Empathy framework:
  - *Autistic &rarr; Neurotypical*: Explains factual directness, sensory limits, and task-switching bottlenecks to peer partners.
  - *Neurotypical &rarr; Autistic*: Deciphers idioms, sarcasm, and ambiguous workplace phrasing for the wearer.
  - Transparent engine badging: **LIVE AI** (Google Gemini) or **OFFLINE ENGINE** (on-device heuristic fallback).
- **Live Social Wingman**: Visual turn-taking balance flowmeter, interest-bridging prompts, and a one-tap **Tactful Exit Card** (*"I've reached my sensory limit, heading out to recharge. Had great fun, talk soon!"*).

### 4. 🛡️ Sovereign Safety Net with Emergency Dispatch
- **Wearer Sovereignty**: The wearer controls all sensor permissions—no background surveillance or continuous tracking.
- **Crisis Trigger**: High-G impact detection (>2.6G) with post-impact stillness, acute distress trigger, and manual SOS.
- **Guardian Dispatch**: Real-time updates via Server-Sent Events (SSE) and transactional HTML email dispatch (Resend API) containing Google Maps coordinates and the wearer's personalized **Communication ID card** (guiding first responders on how to de-escalate without trauma).

---

## 🔍 Competitive Landscape Comparison

| System | Primary Paradigm | Modality | Intent Translation | Mechanism Differentiator |
|---|---|---|---|---|
| **The Social Express** | Scripted animated curriculum | Video lessons | ❌ None (prescriptive social rules) | Teaches normative neurotypical masking; no live in-conversation support. |
| **Floreo** | Immersive VR roleplay | VR headset + iPad | ❌ None (adult co-pilot required) | Controlled drills for clinics; requires dedicated VR hardware and adult supervision. |
| **Goblin.tools (The Judge)** | Asynchronous AI text tool | Static web text | ⚠️ One-way (user-initiated text analysis) | Standalone tone analysis; not integrated into live two-way spoken conversation. |
| **Proloquo2Go ($249.99)** | Grid-based AAC communication | iPad touch grid | ❌ None (symbol speech generator) | Specialized AAC voice output; lacks bidirectional subtext bridging or peer scaffolding. |
| **NeuroBridge (Hack2Health 2.0)** | **Live Multimodal Conversation & Re-Entry** | **Web (Speech, AAC, Switch, Stims)** | ✅ **Bidirectional (Both speakers, live)** | **Unified multimodal timeline + bidirectional double-empathy clarification + sovereign emergency net.** |

---

## 🏗️ Architecture

```
/hack2health
  /frontend                      -> React 19 + Vite + Tailwind CSS
    /src
      /components
        SocialOrbit.jsx          -> LifeConnect: Social re-entry simulator, decoder, coach
        PeerCircles.jsx          -> Inclusive peer circles & shared passion buddy hub
        ConversationBridge.jsx   -> Unified timeline + Live Social Wingman & Turn Flowmeter
        GestureTranslation.jsx   -> MediaPipe HandLandmarker with rolling 12-frame kinematic buffer
        BridgeInsights.jsx       -> Zero-start analytics & input-channel breakdown
        HowItWorks.jsx           -> Double Empathy science & transition literature
        SafetyDashboard.jsx      -> Wearer biometric meters, manual SOS, fall simulation
        GuardianDashboard.jsx    -> Guardian console: live SSE, GPS, email dispatch
        SettingsPanel.jsx        -> Sovereignty toggles, school context, special interests
      /hooks
        useSpeechRecognition.js  -> Web Speech API with interim results
        useMotionSensor.js       -> DeviceMotion API with fall/distress simulators
      App.jsx                    -> Top navigation, turn router, ?view=guardian
  /backend                       -> Node.js + Express (ES Modules)
    /routes
      socialConnect.js           -> /api/social-connect: scenarios, interact, wingman, circles
      analyze.js                 -> /api/analyze: Google Gemini LLM / adaptive heuristic fallback
      feedback.js                -> /api/feedback: zero-start tallies, adaptive context
      gestures.js                -> /api/gestures: 63-coordinate hand landmark vectors
      alert.js                   -> /api/alert + SSE /events + Resend/Nodemailer email dispatch
      profile.js                 -> /api/profile: whitelist-merged settings + emergency card
    server.js                    -> Express server on port 3001, JSON 404s, 32 KB limit
  backend/test-suite.js          -> 18 automated end-to-end tests (17 passed, 1 adversarial failure)
```

---

## 🧪 Automated Test Suite & Real Adversarial Results

Run the automated test suite:
```bash
node backend/test-suite.js                           # Against local server
node backend/test-suite.js https://hack2health.vercel.app  # Against production
```

### Actual Test Run Results (17 Passed | 1 Failed):
1. ✅ **API Health & Version Check** (Healthy, v3.0.0)
2. ✅ **Settings Panel**: Switch-scanning keyboard & speed profile persistence
3. ✅ **Direct Typed AAC Input**: `/api/analyze` with `inputMethod="typed"`
4. ✅ **Switch-Scanning AAC Input**: `/api/analyze` with `inputMethod="scanning"`
5. ✅ **Gesture Match Unified Timeline**: `/api/analyze` with `inputMethod="gesture"`
6. ✅ **Multimodal Input Breakdown**: Verified real-time telemetry tally
7. ✅ **Adaptive Learning**: Idiom downvoting triggers dynamic suppression rule
8. ✅ **Safety Net**: Fall impact trigger & emergency email dispatch payload
9. ✅ **Fresh Session Guarantee**: `/api/feedback/reset` zeroes all counts
10. ✅ **Natural Phrasing**: Free-typed correction without keywords clarified
11. ✅ **Communication ID & Guardian Email Persistence**
12. ✅ **LifeConnect Scenarios**: Scenario bank retrieval
13. ✅ **LifeConnect Simulation**: Multi-turn decoder and coach evaluation
14. ✅ **Social Wingman**: Real-time special-interest bridging suggestions
15. ✅ **Peer Hub**: Interest-anchored peer circle retrieval
16. ✅ **Adversarial Test A (Speech Disfluency)**: `"Um... like... I... I am really, really mad right now, please just... stop."` &rarr; Correctly extracts boundary despite stutter.
17. ✅ **Adversarial Test B (Paraphrased Sarcasm)**: `"Oh great, another unexpected delay to ruin our afternoon."` &rarr; Correctly identifies multi-clause sarcasm.
18. ❌ **Adversarial Test C (Typo / Noisy AAC)**: `"neeeed a brek to loud now"` &rarr; **FAILED (clarification: null)**.  
    *Significance*: Demonstrates the real-world limitation of offline regex heuristics when lexical noise bypasses dictionary roots, proving why a production deployment relies on an active LLM or phonetic spell-checker.

---

## ⚠️ Acknowledged Technical Limitations

1. **Browser Foreground Constraint for Motion Sensors**:
   The current prototype runs as a client web application using the `DeviceMotion` API. While fully functional when the browser tab is open, modern mobile operating systems (iOS Safari and Android Chrome) throttle JavaScript execution and sensor polling when the phone is locked or backgrounded. A field-ready production version requires an OS-native background service (e.g. Android Foreground Service or iOS CoreMotion daemon).
2. **Kinematic Buffer vs. Learned Temporal Sequence Model**:
   The gesture translation pipeline uses MediaPipe 3D joint landmarks combined with a rolling 12-frame (~800ms) kinematic buffer to measure velocity and trajectory oscillations (separating active vibration stims from static resting poses). While this filters out false positives, it is a kinematic thresholding heuristic, **not a learned sequential temporal model** (such as DTW, Hidden Markov Models, or an LSTM), and cannot parse multi-stage continuous sign sequences.
3. **Clinical Validation**:
   This is a 48-hour functional prototype designed to demonstrate feasibility and architectural viability. It has not undergone formal clinical trials or Speech-Language Pathologist (SLP) validation. Future work centers on co-design partnerships with neurodivergent self-advocacy groups and licensed SLPs.

---

## 🚀 Quickstart Guide

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

# Optional: Real Email Delivery via Resend (defaults to local Ethereal preview if unset)
RESEND_API_KEY=re_your_resend_key_here
RESEND_FROM=NeuroBridge Alert <onboarding@resend.dev>
GUARDIAN_EMAIL=your_guardian_email@example.com
```

### 3. Launch Development
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

Open **http://localhost:5173** for the main app. Open **http://localhost:5173/?view=guardian** on a mobile device or second monitor for the real-time guardian console.
