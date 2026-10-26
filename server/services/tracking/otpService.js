/**
 * Team Lifeline V2 - OTP & Tracking Security Service
 * Cryptographically secure OTP generation, salt-hashing, and session token issuance.
 */

const crypto = require('node:crypto');
const config = require('../../config');
const { TrackingInvitationRepo, TrackingSessionRepo } = require('../../db/repositories');

function generateOtp() {
  // 6-digit cryptographically secure integer between 100000 and 999999
  return crypto.randomInt(100000, 1000000).toString();
}

function generateToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString('hex');
}

function hashOtp(otp, salt) {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
}

function timingSafeMatch(a, b) {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const OtpService = {
  /**
   * Create a tracking invitation for an emergency case.
   * Returns invitation record and the raw plaintext OTP (to be sent via SMS).
   */
  createInvitation(caseId, smsStatus = 'simulated', smsMessage = '') {
    const rawOtp = generateOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(rawOtp, salt);
    const token = generateToken(24);
    const id = `INV-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const otpExpiresAt = Date.now() + (config.otpExpirySeconds * 1000);

    const invitation = TrackingInvitationRepo.create({
      id,
      caseId,
      token,
      otpHash,
      otpSalt: salt,
      otpExpiresAt,
      smsStatus,
      smsMessage
    });

    return {
      invitation,
      token,
      rawOtp, // Plaintext OTP only returned to SMS service, never sent to public web API
      expiresAt: otpExpiresAt
    };
  },

  /**
   * Verify an entered OTP against a tracking token.
   */
  verifyOtp(token, enteredOtp) {
    if (!token || !enteredOtp) {
      return { success: false, error: 'Token and OTP are required', code: 'INVALID_INPUT' };
    }

    const cleanOtp = String(enteredOtp).trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      return { success: false, error: 'OTP must be exactly 6 digits', code: 'MALFORMED_OTP' };
    }

    const invitation = TrackingInvitationRepo.getByToken(token);
    if (!invitation) {
      return { success: false, error: 'Tracking invitation not found', code: 'INVITATION_NOT_FOUND' };
    }

    if (invitation.status === 'revoked') {
      return { success: false, error: 'This tracking invitation has been revoked', code: 'INVITATION_REVOKED' };
    }

    if (invitation.status === 'verified') {
      return { success: false, error: 'This OTP has already been used and is no longer valid', code: 'OTP_ALREADY_USED' };
    }

    const now = Date.now();
    if (now > invitation.otp_expires_at) {
      return { success: false, error: 'OTP has expired. Please request a new link.', code: 'OTP_EXPIRED' };
    }

    if (invitation.otp_attempts >= invitation.otp_max_attempts) {
      return { success: false, error: 'Maximum verification attempts exceeded. Access locked.', code: 'MAX_ATTEMPTS_EXCEEDED' };
    }

    // Check OTP hash
    const computedHash = hashOtp(cleanOtp, invitation.otp_salt);
    const isValid = timingSafeMatch(computedHash, invitation.otp_hash);

    if (!isValid) {
      TrackingInvitationRepo.incrementAttempts(invitation.id);
      const remaining = invitation.otp_max_attempts - (invitation.otp_attempts + 1);
      return {
        success: false,
        error: `Invalid OTP code. ${remaining > 0 ? remaining + ' attempt(s) remaining.' : 'Account locked.'}`,
        code: 'INVALID_OTP',
        remainingAttempts: Math.max(0, remaining)
      };
    }

    // Mark verified
    TrackingInvitationRepo.markVerified(invitation.id);

    // Create tracking session
    const sessionId = `SES-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const sessionToken = generateToken(32);
    const sessionExpiresAt = now + (config.trackingSessionTtlSeconds * 1000);

    const session = TrackingSessionRepo.create({
      id: sessionId,
      invitationId: invitation.id,
      caseId: invitation.case_id,
      sessionToken,
      expiresAt: sessionExpiresAt
    });

    return {
      success: true,
      caseId: invitation.case_id,
      sessionToken: session.session_token,
      expiresAt: sessionExpiresAt
    };
  },

  /**
   * Validate an active tracking session token.
   */
  validateSessionToken(sessionToken) {
    if (!sessionToken) return null;
    const session = TrackingSessionRepo.getByToken(sessionToken);
    if (!session) return null;
    if (Date.now() > session.expires_at) return null;
    return session;
  }
};

module.exports = OtpService;
