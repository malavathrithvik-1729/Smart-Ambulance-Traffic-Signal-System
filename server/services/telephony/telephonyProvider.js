/**
 * Team Lifeline V2 - Telephony Provider Dispatcher & Webhook Handler
 * Supports Twilio Voice Webhooks and modular telephony adapters.
 */

const crypto = require('node:crypto');
const config = require('../../config');
const { CallSessionRepo, EmergencyCaseRepo } = require('../../db/repositories');
const RecordingService = require('../audio/recordingService');
const TranscriptionService = require('../ai/transcriptionService');
const EmergencyExtractionService = require('../ai/extractionService');
const OtpService = require('../tracking/otpService');
const SmsService = require('../sms/smsProvider');
const MockTelephonyProvider = require('./mockTelephony');

class TelephonyService {
  constructor() {
    this.providerName = config.telephony.provider;
  }

  /**
   * Validate incoming Twilio webhook signature if auth token is configured.
   */
  validateTwilioSignature(signature, url, params) {
    if (!config.telephony.authToken) return true; // Skip in dev/unconfigured mode
    if (!signature) return false;

    try {
      // Build data string per Twilio specification
      const keys = Object.keys(params).sort();
      let data = url;
      for (const key of keys) {
        data += key + params[key];
      }
      const expected = crypto.createHmac('sha1', config.telephony.authToken).update(data, 'utf-8').digest('base64');
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  /**
   * Handle initial incoming call webhook.
   * Plays welcome greeting, explains consent, and prompts for DTMF.
   */
  handleIncomingCall({ CallSid, From, To }) {
    const sessionId = CallSid || `CALL-${Date.now()}`;
    const callerContact = From || 'Unknown';

    CallSessionRepo.create({
      id: sessionId,
      callerContact,
      callerName: 'Caller',
      consentStatus: 'pending',
      status: 'incoming'
    });

    const consentActionUrl = `${config.baseUrl}/api/telephony/consent?sessionId=${encodeURIComponent(sessionId)}`;

    // Build standard TwiML XML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Welcome to Team Lifeline Emergency Ambulance Service, Kamareddy.</Say>
  <Gather numDigits="1" action="${consentActionUrl}" method="POST" timeout="10">
    <Say voice="Polly.Aditi">For emergency dispatch safety, this call may be recorded and analysed. Press 1 to consent to recording, or press 2 to proceed without recording.</Say>
  </Gather>
  <Say voice="Polly.Aditi">We did not receive your input. Press 1 to consent or 2 to proceed.</Say>
  <Redirect method="POST">${config.baseUrl}/api/telephony/webhook</Redirect>
</Response>`;

    return { twiml, sessionId };
  }

  /**
   * Handle caller consent response (DTMF 1 or 2).
   */
  handleConsent({ sessionId, Digits }) {
    const session = CallSessionRepo.getById(sessionId);
    if (!session) {
      return {
        twiml: `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Session not found. Please hang up and call again.</Say><Hangup/></Response>`
      };
    }

    const consentGranted = String(Digits).trim() === '1';
    CallSessionRepo.updateConsent(sessionId, consentGranted ? 'granted' : 'refused');

    const intakeActionUrl = `${config.baseUrl}/api/telephony/intake?sessionId=${encodeURIComponent(sessionId)}`;

    if (consentGranted) {
      // Record audio call
      return {
        twiml: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Thank you. Consent recorded. Please state your emergency location, landmarks, and what happened after the tone.</Say>
  <Record action="${intakeActionUrl}" method="POST" maxLength="60" playBeep="true" transcribe="false" />
  <Say voice="Polly.Aditi">We did not receive any audio. Connecting to dispatcher.</Say>
</Response>`
      };
    } else {
      // Non-recorded speech gather
      return {
        twiml: `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Understood. No audio will be recorded. Please clearly state your emergency location and what happened.</Say>
  <Gather input="speech" action="${intakeActionUrl}" method="POST" speechTimeout="auto">
    <Say voice="Polly.Aditi">Listening now.</Say>
  </Gather>
  <Say voice="Polly.Aditi">We did not receive your input. Please stay on the line.</Say>
</Response>`
      };
    }
  }

  /**
   * Handle caller intake speech / recording.
   * Extracts details, creates case, sends tracking SMS with OTP.
   */
  async handleIntake({ sessionId, SpeechResult, RecordingUrl, RecordingDuration }) {
    const session = CallSessionRepo.getById(sessionId);
    const callerContact = session ? session.caller_contact : 'Unknown';
    const consentGranted = session ? session.consent_status === 'granted' : false;

    // 1. Audio recording handling if URL provided
    let recording = null;
    if (RecordingUrl && consentGranted) {
      recording = await RecordingService.saveRecording({
        callSessionId: sessionId,
        durationSeconds: parseFloat(RecordingDuration) || 5,
        consentGranted: true
      });
    }

    // 2. Transcribe speech
    const transcriptText = SpeechResult || 'Emergency incident reported near Kamareddy Clock Tower';
    const transcript = await TranscriptionService.transcribe({
      callSessionId: sessionId,
      recordingId: recording ? recording.id : null,
      fallbackText: transcriptText
    });

    // 3. Extract information
    const extracted = EmergencyExtractionService.extract(transcript.raw_text, callerContact);

    // 4. Create case in SQLite
    const caseId = `EM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const emergencyCase = EmergencyCaseRepo.create({
      id: caseId,
      callSessionId: sessionId,
      transcriptId: transcript.id,
      status: 'reported',
      incidentType: extracted.incidentType,
      incidentDescription: extracted.incidentDescription,
      severity: extracted.severity,
      incidentLocation: extracted.incidentLocation,
      latitude: extracted.latitude,
      longitude: extracted.longitude,
      landmarks: extracted.landmarks,
      callerContact,
      callerName: session ? session.caller_name : 'Caller',
      victimCount: extracted.victimCount,
      reportedCondition: extracted.reportedCondition,
      unconfirmedFields: extracted.unconfirmedFields,
      driverSummary: extracted.driverSummary,
      assignedAmbulanceId: 'AMB-01',
      locationSource: 'simulated',
      etaSeconds: 300,
      distanceKm: 2.8,
      metadata: {
        simulated: config.simulationMode,
        consentGranted,
        recordingUrl: RecordingUrl || null,
        extractionConfidence: extracted.extractionConfidence
      }
    });

    CallSessionRepo.updateStatus(sessionId, 'completed', `Emergency case ${caseId} created.`);

    // 5. Generate OTP and tracking invitation
    const invitationData = OtpService.createInvitation(caseId, config.simulationMode ? 'simulated' : 'pending');

    // 6. Send SMS with tracking link
    await SmsService.sendTrackingSms({
      to: callerContact,
      caseId,
      trackingToken: invitationData.token,
      otp: invitationData.rawOtp
    });

    // 7. Response TwiML
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">Your emergency request has been registered as Case ${caseId}. An ambulance has been alerted. We have sent a live tracking link with OTP to your phone. Stay safe.</Say>
  <Hangup/>
</Response>`;

    return { twiml, emergencyCase, caseId };
  }

  /**
   * Delegate to Mock Simulator for local end-to-end tests
   */
  async simulateCall(params) {
    return await MockTelephonyProvider.simulateCall(params);
  }
}

module.exports = new TelephonyService();
