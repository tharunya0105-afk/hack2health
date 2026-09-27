import express from 'express';
import { getAdaptationContextBlock, feedbackTally, inputMethodTally } from './feedback.js';

const router = express.Router();

// Lazy Gemini config — env vars are read at REQUEST time, not module load.
// (dotenv.config() runs in server.js AFTER ESM imports are evaluated, so any
// module-load-time read of process.env silently misses .env values.)
function getGeminiKey() {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

/**
 * Shared LLM prompt construction for Google Gemini
 */
function buildBridgePrompts(speakerType, cleanTranscript, adaptiveContext) {
  const systemPrompt = `You are a communication bridge helping two people understand each other better — one autistic, one neurotypical. You will be given a short transcript snippet and told who said it. Your job is to decide if the OTHER person might misread the intent, and if so, provide ONE short (under 20 words), warm, non-judgmental clarification for them, and classify it into one category: sarcasm | idiom | bluntness | ambiguous_question | other.

${adaptiveContext}

Do not flag routine, clear statements. Only flag genuine risk of misunderstanding.
IMPORTANT:
- When the AUTISTIC speaker explicitly expresses anger, frustration, or upset (e.g. "I am angry", "I am frustrated"), DO NOT dismiss or pathologize it as merely "sensory overload" or "needing a sensory break". Accurately convey to the other person that the speaker is genuinely angry or frustrated and stating their emotion or boundary directly.
- When the AUTISTIC speaker sends a short blunt functional request (e.g. "I NEED A BREAK", "I need to leave now", "Stop talking, it is too loud"), explain the self-regulation or sensory intent so it is not misread as rudeness or rejection.
If nothing needs flagging, respond with exactly: NONE.
If a clarification is needed, respond with valid JSON in this exact structure:
{"clarification": "Your short clarification sentence here", "category": "category_name"}`;

  const userMessage = `Speaker: ${speakerType}\nSaid: "${cleanTranscript}"`;
  return { systemPrompt, userMessage };
}

/**
 * Shared LLM response interpretation: NONE | JSON | raw sentence
 */
function interpretLlmResponse(rawText, engineName, model) {
  const text = (rawText || '').trim();
  if (text.toUpperCase() === 'NONE' || text === '' || text.includes('NONE.')) {
    return { clarification: null, category: null, engine: engineName, model };
  }
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return { clarification: parsed.clarification, category: parsed.category || 'other', engine: engineName, model };
    }
  } catch (_) {}
  return { clarification: text.replace(/^"|"$/g, ''), category: 'other', engine: engineName, model };
}

/**
 * Intelligent heuristic fallback with adaptive category weighting
 */
