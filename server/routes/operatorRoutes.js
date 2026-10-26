/**
 * Team Lifeline V2 - Operator & Exhibition Console Routes
 * Diagnostic endpoints, local Wi-Fi IP discovery, and SMS simulation inbox inspector.
 */

const express = require('express');
const router = express.Router();
const config = require('../config');
const SmsService = require('../services/sms/smsProvider');
const { EmergencyCaseRepo, CallSessionRepo, RecordingRepo } = require('../db/repositories');
const { getDatabase } = require('../db/database');

// 1. Operator System Status
router.get('/status', (req, res) => {
  const db = getDatabase();
  const caseCountStmt = db.prepare('SELECT COUNT(*) as count FROM emergency_cases');
  const sessionCountStmt = db.prepare('SELECT COUNT(*) as count FROM call_sessions');
  const recordingCountStmt = db.prepare('SELECT COUNT(*) as count FROM recordings WHERE deleted_at IS NULL');

  return res.json({
    success: true,
    system: 'Team Lifeline V2 Emergency Dispatch Engine',
    organization: 'SPR High School, Kamareddy',
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    network: {
      port: config.port,
      host: config.host,
      localIp: config.localIp,
      baseUrl: config.baseUrl,
      laptopUrl: `http://localhost:${config.port}/ambulance.html`,
      phoneUrl: `http://${config.localIp}:${config.port}/victim.html`,
      operatorUrl: `http://localhost:${config.port}/operator.html`
    },
    modes: {
      simulationMode: config.simulationMode,
      telephonyProvider: config.telephony.provider,
      smsProvider: config.sms.provider,
      requireRecordingConsent: config.requireRecordingConsent
    },
    counts: {
      cases: caseCountStmt.get()?.count || 0,
      callSessions: sessionCountStmt.get()?.count || 0,
      recordings: recordingCountStmt.get()?.count || 0
    }
  });
});

// 2. Simulated SMS Messages Inbox (so test operators can see the sent OTP instantly)
router.get('/sms-inbox', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  const messages = SmsService.getRecentSimulatedMessages(limit);
  return res.json({
    success: true,
    count: messages.length,
    messages
  });
});

// 3. Clear Demo Database
router.post('/clear-db', (req, res) => {
  const db = getDatabase();
  db.exec(`
    DELETE FROM tracking_sessions;
    DELETE FROM tracking_invitations;
    DELETE FROM emergency_cases;
    DELETE FROM transcripts;
    DELETE FROM recordings;
    DELETE FROM call_sessions;
  `);
  return res.json({ success: true, message: 'All demo cases and sessions cleared.' });
});

module.exports = router;
