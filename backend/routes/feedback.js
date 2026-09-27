import express from 'express';

const router = express.Router();

// Feedback store per category — starts at ZERO. Every tally is earned live during the session.
export const feedbackTally = {
  sarcasm: { helpful: 0, unhelpful: 0 },
  idiom: { helpful: 0, unhelpful: 0 },
  bluntness: { helpful: 0, unhelpful: 0 },
  ambiguous_question: { helpful: 0, unhelpful: 0 },
  other: { helpful: 0, unhelpful: 0 }
};

// Input method distribution across multimodal turns — starts at ZERO.
export const inputMethodTally = {
  speech: 0,
  typed: 0,
  scanning: 0,
  gesture: 0
};

/**
 * Builds dynamic adaptation context for Gemini / Heuristic engine
 */
export function getAdaptationContextBlock() {
  const notes = [];

  for (const [category, counts] of Object.entries(feedbackTally)) {
    const total = counts.helpful + counts.unhelpful;
    if (total >= 2) {
      const helpfulRate = Math.round((counts.helpful / total) * 100);
      if (helpfulRate < 40) {
        notes.push(`Note: this pair has previously found '${category}' clarifications unhelpful ${counts.unhelpful} out of ${total} times — only flag ${category} if genuinely likely to cause acute confusion, not routine ones.`);
      } else if (helpfulRate > 80) {
        notes.push(`Note: this pair finds '${category}' clarifications especially helpful (${helpfulRate}% approval).`);
      }
    }
  }

  return notes.length > 0 ? notes.join(' ') : 'Note: no prior feedback bias for this session yet.';
}

/**
 * Generates plain-language interpretation takeaway line for Bridge Insights.
 * Handles the fresh-session (all zero) case gracefully — never shows fake insights.
 */
export function getBridgeTakeaway() {
  const totalAll = Object.values(feedbackTally).reduce((sum, c) => sum + c.helpful + c.unhelpful, 0);

  if (totalAll === 0) {
    return "Fresh session — the adaptive model is listening. Rate a few clarifications with 👍 / 👎 and this panel will describe this pair's unique communication style in real time.";
  }

  const idiomTotal = feedbackTally.idiom.helpful + feedbackTally.idiom.unhelpful;
  const bluntTotal = feedbackTally.bluntness.helpful + feedbackTally.bluntness.unhelpful;
  const sarcasmTotal = feedbackTally.sarcasm.helpful + feedbackTally.sarcasm.unhelpful;

  if (feedbackTally.idiom.unhelpful >= 3 && feedbackTally.bluntness.helpful >= 3) {
    return "This pair handles direct phrasing very comfortably, but prefers fewer interruptions for routine idioms.";
  }
  if (sarcasmTotal > 0 && feedbackTally.sarcasm.helpful >= 2) {
    return "Sarcasm clarifications are actively bridging tone misunderstandings; bluntness is rarely an issue between them.";
  }
  if (bluntTotal === 0 && idiomTotal === 0 && sarcasmTotal === 0) {
    return "The pair is still calibrating — no category has enough ratings yet to draw a pattern.";
  }
  return "Adaptive subtext model is active and calibrating in real time based on mutual rating signals.";
}

// GET feedback stats & insights
router.get('/', (req, res) => {
  let totalClarifications = 0;
  let totalHelpful = 0;

  for (const counts of Object.values(feedbackTally)) {
    totalClarifications += counts.helpful + counts.unhelpful;
    totalHelpful += counts.helpful;
  }

  const helpfulRate = totalClarifications > 0
    ? Math.round((totalHelpful / totalClarifications) * 100)
    : 0;

  res.json({
    success: true,
    tally: feedbackTally,
    inputMethods: inputMethodTally,
    totalClarifications,
    totalHelpful,
    helpfulRate,
    takeaway: getBridgeTakeaway(),
    adaptiveContext: getAdaptationContextBlock()
  });
});

// POST feedback for a clarification turn
router.post('/', (req, res) => {
  const { category, helpful } = req.body;
  const cat = (category && feedbackTally[category]) ? category : 'other';

  if (helpful === true) {
    feedbackTally[cat].helpful += 1;
  } else if (helpful === false) {
    feedbackTally[cat].unhelpful += 1;
  }

  console.log(`[FEEDBACK RECORDED] Category: ${cat}, Helpful: ${helpful}`);

  res.json({
    success: true,
    tally: feedbackTally,
    updatedCategory: cat,
    adaptiveContext: getAdaptationContextBlock()
  });
});

// POST /reset — wipe all tallies back to a fresh session (clean slate for demos & new pairs)
router.post('/reset', (req, res) => {
  for (const counts of Object.values(feedbackTally)) {
    counts.helpful = 0;
    counts.unhelpful = 0;
  }
  for (const key of Object.keys(inputMethodTally)) {
    inputMethodTally[key] = 0;
  }
  console.log('[FEEDBACK RESET] All tallies cleared — fresh session.');
  res.json({
    success: true,
    message: 'All feedback and input-method tallies reset to a fresh session.',
    tally: feedbackTally,
    inputMethods: inputMethodTally,
    takeaway: getBridgeTakeaway()
  });
});

export default router;
