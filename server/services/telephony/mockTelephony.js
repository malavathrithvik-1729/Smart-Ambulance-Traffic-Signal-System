/**
 * Team Lifeline V2 - Mock Telephony Provider & Call Simulator
 * Simulates cellular telephone calls, IVR menus, consent handling, and voice intake.
 */

const crypto = require('node:crypto');
const { CallSessionRepo, EmergencyCaseRepo } = require('../../db/repositories');
const RecordingService = require('../audio/recordingService');
const TranscriptionService = require('../ai/transcriptionService');
const EmergencyExtractionService = require('../ai/extractionService');
const OtpService = require('../tracking/otpService');
const SmsService = require('../sms/smsProvider');

const MockTelephonyProvider = {
  /**
   * Run a complete simulated phone call through the entire intake and dispatch pipeline.
   */
  async simulateCall({
    callerContact = '+919876543210',
    callerName = 'Bystander Caller',
    scenarioText = 'Accident near Kamareddy Clock Tower, two people injured, bleeding heavily!',
    consentGranted = true,
    audioBuffer = null,
    ambulanceId = 'AMB-01'
  }) {
    const sessionId = `CALL-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    // 1. Create Call Session
    const callSession = CallSessionRepo.create({
      id: sessionId,
      callerContact,
      callerName,
      consentStatus: consentGranted ? 'granted' : 'refused',
      status: 'in_progress'
    });

    // 2. Audio Recording (Only if consent granted)
    let recording = null;
    if (consentGranted) {
      recording = await RecordingService.saveRecording({
        callSessionId: sessionId,
        audioBuffer,
        durationSeconds: 4,
        consentGranted: true
      });
    }

    // 3. Transcription
    const transcript = await TranscriptionService.transcribe({
      callSessionId: sessionId,
      recordingId: recording ? recording.id : null,
      fallbackText: scenarioText,
      language: 'en'
    });

    // 4. Emergency Information Extraction
    const extracted = EmergencyExtractionService.extract(transcript.raw_text, callerContact);

    // 5. Create Server-Side Emergency Case in SQLite
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
      callerName,
      victimCount: extracted.victimCount,
      reportedCondition: extracted.reportedCondition,
      unconfirmedFields: extracted.unconfirmedFields,
      driverSummary: extracted.driverSummary,
      assignedAmbulanceId: ambulanceId,
      locationSource: 'simulated',
      etaSeconds: 300,
      distanceKm: 2.8,
      metadata: {
        simulated: true,
        consentGranted,
        recordingId: recording ? recording.id : null,
        extractionConfidence: extracted.extractionConfidence
      }
    });

    // Update session to completed
    CallSessionRepo.updateStatus(sessionId, 'completed', `Case ${caseId} created.`);

    // 6. Generate Tracking Invitation and Cryptographic OTP
    const invitationData = OtpService.createInvitation(caseId, 'simulated');

    // 7. Dispatch SMS (Mock or Twilio)
    const smsResult = await SmsService.sendTrackingSms({
      to: callerContact,
      caseId,
      trackingToken: invitationData.token,
      otp: invitationData.rawOtp
    });

    return {
      success: true,
      simulated: true,
      callSession,
      recording,
      transcript,
      extracted,
      emergencyCase,
      invitation: {
        token: invitationData.token,
        expiresAt: invitationData.expiresAt
      },
      sms: smsResult
    };
  }
};

module.exports = MockTelephonyProvider;
