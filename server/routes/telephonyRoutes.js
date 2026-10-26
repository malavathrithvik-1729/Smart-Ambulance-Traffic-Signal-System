/**
 * Team Lifeline V2 - Telephony Routes
 * Handles incoming call webhooks, DTMF consent, speech intake, and simulation calls.
 */

const express = require('express');
const router = express.Router();
const TelephonyService = require('../services/telephony/telephonyProvider');
const { CallSessionRepo } = require('../db/repositories');
const { broadcastEmergencyCreated } = require('../socket/socketHandler');

// 1. Initial Incoming Call Webhook (Twilio / External Provider)
router.post('/webhook', (req, res) => {
  const { CallSid, From, To } = req.body || {};
  const { twiml, sessionId } = TelephonyService.handleIncomingCall({ CallSid, From, To });

  res.type('text/xml');
  return res.send(twiml);
});

// 2. Caller Consent DTMF Response (Twilio action)
router.post('/consent', (req, res) => {
  const { sessionId } = req.query;
  const { Digits } = req.body || {};

  const { twiml } = TelephonyService.handleConsent({ sessionId, Digits });
  res.type('text/xml');
  return res.send(twiml);
});

// 3. Caller Intake Speech / Recording Webhook (Twilio action)
router.post('/intake', async (req, res) => {
  try {
    const { sessionId } = req.query;
    const { SpeechResult, RecordingUrl, RecordingDuration } = req.body || {};

    const { twiml, emergencyCase } = await TelephonyService.handleIntake({
      sessionId,
      SpeechResult,
      RecordingUrl,
      RecordingDuration
    });

    if (emergencyCase) {
      broadcastEmergencyCreated(emergencyCase);
    }

    res.type('text/xml');
    return res.send(twiml);
  } catch (err) {
    console.error('[TELEPHONY INTAKE ERROR]', err);
    res.type('text/xml');
    return res.status(500).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>An internal error occurred. Please hold for an operator.</Say></Response>`);
  }
});

// 4. Complete Call Simulation Endpoint (for demonstration & automated tests)
router.post('/simulate', async (req, res) => {
  try {
    const {
      callerContact,
      callerName,
      scenarioText,
      consentGranted = true,
      ambulanceId
    } = req.body || {};

    const result = await TelephonyService.simulateCall({
      callerContact: callerContact || '+919876543210',
      callerName: callerName || 'Bystander Caller',
      scenarioText: scenarioText || 'Car accident on NH44 highway near Kamareddy Clock Tower, two people injured, bleeding heavily!',
      consentGranted: consentGranted !== false,
      ambulanceId: ambulanceId || 'AMB-01'
    });

    // Notify connected ambulance laptops in real-time
    if (result.emergencyCase) {
      broadcastEmergencyCreated(result.emergencyCase);
    }

    return res.json(result);
  } catch (err) {
    console.error('[SIMULATE CALL ERROR]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Query Call Session Status
router.get('/sessions/:id', (req, res) => {
  const session = CallSessionRepo.getById(req.params.id);
  if (!session) {
    return res.status(404).json({ success: false, error: 'Call session not found' });
  }
  return res.json({ success: true, session });
});

module.exports = router;
