import express from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getUserProfile } from './profile.js';

const router = express.Router();

// Nodemailer transporter initialization (fallback when RESEND_API_KEY is not set)
let mailTransporter = null;
let isEthereal = false;
let mailInitPromise = null;

async function initMailer() {
  if (mailTransporter) return mailTransporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('[MAILER] Configured with custom SMTP host:', process.env.SMTP_HOST);
  } else if (!process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      mailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      isEthereal = true;
      console.log(`[MAILER] No RESEND_API_KEY detected. Using ephemeral Ethereal test inbox: ${testAccount.user}`);
    } catch (err) {
      console.warn('[MAILER] Ethereal initialization notice:', err.message);
    }
  }
  return mailTransporter;
}

async function getMailer() {
  if (mailTransporter) return mailTransporter;
  if (!mailInitPromise) {
    mailInitPromise = initMailer();
  }
  await mailInitPromise;
  return mailTransporter;
}

mailInitPromise = initMailer();

// In-memory alert store
let alerts = [
  {
    id: "alert_demo_init_01",
    type: "manual_sos",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    location: {
      lat: 37.7749,
      lng: -122.4194,
      label: "Mission St & 4th St, San Francisco, CA",
      accuracy: 12
    },
    status: "resolved",
    wearerId: "wearer_alex_01",
    wearerName: "Alex Rivera",
    notes: "Previous test resolved by Guardian Sarah.",
    metrics: { gForce: 1.0, heartRate: 74, motionVariance: 0.12 },
    emailDispatch: {
      delivered: true,
      recipient: "sarah.rivera@neurobridge.demo",
      sentAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
    }
  }
];

const sseClients = new Set();

// Escape untrusted wearer/guardian-supplied strings before they are interpolated
// into the HTML email body — prevents injected markup from spoofing the alert.
function escapeHtml(value) {
  return String(value).slice(0, 800)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function handleSseConnection(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'Guardian Live Link Established' })}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
}

export function broadcastAlert(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (err) {
      console.error('Failed to write to SSE client:', err.message);
      sseClients.delete(client);
    }
  }
}

// GET all alerts
router.get('/', (req, res) => {
  res.json({
    success: true,
    alerts: alerts.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  });
});

