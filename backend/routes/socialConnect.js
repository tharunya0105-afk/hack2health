import express from 'express';
import { getUserProfile } from './profile.js';

const router = express.Router();

function getGeminiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || 'gemini-flash-latest';
}

// Clinically crafted real-world scenarios for homeschooled & special-school autistic youth
const SCENARIOS = [
  {
    id: "cafeteria_lunch",
    title: "School / Campus Cafeteria",
    category: "Peer Re-Entry",
    difficulty: "Medium",
    sensoryLevel: "High Noise",
    icon: "🥪",
    description: "Approaching a lunch table where peers are chatting, asking to sit down, and joining casual conversation.",
    backgroundContext: "You enter the cafeteria during lunch break. A table with 3 classmates (Sam, Maya, Jordan) has an empty chair. They are laughing about a new game update.",
    peerName: "Sam (Classmate)",
    initialPrompt: "Hey! You're in Mr. Davis's computer science class, right? There's an open chair here if you want to sit with us!",
    intentDecoder: "Sam is making a friendly, open invitation. A smile and head nod indicate welcoming posture.",
    suggestedResponses: [
      {
        type: "warm_casual",
        label: "Casual & Warm",
        text: "Thanks! Yeah, Davis's class is great. Mind if I join you guys?"
      },
      {
        type: "direct_honest",
        label: "Direct & Clear",
        text: "Yes, I am Alex from that class. I'd like to sit here, thanks for inviting me."
      },
      {
        type: "aac_quick",
        label: "Low-Energy / AAC",
        text: "Thank you! I would like to sit with you."
      }
    ]
  },
  {
    id: "group_project",
    title: "Group Project Collaboration",
    category: "Academic & Teamwork",
    difficulty: "Medium",
    sensoryLevel: "Moderate",
    icon: "🤝",
    description: "Dividing tasks fairly, clarifying ambiguous instructions from classmates, and offering factual input without sounding blunt.",
    backgroundContext: "You're paired with 2 students for a science presentation due Friday. One student suggests an unrealistic schedule.",
    peerName: "Maya (Group Partner)",
    initialPrompt: "I was thinking maybe we can just wing the slides tomorrow morning before class? It should be super chill, right?",
    intentDecoder: "Maya is looking for low effort, but is worried about doing too much work. She might not realize that last-minute prep causes high anxiety.",
    suggestedResponses: [
      {
        type: "constructive_balance",
        label: "Constructive Solution",
        text: "I do much better when slides are planned ahead. How about I build the slide template tonight so we only have 10 minutes of review tomorrow?"
      },
      {
        type: "direct_honest",
        label: "Direct Boundary",
        text: "Winging it causes me anxiety. I need us to divide the slides today so I can prepare my part."
      },
      {
        type: "aac_quick",
        label: "Low-Energy / AAC",
        text: "I prefer finishing today. I can do the research slides."
      }
    ]
  },
  {
    id: "special_interest_club",
    title: "Joining a Special-Interest Club",
    category: "Community & Passion",
    difficulty: "Easy",
    sensoryLevel: "Low Noise",
    icon: "🎮",
    description: "Introducing yourself at a gaming/robotics/science club, sharing your passion without overwhelming, and asking about others.",
    backgroundContext: "You attend the first meeting of the campus Robotics & Tech Club. Students are showcasing their small micro-controller projects.",
    peerName: "Leo (Club Officer)",
    initialPrompt: "Welcome to the club! We're doing casual demos today. Have you worked with micro-controllers or robotics before, or just curious?",
    intentDecoder: "Leo is actively assessing your background in an encouraging way to help you find the right sub-group.",
    suggestedResponses: [
      {
        type: "warm_casual",
        label: "Share & Connect",
        text: "I love building Raspberry Pi sensor kits at home! I've been homeschooled so I'm excited to collaborate on team builds."
      },
      {
        type: "direct_honest",
        label: "Direct & Clear",
        text: "Yes, I code Python and build robot kinematics. I want to work with other people who share this interest."
      },
      {
        type: "aac_quick",
        label: "Low-Energy / AAC",
        text: "I build sensor projects with Python. Excited to learn and team up."
      }
    ]
  },
  {
    id: "banter_vs_teasing",
    title: "Casual Banter vs Teasing",
    category: "Social Decryption",
    difficulty: "High",
    sensoryLevel: "Moderate",
    icon: "💬",
    description: "Deciphering friendly playful banter among peers vs disrespectful teasing, with safe, dignified response pathways.",
    backgroundContext: "A classmate notices you brought a notebook covered in detailed mechanical schematics.",
    peerName: "Jordan (Classmate)",
    initialPrompt: "Whoa Alex, did NASA drop their top-secret blueprint on your desk or are you secretly building a rocket?",
    intentDecoder: "Jordan is using playful hyperbole / friendly teasing to show curiosity about your drawing. The tone is amused and intrigued, not insulting.",
    suggestedResponses: [
      {
        type: "warm_casual",
        label: "Playful Reply",
        text: "Haha, don't tell anyone, but the launch is scheduled for Tuesday! It's actually a dual-axis robotic arm design."
      },
      {
        type: "direct_honest",
        label: "Direct Explanation",
        text: "It is a robotic arm schematic I designed. I find technical drawing relaxing. Would you like to see how the gears mesh?"
      },
      {
        type: "aac_quick",
        label: "Low-Energy / AAC",
        text: "It's my robotic arm design. Thank you for noticing!"
      }
    ]
  },
  {
    id: "ordering_cafe",
    title: "Ordering at a Busy Public Cafe",
    category: "Independence & Daily Life",
    difficulty: "Medium",
    sensoryLevel: "High Stimulus",
    icon: "☕",
    description: "Navigating rapid verbal ordering in a noisy cafe, handling sensory stimuli, and feeling confident ordering food independently.",
    backgroundContext: "You are at a local cafe counter. The espresso machine is hissing and music is playing. The barista looks at you.",
    peerName: "Barista (Server)",
    initialPrompt: "Next in line! What can I get started for you today?",
    intentDecoder: "The barista is working quickly because of the line behind you, but is ready to take your exact order.",
    suggestedResponses: [
      {
        type: "warm_casual",
        label: "Polite & Clear",
        text: "Hi! Can I please get a medium hot chocolate with oat milk and no whip? Thank you."
      },
      {
        type: "direct_honest",
        label: "Straight to the Point",
        text: "Medium hot chocolate, oat milk, to go please."
      },
      {
        type: "aac_quick",
        label: "Low-Energy / AAC",
        text: "Medium hot chocolate, oat milk please. [Show screen]"
      }
    ]
  },
  {
    id: "graceful_exit",
    title: "The Graceful Recharge Exit",
    category: "Sensory & Self-Advocacy",
    difficulty: "Easy",
    sensoryLevel: "High Stimulus",
    icon: "🚪",
    description: "Excusing yourself smoothly when sensory battery runs low without feeling guilty or leaving peers confused.",
    backgroundContext: "You've been at a peer hangout for 45 minutes. The room has gotten louder and your social battery is at 15%.",
    peerName: "Chloe (Friend)",
    initialPrompt: "Alex, we're thinking of all going across the street to the arcade now! You're coming with us, right?",
    intentDecoder: "Chloe wants to include you because she likes having you around, but an arcade will cause sensory overload right now.",
    suggestedResponses: [
      {
        type: "warm_casual",
        label: "Warm Graceful Exit",
        text: "I had so much fun with you all! I've reached my sensory limit for today though, so I'm going to head home to recharge. Let's do this again soon!"
      },
      {
        type: "direct_honest",
        label: "Honest Boundary",
        text: "Arcades are too loud for me right now and I need quiet to recharge. Thanks for asking, see you in class tomorrow!"
      },
      {
        type: "aac_quick",
        label: "Low-Energy / AAC",
        text: "I need a quiet break now. Had fun today, see you next time!"
      }
    ]
  }
];