function getIntelligentFallback(transcript, speakerType) {
  const text = transcript.trim().toLowerCase();

  // Check if idioms have been heavily downvoted in this session
  const idiomTotal = feedbackTally.idiom.helpful + feedbackTally.idiom.unhelpful;
  const idiomSuppressed = idiomTotal >= 3 && (feedbackTally.idiom.helpful / idiomTotal) < 0.35;

  // 1. Autistic speaker phrasing -> Neurotypical listener might misinterpret
  if (speakerType === 'autistic') {
    if (text.includes('angry') || text.includes('mad') || text.includes('furious') || text.includes('frustrated') || text.includes('pissed') || text.includes('annoyed')) {
      return {
        clarification: "They are directly expressing that they are angry and communicating genuine frustration, not just sensory overwhelm.",
        category: "bluntness"
      };
    }
    if (text.includes('stop talking') || text.includes('too loud') || text.includes('quiet')) {
      return {
        clarification: "They may be experiencing sensory overload, not trying to be dismissive.",
        category: "bluntness"
      };
    }
    if (text.includes('need a break') || text.includes('break') || text.includes('leave now') || text.includes('going home') || text.includes('bye')) {
      return {
        clarification: "They need a moment to decompress and self-regulate, not a personal rejection.",
        category: "bluntness"
      };
    }
    if (text.includes('overstimulated') || text.includes('overwhelm')) {
      return {
        clarification: "Sensory overload detected. Wearer is signaling a need for a lower stimulus environment.",
        category: "bluntness"
      };
    }
    if (text.includes('excited') || text.includes('engaged') || text.includes('happy')) {
      return {
        clarification: "Physical stim expressing deep joy and active engagement in the conversation.",
        category: "other"
      };
    }
    if (text.includes('factual error') || text.includes('incorrect') || text.includes('you are wrong') || text.includes("you're wrong") || text.includes('is wrong') || text.includes('that is wrong') || text.includes("that's wrong") || text.includes('not correct') || text.includes('not true') || text.includes('mistake in') || text.includes('error in') || text.includes('wrong about')) {
      return {
        clarification: "Direct factual correction is meant helpfully, without personal criticism.",
        category: "bluntness"
      };
    }
    if (text.includes('sample size') || text.includes('the data shows') || text.includes('your math') || text.includes('recalculate') || text.includes('this number is off') || text.includes('recheck')) {
      return {
        clarification: "They are focused on data accuracy, not criticizing you — accuracy matters to how they show care.",
        category: "bluntness"
      };
    }
    if (text.includes('too much') && (text.includes('talking') || text.includes('information') || text.includes('detail'))) {
      return {
        clarification: "They are describing their processing capacity, not rejecting your ideas.",
        category: "bluntness"
      };
    }
    if (text.includes('why are you looking') || text.includes('eye contact')) {
      return {
        clarification: "Direct eye contact can feel uncomfortable; lack of eye contact doesn't mean disinterest.",
        category: "bluntness"
      };
    }
    if (text.includes('that doesn\'t make sense') || text.includes('illogical')) {
      return {
        clarification: "They are seeking clarity on the logic, not attacking your viewpoint.",
        category: "bluntness"
      };
    }
    if (text.includes('be specific') || text.includes('what exact') || text.includes('give me steps')) {
      return {
        clarification: "They are requesting concrete, step-by-step instructions to execute accurately.",
        category: "bluntness"
      };
    }
    if (text.includes('can\'t do this') || text.includes('switch tasks') || text.includes('too many things')) {
      return {
        clarification: "Executive function bottleneck during task switching; they need to finish one task before starting another.",
        category: "bluntness"
      };
    }
    if (text.includes('don\'t touch') || text.includes('too close') || text.includes('step back')) {
      return {
        clarification: "Physical boundary requested due to tactile sensitivity, not personal hostility.",
        category: "bluntness"
      };
    }
    if (text.includes('happy') || text.includes('joy') || text.includes('excited') || text.includes('thrilled')) {
      return {
        clarification: "Expressing genuine happiness, active engagement, and positive emotion in the conversation.",
        category: "other"
      };
    }
  }

  // 2. Neurotypical speaker phrasing -> Autistic listener might take literally
  if (speakerType === 'neurotypical') {
    // If idioms are suppressed due to negative feedback, skip routine idioms
    if (!idiomSuppressed) {
      if (text.includes('break a leg')) {
        return {
          clarification: "This is an idiom meaning 'good luck' — not literal harm.",
          category: "idiom"
        };
      }
      if (text.includes('spill the beans')) {
        return {
          clarification: "This idiom means 'tell the secret or news', not physical beans.",
          category: "idiom"
        };
      }
      if (text.includes('raining cats and dogs')) {
        return {
          clarification: "A figure of speech meaning it is raining heavily.",
          category: "idiom"
        };
      }
      if (text.includes('bite the bullet') || text.includes('piece of cake')) {
        return {
          clarification: "An idiom meaning an easy task or facing a difficult situation directly.",
          category: "idiom"
        };
      }
      if (text.includes('up in the air')) {
        return {
          clarification: "An idiom meaning undecided or uncertain, not physically in the air.",
          category: "idiom"
        };
      }
    } else {
      console.log('[ADAPTATION ACTIVE] Idiom clarification suppressed due to session feedback tally.');
    }

    if (text.includes('oh great') || text.includes('fantastic') || text.includes('just wonderful')) {
      if (text.includes('another') || text.includes('delay') || text.includes('problem') || text.includes('traffic') || text.includes('meeting')) {
        return {
          clarification: "This is sarcasm expressing frustration, not genuine excitement.",
          category: "sarcasm"
        };
      }
    }

    if (text.includes('take a chill pill') || text.includes('calm down')) {
      return {
        clarification: "They are asking to pause the tension, but know it might feel invalidating.",
        category: "ambiguous_question"
      };
    }

    if (text.includes('read between the lines')) {
      return {
        clarification: "They are implying unspoken subtext rather than literal words.",
        category: "idiom"
      };
    }

    if (text.includes('we need to talk') || text.includes('have a minute') || text.includes('got a second')) {
      return {
        clarification: "They want to discuss a specific work item or catch up — does not automatically mean you are in trouble.",
        category: "ambiguous_question"
      };
    }

    if (text.includes('it\'s fine') || text.includes('never mind') || text.includes('forget it')) {
      return {
        clarification: "This often indicates emotional fatigue or a desire to pause discussion, rather than literal agreement.",
        category: "sarcasm"
      };
    }

    if (text.includes('touch base') || text.includes('circle back')) {
      return {
        clarification: "Business idiom meaning 'follow up or talk again soon', not physical touching.",
        category: "idiom"
      };
    }

    if (text.includes('whenever you get a chance') || text.includes('no rush')) {
      return {
        clarification: "Polite workplace phrasing that usually means prioritize within 1-2 business days, not an indefinite timeline.",
        category: "ambiguous_question"
      };
    }

    if (text.includes('take this offline')) {
      return {
        clarification: "Workplace phrase meaning discuss this privately 1-on-1 after the meeting, not disconnecting from the internet.",
        category: "idiom"
      };
    }
  }

  if (text.startsWith('yeah right') || text.includes('as if') || text.includes('sure, totally')) {
    return {
      clarification: "This phrase likely indicates disagreement or irony, not literal agreement.",
      category: "sarcasm"
    };
  }

  return { clarification: null, category: null };
}

