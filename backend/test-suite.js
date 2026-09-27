/**
 * NeuroBridge v3 Automated Self-Test Suite
 * Tests Multimodal Input (Speech, Typed AAC, Scanning, Gesture),
 * Settings Wearer Sovereignty, Adaptive Feedback, Safety Net,
 * Fresh-Session Guarantee, Natural Phrasing, and Communication ID.
 */

async function runTestSuite(baseUrl = 'http://localhost:3001') {
  console.log(`\n======================================================`);
  console.log(`🧪 RUNNING NEUROBRIDGE v3 AUTOMATED SELF-TEST SUITE`);
  console.log(`🎯 Target API Base: ${baseUrl}`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`• ${name}... `);
    try {
      await fn();
      console.log(`✅ PASS`);
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('API Health & Version Check', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    if (data.status !== 'healthy' || data.version !== '3.0.0') {
      throw new Error(`Unexpected health payload: ${JSON.stringify(data)}`);
    }
  });

  // 2. Settings Profile & Scanning Keyboard Toggle
  await test('Settings Panel: Scanning Keyboard & Speed Profile Update', async () => {
    const putRes = await fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scanningKeyboardEnabled: true,
        scanningSpeedMs: 1400
      })
    });
    const putData = await putRes.json();
    if (!putData.success || putData.profile.scanningKeyboardEnabled !== true || putData.profile.scanningSpeedMs !== 1400) {
      throw new Error(`Profile update failed: ${JSON.stringify(putData)}`);
    }

    const getRes = await fetch(`${baseUrl}/api/profile`);
    const getData = await getRes.json();
    if (getData.profile.scanningKeyboardEnabled !== true) {
      throw new Error(`Profile persistence check failed`);
    }
  });

  // 3. Direct Typed AAC Input Turn Analysis
  await test('Phase 1: Direct Typed AAC Input (/api/analyze with inputMethod="typed")', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'Your presentation has several factual errors that change the conclusion.',
        speaker: 'autistic',
        inputMethod: 'typed'
      })
    });
    const data = await res.json();
    if (!data.clarification || data.category !== 'bluntness') {
      throw new Error(`Expected bluntness clarification for typed AAC, got: ${JSON.stringify(data)}`);
    }
  });

  // 4. Switch-Scanning AAC Input Turn Analysis
  await test('Phase 1: Switch-Scanning Keyboard Input (/api/analyze with inputMethod="scanning")', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'I need a break.',
        speaker: 'autistic',
        inputMethod: 'scanning'
      })
    });
    const data = await res.json();
    const text = (data.clarification || '').toLowerCase();
    if (!data.clarification || (!text.includes('break') && !text.includes('decompress') && !text.includes('step away') && !text.includes('sensory') && data.category !== 'bluntness')) {
      throw new Error(`Expected decompress/bluntness clarification for scanning AAC turn, got: ${JSON.stringify(data)}`);
    }
  });

  // 5. Phase 2: Gesture-Matched Turn Flowing Through /api/analyze
  await test('Phase 2: Gesture Match Unified Timeline (/api/analyze with inputMethod="gesture")', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'Need a break',
        speaker: 'autistic',
        inputMethod: 'gesture'
      })
    });
    const data = await res.json();
    if (!data.clarification) {
      throw new Error(`Expected clarification for sovereign gesture turn, got null`);
    }
  });

  // 6. Bridge Insights: Multimodal Input Method Breakdown
  await test('Phase 3: Multimodal Input Breakdown (/api/feedback returns inputMethods tally)', async () => {
    const res = await fetch(`${baseUrl}/api/feedback`);
    const data = await res.json();
    if (!data.success || !data.inputMethods) {
      throw new Error(`Missing inputMethods in feedback payload`);
    }
    const { speech, typed, scanning, gesture } = data.inputMethods;
    if (typeof speech !== 'number' || typeof typed !== 'number' || typeof scanning !== 'number' || typeof gesture !== 'number') {
      throw new Error(`Invalid inputMethod count shape: ${JSON.stringify(data.inputMethods)}`);
    }
    if (typed < 1 || scanning < 1 || gesture < 1) {
      throw new Error(`Expected incremented counts for multimodal turns: ${JSON.stringify(data.inputMethods)}`);
    }
  });

  // 7. Adaptive Feedback Adaptation
  await test('Adaptive Learning: Downvoting Idioms triggers suppression rule', async () => {
    // Submit 3 downvotes for idiom (with honest zero-start data, 3+ unhelpful triggers suppression)
    for (let i = 0; i < 3; i++) {
      await fetch(`${baseUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'idiom', helpful: false })
      });
    }

    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'Break a leg with your demo!',
        speaker: 'neurotypical',
        inputMethod: 'speech'
      })
    });
    const data = await res.json();
    // Since idiom is heavily downvoted, it should be suppressed (clarification === null)
    if (data.clarification !== null) {
      throw new Error(`Expected suppressed idiom clarification, got: ${data.clarification}`);
    }
  });

  // 8. Safety Net Fall Trigger & Guardian Email
  await test('Safety Net: Simulate Fall & Real Guardian Dispatch', async () => {
    const res = await fetch(`${baseUrl}/api/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'fall',
        wearerId: 'wearer_alex_01',
        metrics: { gForce: 2.85, stillnessMs: 4200 },
        location: { lat: 37.7749, lng: -122.4194, label: 'Market St & 4th St, San Francisco' }
      })
    });
    const data = await res.json();
    if (!data.success || !data.alert || data.alert.type !== 'fall') {
      throw new Error(`Alert dispatch failed: ${JSON.stringify(data)}`);
    }
    if (!data.alert.emailDispatch || !data.alert.emailDispatch.previewUrl) {
      throw new Error(`Missing email dispatch or preview link: ${JSON.stringify(data.alert)}`);
    }
  });

  // 9. Fresh-session guarantee: zero seed data
  await test('Fresh Session: /api/feedback/reset zeroes ALL tallies (no fake demo data)', async () => {
    const res = await fetch(`${baseUrl}/api/feedback/reset`, { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error('Reset endpoint failed');
    for (const [cat, counts] of Object.entries(data.tally)) {
      if (counts.helpful !== 0 || counts.unhelpful !== 0) {
        throw new Error(`Category ${cat} not zero after reset: ${JSON.stringify(counts)}`);
      }
    }
    for (const [method, count] of Object.entries(data.inputMethods)) {
      if (count !== 0) throw new Error(`Input method ${method} not zero after reset`);
    }
    // And the takeaway must gracefully describe a fresh session — never fake insights
    if (!data.takeaway.toLowerCase().includes('fresh')) {
      throw new Error(`Takeaway should acknowledge fresh session, got: ${data.takeaway}`);
    }
  });

  // 10. Natural free-typed bluntness (the exact phrasing that failed the old heuristic)
  await test('Natural Phrasing: free-typed correction without keywords still gets clarified', async () => {
    const res = await fetch(`${baseUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: 'Actually that conclusion is wrong, the sample size was too small.',
        speaker: 'autistic',
        inputMethod: 'typed'
      })
    });
    const data = await res.json();
    if (!data.clarification || data.category !== 'bluntness') {
      throw new Error(`Expected bluntness clarification for natural correction, got: ${JSON.stringify(data)}`);
    }
  });

  // 11. Communication ID present on profile & guardian email configurable
  await test('Communication ID & Guardian Email: profile carries emergency card + email', async () => {
    const put = await fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guardianContact: { email: 'mentor.test@example.com' },
        emergencyCard: { primaryChallenge: 'Test card line', whatHelps: 'Test what helps' }
      })
    });
    const putData = await put.json();
    if (!putData.success) throw new Error('Profile PUT failed');
    if (putData.profile.guardianContact.email !== 'mentor.test@example.com') {
      throw new Error(`Guardian email not persisted: ${JSON.stringify(putData.profile.guardianContact)}`);
    }
    if (putData.profile.emergencyCard.primaryChallenge !== 'Test card line') {
      throw new Error(`Emergency card not persisted: ${JSON.stringify(putData.profile.emergencyCard)}`);
    }
    // Restore defaults for demos
    await fetch(`${baseUrl}/api/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guardianContact: { email: 'guardian.sarah@neurobridge.demo' },
        emergencyCard: {
          primaryChallenge: 'I am autistic and sometimes nonverbal under stress.',
          whatHelps: 'Speak slowly and literally. No idioms or sarcasm. Give me time to type a reply.'
        }
      })
    });
  });

  // 12. Social Connect: Everyday Life Re-Entry Scenarios for Homeschooled / Special-School Youth
  await test('LifeConnect Scenarios: GET /api/social-connect/scenarios returns re-entry scenarios', async () => {
    const res = await fetch(`${baseUrl}/api/social-connect/scenarios`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.scenarios) || data.scenarios.length < 5) {
      throw new Error(`Expected at least 5 life scenarios, got: ${JSON.stringify(data)}`);
    }
    const cafeteria = data.scenarios.find(s => s.id === 'cafeteria_lunch');
    if (!cafeteria || !cafeteria.suggestedResponses) {
      throw new Error(`Cafeteria scenario missing response palettes`);
    }
  });

  // 13. Social Connect: Interactive Scenario Turn with Social Decoder & Coach Tip
  await test('LifeConnect Simulation: POST /api/social-connect/interact evaluates turn', async () => {
    const res = await fetch(`${baseUrl}/api/social-connect/interact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioId: 'cafeteria_lunch',
        userTurn: 'Thanks! Yeah, Davis class is great. Mind if I join you guys?'
      })
    });
    const data = await res.json();
    if (!data.success || !data.peerReply || !data.socialDecoder || !data.coachTip) {
      throw new Error(`Incomplete interactive scenario payload: ${JSON.stringify(data)}`);
    }
  });

  // 14. Social Wingman: Live Conversation Copilot & Special-Interest Bridge
  await test('Social Wingman: POST /api/social-connect/wingman generates interest-bridging suggestions', async () => {
    const res = await fetch(`${baseUrl}/api/social-connect/wingman`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lastTurnText: 'We have that massive science project due Friday.',
        speaker: 'neurotypical'
      })
    });
    const data = await res.json();
    if (!data.success || !data.bridgeTip || !Array.isArray(data.quickPrompts) || data.quickPrompts.length === 0) {
      throw new Error(`Invalid wingman response shape: ${JSON.stringify(data)}`);
    }
  });

  // 15. Peer Circles: Inclusive Community Hub for Homeschooled / Special-School Students
  await test('Peer Hub: GET /api/social-connect/circles returns inclusive peer circles', async () => {
    const res = await fetch(`${baseUrl}/api/social-connect/circles`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.circles) || data.circles.length < 3) {
      throw new Error(`Expected peer circles list, got: ${JSON.stringify(data)}`);
    }
  });

  console.log(`\n======================================================`);
  console.log(`🏁 TEST SUITE FINISHED: ${passed} PASSED | ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Execute against CLI arg or localhost
const targetUrl = process.argv[2] || 'http://localhost:3001';
runTestSuite(targetUrl).catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
