import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import analyzeRouter from './routes/analyze.js';
import alertRouter, { handleSseConnection } from './routes/alert.js';
import profileRouter from './routes/profile.js';
import gesturesRouter from './routes/gestures.js';
import feedbackRouter from './routes/feedback.js';
import socialConnectRouter from './routes/socialConnect.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '32kb' }));

// Request logger
app.use((req, res, next) => {
  if (req.path !== '/events' && req.path !== '/api/health') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// SSE endpoint for live Guardian Dashboard telemetry & alerts
app.get('/events', handleSseConnection);
app.get('/api/alerts/stream', handleSseConnection);

// Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/alert', alertRouter);
app.use('/api/alerts', alertRouter);
app.use('/api/profile', profileRouter);
app.use('/api/gestures', gesturesRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/social-connect', socialConnectRouter);
app.use('/api/scenarios', socialConnectRouter);
app.use('/api/wingman', (req, res, next) => {
  req.url = '/wingman';
  socialConnectRouter(req, res, next);
});
app.use('/api/circles', (req, res, next) => {
  req.url = '/circles';
  socialConnectRouter(req, res, next);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  res.json({
    status: 'healthy',
    app: 'NeuroBridge API v3 Multimodal',
    version: '3.0.0',
    geminiConfigured: hasGemini,
    llmConfigured: hasGemini,
    provider: hasGemini ? 'google-gemini' : 'offline-heuristic',
    model: hasGemini
      ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash')
      : 'adaptive-heuristic-engine',
    timestamp: new Date().toISOString()
  });
});

// Unknown API routes → clean JSON 404 (never fall through to static/HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Unknown API route', path: req.path });
});

// Serve frontend build if present
import fs from 'fs';
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/events') return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 NeuroBridge v3 Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Health Check:  http://localhost:${PORT}/api/health`);
    console.log(`🔔 Alert Stream:  http://localhost:${PORT}/events`);
    console.log(`🖐️ Gestures API:  http://localhost:${PORT}/api/gestures`);
    console.log(`📊 Feedback API:  http://localhost:${PORT}/api/feedback`);
    const llmStatus = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
      ? `Google Gemini ${process.env.GEMINI_MODEL || 'gemini-2.5-flash'}`
      : 'Not configured - using adaptive heuristic fallback';
    console.log(`🧠 LLM Provider:  ${llmStatus}`);
    console.log('====================================================');
  });
}

export default app;