/**
 * POST /api/analyze
 */
router.post('/', async (req, res) => {
  const { transcript, speaker, inputMethod } = req.body;

  if (typeof transcript !== 'string' || !transcript.trim()) {
    return res.status(400).json({ error: 'Transcript text is required' });
  }

  const speakerType = speaker === 'neurotypical' ? 'neurotypical' : 'autistic';
  // Length cap: utterances are single conversation turns, not documents. Keeps LLM
  // costs bounded and prevents oversized-payload abuse.
  const cleanTranscript = transcript.trim().slice(0, 2000);
  const adaptiveContext = getAdaptationContextBlock();

  // Record input method tally
  const method = ['speech', 'typed', 'scanning', 'gesture'].includes(inputMethod) ? inputMethod : 'speech';
  if (inputMethodTally[method] !== undefined) {
    inputMethodTally[method] += 1;
  }

  console.log(`[ANALYZE REQUEST] Speaker: ${speakerType} | Method: ${method} | "${cleanTranscript}"`);
  console.log(`[SESSION CONTEXT] ${adaptiveContext}`);

  // 1. Google Gemini LLM invocation if key available
  if (getGeminiKey()) {
    try {
      const { systemPrompt, userMessage } = buildBridgePrompts(speakerType, cleanTranscript, adaptiveContext);
      const modelToUse = getGeminiModel();

      const requestBody = JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        // maxOutputTokens 1024 + thinkingBudget 0: Gemini 2.5+ models burn
        // hidden reasoning tokens first — without this the JSON reply gets
        // truncated (finishReason: MAX_TOKENS) mid-sentence.
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      // One retry for transient free-tier errors (503 overload / 429 rate limit)
      // so a live demo never silently drops to the heuristic engine mid-sentence.
      let googleRes = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        googleRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelToUse)}:generateContent?key=${encodeURIComponent(getGeminiKey())}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(15000),
            body: requestBody
          }
        );
        if (googleRes.ok || ![500, 429, 503].includes(googleRes.status)) break;
        if (attempt === 0) await new Promise(r => setTimeout(r, 900));
      }

      if (!googleRes || !googleRes.ok) {
        throw new Error(`Gemini API responded ${googleRes ? googleRes.status : 'no-response'}`);
      }

      const googleData = await googleRes.json();
      const rawText = (googleData.candidates?.[0]?.content?.parts || [])
        .map(p => p.text || '')
        .join('')
        .trim();
      console.log(`[LLM RAW RESPONSE:${modelToUse}]:`, rawText);
      return res.json(interpretLlmResponse(rawText, 'gemini-llm', modelToUse));
    } catch (geminiError) {
      console.warn('[Gemini API Error - Falling back to adaptive heuristic engine]:', geminiError.message);
    }
  }

  // 2. Intelligent Adaptive Heuristic Engine
  const { clarification, category } = getIntelligentFallback(cleanTranscript, speakerType);
  return res.json({
    clarification,
    category,
    engine: getGeminiKey() ? 'fallback-after-error' : 'adaptive-heuristic-engine',
    adaptiveContextApplied: Boolean(adaptiveContext)
  });
});

export default router;