// Inclusive Peer Circles for community connectivity
const PEER_CIRCLES = [
  {
    id: "circle_robotics",
    name: "Robotics & Creative Coding",
    icon: "🤖",
    membersCount: 42,
    meetingType: "Sensory-friendly hybrid (Text & Voice optional)",
    frequency: "Tuesdays & Saturdays",
    focus: "Python, Arduino, Game Dev, Raspberry Pi",
    description: "A neuro-affirming space where homeschooled and mainstream students collaborate on code, share Github repos, and build projects without social pressure.",
    activeBuddies: [
      { name: "Julian M.", role: "Peer Mentor (Neurodivergent)", interest: "Kinematics & Blender", status: "Online" },
      { name: "Priya S.", role: "Classmate", interest: "Robotics & Sensors", status: "Online" }
    ],
    starterTopic: "What is your favorite sensor to build with, and what did you make with it?"
  },
  {
    id: "circle_digital_art",
    name: "Digital Art & Worldbuilding",
    icon: "🎨",
    membersCount: 38,
    meetingType: "Quiet Co-Working / Asynchronous Discord & Canvas",
    frequency: "Thursdays & Sundays",
    focus: "Procreate, Anime/Manga, Sci-Fi Lore, Concept Art",
    description: "Draw together in parallel play (body doubling) with lofi music. Zero requirement to speak out loud — text chat and canvas sharing welcome.",
    activeBuddies: [
      { name: "Rowan K.", role: "Artist & Peer Ally", interest: "Character Design & Pixel Art", status: "Online" },
      { name: "Samira T.", role: "Student", interest: "Comic illustration", status: "Away" }
    ],
    starterTopic: "Share your current canvas or favorite character color palette!"
  },
  {
    id: "circle_gaming",
    name: "Minecraft & Indie Game Crafters",
    icon: "🎮",
    membersCount: 65,
    meetingType: "Structured Server / Low-Stimulation Rules",
    frequency: "Daily Drop-In",
    focus: "Survival servers, Redstone engineering, Undertale, Hollow Knight",
    description: "Strict anti-griefing, anti-bullying environment with designated quiet build zones and structured collaborative build nights.",
    activeBuddies: [
      { name: "Evan B.", role: "Community Lead", interest: "Automated Redstone farms", status: "Online" },
      { name: "Maya R.", role: "Peer Buddy", interest: "Architecture builds", status: "Online" }
    ],
    starterTopic: "Do you prefer building mechanical redstone contraptions or cozy survival homes?"
  },
  {
    id: "circle_science",
    name: "Astronomy & Deep Science",
    icon: "🔭",
    membersCount: 29,
    meetingType: "Casual Discussion & Documentary Watch Parties",
    frequency: "Friday Evenings",
    focus: "Astrophysics, James Webb discoveries, Paleo-biology",
    description: "Deep dive conversations where info-dumping on your favorite scientific phenomena is enthusiastically celebrated, not shushed.",
    activeBuddies: [
      { name: "Dr. Elena (Volunteer)", role: "Inclusive Educator", interest: "Exoplanets", status: "Online" },
      { name: "Kai N.", role: "High School Junior", interest: "Black hole thermodynamics", status: "Online" }
    ],
    starterTopic: "What recent James Webb telescope image blew your mind the most?"
  }
];

