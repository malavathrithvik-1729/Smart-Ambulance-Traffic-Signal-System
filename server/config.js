/**
 * Team Lifeline V2 - Server Configuration
 * Centralized configuration with environment variable support and safe fallbacks.
 */

const path = require('node:path');
const os = require('node:os');

// Helper to parse boolean env vars
function boolEnv(val, defaultVal = false) {
  if (val === undefined || val === null || val === '') return defaultVal;
  return String(val).toLowerCase() === 'true' || val === '1';
}

// Find local IPv4 address for multi-device testing over Wi-Fi
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip loopback and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIpAddress();
const port = parseInt(process.env.PORT, 10) || 3000;
const host = process.env.HOST || '0.0.0.0';
const baseUrl = process.env.BASE_URL || `http://${localIp}:${port}`;

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port,
  host,
  localIp,
  baseUrl,
  isDev: (process.env.NODE_ENV || 'development') !== 'production',

  // Database & Storage Paths
  databasePath: process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'lifeline.sqlite'),
  recordingsDir: process.env.RECORDINGS_DIR || path.join(__dirname, '..', 'storage', 'recordings'),

  // Operational & Safety Flags
  simulationMode: boolEnv(process.env.SIMULATION_MODE, true),
  requireRecordingConsent: boolEnv(process.env.REQUIRE_RECORDING_CONSENT, true),
  recordingRetentionHours: parseInt(process.env.RECORDING_RETENTION_HOURS, 10) || 72,

  // OTP & Tracking Security
  sessionSecret: process.env.SESSION_SECRET || 'lifeline-emergency-dispatch-insecure-dev-secret-change-in-prod',
  otpExpirySeconds: parseInt(process.env.OTP_EXPIRY_SECONDS, 10) || 300, // 5 minutes
  otpMaxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 5,
  otpResendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 60,
  trackingSessionTtlSeconds: parseInt(process.env.TRACKING_SESSION_TTL_SECONDS, 10) || 3600, // 1 hour

  // Telephony Configuration
  telephony: {
    provider: process.env.TELEPHONY_PROVIDER || 'mock', // 'mock' or 'twilio'
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+911234567890',
    webhookUrl: process.env.TWILIO_WEBHOOK_URL || `${baseUrl}/api/telephony/webhook`,
  },

  // SMS Configuration
  sms: {
    provider: process.env.SMS_PROVIDER || 'mock', // 'mock' or 'twilio'
    senderId: process.env.SMS_SENDER_ID || 'LIFELINE',
  },

  // AI & Speech Configuration
  ai: {
    sttProvider: process.env.STT_PROVIDER || 'local_rules', // 'local_rules' or 'mock'
    extractionProvider: process.env.AI_EXTRACTION_PROVIDER || 'rule_based',
  }
};
