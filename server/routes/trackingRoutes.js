/**
 * Team Lifeline V2 - Victim Tracking Routes
 * Invitation resolution, cryptographic OTP verification, and authorized tracking session queries.
 */

const express = require('express');
const router = express.Router();
const OtpService = require('../services/tracking/otpService');
const { TrackingInvitationRepo, EmergencyCaseRepo } = require('../db/repositories');

// 1. Resolve tracking invitation details (public preliminary check)
router.get('/invite/:token', (req, res) => {
  const { token } = req.params;
  const invitation = TrackingInvitationRepo.getByToken(token);

  if (!invitation) {
    return res.status(404).json({ success: false, error: 'Tracking invitation not found or link has expired' });
  }

  const emCase = EmergencyCaseRepo.getById(invitation.case_id);
  const now = Date.now();
  const isExpired = now > invitation.otp_expires_at;

  return res.json({
    success: true,
    invitation: {
      caseId: invitation.case_id,
      status: invitation.status,
      isExpired,
      attemptsRemaining: Math.max(0, invitation.otp_max_attempts - invitation.otp_attempts),
      createdAt: invitation.created_at,
      expiresAt: invitation.otp_expires_at
    },
    // Return sanitized case overview (no private caller contacts or audio)
    caseOverview: emCase ? {
      caseId: emCase.id,
      incidentLocation: emCase.incident_location,
      status: emCase.status,
      assignedAmbulanceId: emCase.assigned_ambulance_id
    } : null
  });
});

// 2. Verify OTP submitted by victim phone
router.post('/verify-otp', (req, res) => {
  const { token, otp } = req.body || {};

  if (!token || !otp) {
    return res.status(400).json({ success: false, error: 'Both invitation token and 6-digit OTP are required' });
  }

  const verification = OtpService.verifyOtp(token, otp);

  if (!verification.success) {
    return res.status(401).json({
      success: false,
      error: verification.error,
      code: verification.code,
      remainingAttempts: verification.remainingAttempts
    });
  }

  // Retrieve full case data for authorized victim session
  const emCase = EmergencyCaseRepo.getById(verification.caseId);

  return res.json({
    success: true,
    message: 'OTP verified successfully. Tracking session activated.',
    sessionToken: verification.sessionToken,
    expiresAt: verification.expiresAt,
    case: emCase
  });
});

// 3. Retrieve live case telemetry with active tracking session
router.get('/live/:sessionToken', (req, res) => {
  const { sessionToken } = req.params;
  const session = OtpService.validateSessionToken(sessionToken);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized or expired tracking session' });
  }

  const emCase = EmergencyCaseRepo.getById(session.case_id);
  if (!emCase) {
    return res.status(404).json({ success: false, error: 'Associated emergency case not found' });
  }

  return res.json({
    success: true,
    case: emCase,
    session: {
      expiresAt: session.expires_at
    }
  });
});

module.exports = router;