// GET all scenarios
router.get('/scenarios', (req, res) => {
  res.json({
    success: true,
    scenarios: SCENARIOS,
    mission: "Equipping homeschooled and segregated autistic students with confident social re-entry skills and everyday connectivity."
  });
});

// GET all peer circles
router.get('/circles', (req, res) => {
  res.json({
    success: true,
    circles: PEER_CIRCLES
  });
});

// POST interact in a scenario
router.post('/interact', async (req, res) => {
  const { scenarioId, userTurn, conversationHistory = [] } = req.body;

  const scenario = SCENARIOS.find(s => s.id === scenarioId) || SCENARIOS[0];
  const userText = (userTurn || '').trim();

  if (!userText) {
    return res.status(400).json({ error: "userTurn text is required" });
  }

  // 1. Google Gemini dynamic interaction if configured
  if (getGeminiKey()) {
    try {
      const systemPrompt = `You are playing the role of ${scenario.peerName} in a realistic, inclusive social simulation designed to help an autistic individual (Alex, who was homeschooled or in a special school) practice peer connectivity in: "${scenario.title}".
Scenario background: ${scenario.backgroundContext}.
Conversation history:
${conversationHistory.map(h => `${h.speaker}: ${h.text}`).join('\n')}

The user (Alex) just said: "${userText}"

You must respond in JSON with this exact schema:
{
  "peerReply": "What ${scenario.peerName} says next (warm, authentic, realistic teen/college peer phrasing, 1-2 sentences)",
  "socialDecoder": "Explain what emotional cue or body language ${scenario.peerName} is showing (e.g. smile, interest, relieved)",
  "coachTip": "One encouraging, validating tip on how the user's reply was effective and what to build on",
  "suggestedReplies": [
    { "type": "warm_casual", "label": "Casual & Warm", "text": "A friendly follow-up response" },
    { "type": "direct_honest", "label": "Direct & Honest", "text": "A direct, authentic response" },
    { "type": "aac_quick", "label": "Low-Energy / AAC", "text": "A short, functional AAC response" }
  ],
  "batteryCost": 5
}
Respond with only valid JSON.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(getGeminiModel())}:generateContent?key=${encodeURIComponent(getGeminiKey())}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(12000),
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 800 }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            success: true,
            engine: 'gemini-llm',
            ...parsed
          });
        }
      }
    } catch (err) {
      console.warn('[Social Connect Gemini Error - Falling back to heuristic generator]:', err.message);
    }
  }

  // 2. Intelligent clinical heuristic conversational responder
  const lower = userText.toLowerCase();
  let peerReply = "That's awesome! We were just talking about that. Seriously glad you jumped in with us.";
  let socialDecoder = "Warm eye contact and nodding in affirmation. They are genuinely glad you spoke up.";
  let coachTip = "Terrific initiative! Stepping into the conversation was clear, natural, and showed authentic presence.";

  if (lower.includes('break') || lower.includes('home') || lower.includes('quiet') || lower.includes('overload') || lower.includes('head out')) {
    peerReply = "Totally get it! Thanks so much for coming over and chatting. Let's definitely catch up again soon, take care!";
    socialDecoder = "Understanding expression and relaxed posture. Zero offense taken; they respect your personal boundary.";
    coachTip = "Masterful self-advocacy! Communicating your recharge needs politely builds lasting trust with peers.";
  } else if (lower.includes('raspberry') || lower.includes('code') || lower.includes('robot') || lower.includes('science') || lower.includes('python')) {
    peerReply = "No way, you build with that?! You have to show us your project next week. We've been trying to get our sensor calibration working!";
    socialDecoder = "Leaning forward with enthusiastic facial expression and wide eyes. High shared interest detected.";
    coachTip = "Spot-on! Connecting over a shared passion is the #1 scientifically proven way for neurodivergent youth to forge strong friendships.";
  } else if (lower.includes('slides') || lower.includes('template') || lower.includes('prepare') || lower.includes('tomorrow')) {
    peerReply = "That actually helps a ton! If you set up the template, I'll fill in the bibliography and review slides tonight so we're set.";
    socialDecoder = "Relieved smile and thumbs up. They appreciate clear division of labor that relieves their stress.";
    coachTip = "Great collaboration skill. Offering a specific, manageable contribution made the whole team feel secure.";
  }

  return res.json({
    success: true,
    engine: 'heuristic-interactive',
    peerReply,
    socialDecoder,
    coachTip,
    suggestedReplies: [
      {
        type: "warm_casual",
        label: "Keep Conversation Flowing",
        text: "Sounds great! Do you usually work on this after classes or on weekends?"
      },
      {
        type: "direct_honest",
        label: "Share Detail",
        text: "I have the Github repository link, I can send it to you if you'd like to check it out."
      },
      {
        type: "aac_quick",
        label: "Low-Energy Affirmation",
        text: "Yes, let's do that! Thank you."
      }
    ],
    batteryCost: 6
  });
});

// POST /api/social-connect/wingman
// Generates live suggestions for the conversation bridge
router.post('/wingman', (req, res) => {
  const { lastTurnText, speaker, specialInterests = ["Robotics", "Gaming", "Astronomy"] } = req.body;
  const text = (lastTurnText || '').toLowerCase();

  const userProfile = getUserProfile();
  const interests = (userProfile.specialInterests && userProfile.specialInterests.length > 0)
    ? userProfile.specialInterests
    : specialInterests;

  const topInterest = interests[0] || "Robotics";

  // Build bridging suggestion connecting whatever peer said to the user's passion
  let bridgeTip = `Find common ground by relating their point to your interest in ${topInterest}.`;
  let quickPrompts = [
    { label: "Ask follow-up", text: "What inspired you to get into that?" },
    { label: "Empathy / Validate", text: "That sounds like a lot to handle, but you did great." },
    { label: "Tactful Pause", text: "I need 5 minutes of quiet to recharge, but I'm enjoying this!" }
  ];

  if (text.includes('class') || text.includes('project') || text.includes('study') || text.includes('test')) {
    bridgeTip = `They are discussing school work. You can mention how you use ${topInterest} principles or study habits to stay organized.`;
    quickPrompts = [
      { label: "Share Study Habit", text: "I like breaking study sessions into 20-minute focused blocks. How do you usually study?" },
      { label: "Relate to Interest", text: `Solving that reminds me of debugging logic in ${topInterest}!` },
      { label: "Offer Help", text: "If you need a second pair of eyes on the data, I'm happy to help review it." }
    ];
  } else if (text.includes('weekend') || text.includes('fun') || text.includes('game') || text.includes('play')) {
    bridgeTip = `They are talking about leisure time. Perfect time to ask about their favorite games or share a quick snippet about ${topInterest}.`;
    quickPrompts = [
      { label: "Ask Game / Hobby", text: "What games or hobbies do you enjoy the most during free time?" },
      { label: "Share Passion", text: `I spent my weekend testing a new build in ${topInterest}!` },
      { label: "Low-Key Connect", text: "Sounds like a fun weekend! Hope you got some good rest too." }
    ];
  }

  res.json({
    success: true,
    turnTakingSuggestion: speaker === 'autistic' 
      ? "You just spoke! Try asking an open-ended question to let them share their perspective."
      : "They just finished speaking. You can validate their idea or connect it to your perspective.",
    bridgeTip,
    quickPrompts
  });
});

export default router;