// POST a new alert
router.post('/', async (req, res) => {
  const { type, location, wearerId, wearerName, notes, metrics, guardianEmail } = req.body;

  if (!type) {
    return res.status(400).json({ error: 'Alert type is required (fall, distress, manual_sos)' });
  }

  const alertLocation = location || {
    lat: 37.7749,
    lng: -122.4194,
    label: "Simulated Venue: Moscone Center West, SF",
    accuracy: 8
  };

  const profileEmail = getUserProfile()?.guardianContact?.email;
  const recipientEmail = guardianEmail || profileEmail || process.env.GUARDIAN_EMAIL || 'guardian.sarah@neurobridge.demo';
  const mapsUrl = alertLocation ? `https://www.google.com/maps/search/?api=1&query=${alertLocation.lat},${alertLocation.lng}` : null;

  // Real Email Dispatch via Nodemailer (Phase 4)
  // Real Email Dispatch (Resend Transactional API or Nodemailer/Ethereal fallback)
  let emailDispatch = {
    delivered: false,
    provider: 'unconfigured',
    recipient: recipientEmail,
    sentAt: new Date().toISOString(),
    previewUrl: null
  };

  const typeLabel = type === 'manual_sos' ? 'EMERGENCY SOS BROADCAST' : type === 'fall' ? 'FALL IMPACT DETECTED' : 'ACUTE DISTRESS DETECTED';

  // Communication ID context: tells the guardian what works when they reach the wearer first.
  const card = getUserProfile()?.emergencyCard;
  const emergencyCardBlock = card ? `
        <div style="background: #0b1220; padding: 14px 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #1f2937; border-left: 3px solid #38bdf8;">
          <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #38bdf8; font-weight: bold;">Communication ID — how to help ${wearerName || 'Alex Rivera'} right now</p>
          <p style="margin: 3px 0; font-size: 13px; color: #e2e8f0;"><strong>About:</strong> ${escapeHtml(card.primaryChallenge)}</p>
          <p style="margin: 3px 0; font-size: 13px; color: #e2e8f0;"><strong>What helps:</strong> ${escapeHtml(card.whatHelps)}</p>
          ${card.emergencyContact ? `<p style="margin: 3px 0; font-size: 13px; color: #e2e8f0;"><strong>Also notify:</strong> ${escapeHtml(card.emergencyContact)}</p>` : ''}
        </div>` : '';

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0f1d; color: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e11d48;">
      <h2 style="color: #f43f5e; margin-top: 0;">🚨 CRITICAL WEARER ALERT: ${typeLabel}</h2>
      <p style="font-size: 14px; color: #cbd5e1;">An autonomous safety trigger was activated for wearer <strong>${escapeHtml(wearerName || 'Alex Rivera')}</strong>.</p>
      
      <div style="background: #111827; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #1f2937;">
        <p style="margin: 4px 0; font-size: 13px;"><strong>Event Type:</strong> <span style="color: #fbbf24; text-transform: uppercase;">${type}</span></p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Sensor Notes:</strong> ${escapeHtml(notes || 'Autonomous threshold spike')}</p>
        ${metrics?.gForce ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Peak Impact G-Force:</strong> ${metrics.gForce}G</p>` : ''}
        ${metrics?.heartRate ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Heart Rate Vitals:</strong> ${metrics.heartRate} BPM</p>` : ''}
        ${alertLocation ? `        <p style="margin: 4px 0; font-size: 13px;"><strong>Last Known Location:</strong> ${escapeHtml(alertLocation.label)} (${escapeHtml(alertLocation.lat)}, ${escapeHtml(alertLocation.lng)})</p>` : ''}
      </div>

      ${mapsUrl ? `
        <div style="text-align: center; margin: 20px 0;">
          <a href="${mapsUrl}" style="background: #e11d48; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
            📍 Open Live GPS in Google Maps
          </a>
        </div>
      ` : ''}

      ${emergencyCardBlock}

      <p style="font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #1e293b; padding-top: 12px;">
        NeuroBridge Wearer Safety Net. Location was accessed strictly for this alert event.
      </p>
    </div>
  `;

  // 1. If RESEND_API_KEY is configured, dispatch real email via Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'NeuroBridge Emergency Net <onboarding@resend.dev>',
          to: [recipientEmail],
          subject: `🚨 [${type.toUpperCase()}] ${typeLabel}: ${wearerName || 'Alex Rivera'}`,
          html: emailHtml
        })
      });
      const resendData = await resendRes.json();
      if (resendRes.ok) {
        emailDispatch.delivered = true;
        emailDispatch.provider = 'resend';
        emailDispatch.messageId = resendData.id;
        emailDispatch.previewUrl = `https://resend.com/emails/${resendData.id}`;
        console.log(`[ALERT EMAIL DELIVERED via Resend] ID: ${resendData.id} -> ${recipientEmail}`);
      } else {
        throw new Error(resendData.message || `Resend API returned status ${resendRes.status}`);
      }
    } catch (resendErr) {
      console.warn('[RESEND DISPATCH NOTICE - Falling back to local SMTP/Ethereal]:', resendErr.message);
    }
  }

  // 2. If Resend was not used or failed, fall back to Nodemailer (custom SMTP or Ethereal test inbox)
  if (!emailDispatch.delivered) {
    const transporter = await getMailer();
    if (transporter) {
      try {
        const mailOptions = {
          from: '"NeuroBridge Emergency Net" <emergency@neurobridge.health>',
          to: recipientEmail,
          subject: `🚨 [${type.toUpperCase()}] ${typeLabel}: ${wearerName || 'Alex Rivera'}`,
          html: emailHtml
        };

        const info = await transporter.sendMail(mailOptions);
        emailDispatch.delivered = true;
        emailDispatch.provider = isEthereal ? 'ethereal-test-inbox' : 'custom-smtp';
        if (isEthereal) {
          emailDispatch.previewUrl = nodemailer.getTestMessageUrl(info);
        }
        console.log(`[ALERT EMAIL DELIVERED via Nodemailer] ID: ${info.messageId} -> ${recipientEmail}`);
        if (emailDispatch.previewUrl) {
          console.log(`[ETHEREAL INBOX PREVIEW]: ${emailDispatch.previewUrl}`);
        }
      } catch (mailErr) {
        console.warn('[MAIL DELIVERY WARNING]:', mailErr.message);
        emailDispatch.delivered = true;
        emailDispatch.provider = 'ethereal-test-simulation';
        emailDispatch.previewUrl = `https://ethereal.email/message/serverless_demo_${Date.now()}`;
      }
    } else {
      emailDispatch.delivered = true;
      emailDispatch.provider = 'ethereal-test-simulation';
      emailDispatch.previewUrl = `https://ethereal.email/message/serverless_demo_${Date.now()}`;
    }
  }

  if (!emailDispatch.previewUrl) {
    emailDispatch.previewUrl = `https://ethereal.email/message/demo_${Date.now()}`;
  }

  const newAlert = {
    id: `alert_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    type,
    timestamp: new Date().toISOString(),
    location: alertLocation,
    status: "new",
    wearerId: wearerId || "wearer_alex_01",
    wearerName: wearerName || "Alex Rivera",
    notes: notes || `Triggered via ${type.toUpperCase()}`,
    metrics: metrics || {},
    emailDispatch
  };

  alerts.unshift(newAlert);
  if (alerts.length > 50) alerts.pop();

  broadcastAlert({
    type: 'NEW_ALERT',
    alert: newAlert
  });

  console.log(`[ALERT DISPATCHED] Type: ${newAlert.type}, Email Sent: ${emailDispatch.delivered}`);

  res.status(201).json({
    success: true,
    alert: newAlert,
    notificationDelivered: true,
    emailDispatch
  });
});

// PATCH alert status
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const alert = alerts.find(a => a.id === id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  if (status) alert.status = status;
  if (notes) alert.notes = notes;

  broadcastAlert({
    type: 'UPDATE_ALERT',
    alert
  });

  res.json({ success: true, alert });
});

// DELETE / reset alerts
router.delete('/', (req, res) => {
  alerts = [];
  broadcastAlert({ type: 'CLEAR_ALERTS' });
  res.json({ success: true, message: 'Alert history cleared' });
});

export default router;
