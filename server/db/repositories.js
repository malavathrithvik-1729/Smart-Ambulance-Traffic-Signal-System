/**
 * Team Lifeline V2 - Database Repositories
 * Clean data access methods using prepared statements.
 */

const { getDatabase } = require('./database');

// Call Sessions
const CallSessionRepo = {
  create({ id, callerContact, callerName = 'Caller', consentStatus = 'pending', status = 'incoming' }) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO call_sessions (id, caller_contact, caller_name, consent_status, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, callerContact, callerName, consentStatus, status, now, now);
    return this.getById(id);
  },

  getById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM call_sessions WHERE id = ?`);
    return stmt.get(id) || null;
  },

  updateConsent(id, consentStatus) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE call_sessions SET consent_status = ?, updated_at = ? WHERE id = ?
    `);
    stmt.run(consentStatus, now, id);
    return this.getById(id);
  },

  updateStatus(id, status, notes = null) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE call_sessions SET status = ?, intake_notes = COALESCE(?, intake_notes), updated_at = ? WHERE id = ?
    `);
    stmt.run(status, notes, now, id);
    return this.getById(id);
  }
};

// Recordings
const RecordingRepo = {
  create({ id, callSessionId, filePath, fileName, mimeType = 'audio/wav', durationSeconds = 0, consentGranted = 1 }) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO recordings (id, call_session_id, file_path, file_name, mime_type, duration_seconds, consent_granted, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, callSessionId, filePath, fileName, mimeType, durationSeconds, consentGranted ? 1 : 0, now);
    return this.getById(id);
  },

  getById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM recordings WHERE id = ? AND deleted_at IS NULL`);
    return stmt.get(id) || null;
  },

  getBySessionId(sessionId) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM recordings WHERE call_session_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`);
    return stmt.all(sessionId) || [];
  },

  softDelete(id) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`UPDATE recordings SET deleted_at = ? WHERE id = ?`);
    stmt.run(now, id);
    return true;
  }
};

// Transcripts
const TranscriptRepo = {
  create({ id, callSessionId, recordingId = null, rawText, language = 'en', engine = 'local_rules', status = 'completed' }) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO transcripts (id, call_session_id, recording_id, raw_text, language, engine, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, callSessionId, recordingId, rawText, language, engine, status, now);
    return this.getById(id);
  },

  getById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM transcripts WHERE id = ?`);
    return stmt.get(id) || null;
  },

  getBySessionId(sessionId) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM transcripts WHERE call_session_id = ? ORDER BY created_at DESC`);
    return stmt.all(sessionId) || [];
  }
};

// Helper to format case row into JSON-friendly object
function formatCase(row) {
  if (!row) return null;
  return {
    ...row,
    unconfirmed_fields: typeof row.unconfirmed_fields === 'string' ? JSON.parse(row.unconfirmed_fields || '[]') : row.unconfirmed_fields,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : row.metadata
  };
}

// Emergency Cases
const EmergencyCaseRepo = {
  create(data) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO emergency_cases (
        id, call_session_id, transcript_id, status, incident_type, incident_description,
        severity, incident_location, latitude, longitude, landmarks, caller_contact,
        caller_name, victim_count, reported_condition, unconfirmed_fields, driver_summary,
        assigned_ambulance_id, ambulance_lat, ambulance_lng, ambulance_speed, ambulance_heading,
        location_source, eta_seconds, distance_km, created_at, updated_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.id,
      data.callSessionId || null,
      data.transcriptId || null,
      data.status || 'reported',
      data.incidentType || 'road_accident',
      data.incidentDescription,
      data.severity || 'critical',
      data.incidentLocation,
      data.latitude,
      data.longitude,
      data.landmarks || '',
      data.callerContact || '',
      data.callerName || 'Bystander',
      data.victimCount || 1,
      data.reportedCondition || 'Emergency trauma reported',
      JSON.stringify(data.unconfirmedFields || []),
      data.driverSummary || data.incidentDescription,
      data.assignedAmbulanceId || 'AMB-01',
      data.ambulanceLat ?? null,
      data.ambulanceLng ?? null,
      data.ambulanceSpeed ?? 0,
      data.ambulanceHeading ?? 0,
      data.locationSource || 'simulated',
      data.etaSeconds ?? 300,
      data.distanceKm ?? 2.5,
      now,
      now,
      JSON.stringify(data.metadata || { simulated: true })
    );

    return this.getById(data.id);
  },

  getById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM emergency_cases WHERE id = ?`);
    const row = stmt.get(id);
    return formatCase(row);
  },

  getAll(limit = 50) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM emergency_cases ORDER BY created_at DESC LIMIT ?`);
    const rows = stmt.all(limit);
    return rows.map(formatCase);
  },

  updateStatus(id, status) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE emergency_cases SET status = ?, updated_at = ? WHERE id = ?
    `);
    stmt.run(status, now, id);
    return this.getById(id);
  },

  updateTelemetry(id, params = {}) {
    const { lat, lng, speed = 0, heading = 0, etaSeconds = null, distanceKm = null, locationSource = 'simulated' } = params;
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE emergency_cases SET
        ambulance_lat = ?,
        ambulance_lng = ?,
        ambulance_speed = ?,
        ambulance_heading = ?,
        eta_seconds = COALESCE(?, eta_seconds),
        distance_km = COALESCE(?, distance_km),
        location_source = ?,
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(lat !== undefined ? lat : null, lng !== undefined ? lng : null, speed !== undefined ? speed : 0, heading !== undefined ? heading : 0, etaSeconds !== undefined ? etaSeconds : null, distanceKm !== undefined ? distanceKm : null, locationSource !== undefined ? locationSource : 'simulated', now, id);
    return this.getById(id);
  },

  updateDriverSummary(id, params = {}) {
    const { driverSummary, incidentLocation, landmarks, victimCount } = params;
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      UPDATE emergency_cases SET
        driver_summary = COALESCE(?, driver_summary),
        incident_location = COALESCE(?, incident_location),
        landmarks = COALESCE(?, landmarks),
        victim_count = COALESCE(?, victim_count),
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(driverSummary !== undefined ? driverSummary : null, incidentLocation !== undefined ? incidentLocation : null, landmarks !== undefined ? landmarks : null, victimCount !== undefined ? victimCount : null, now, id);
    return this.getById(id);
  }
};

// Tracking Invitations & OTP
const TrackingInvitationRepo = {
  create({ id, caseId, token, otpHash, otpSalt, otpExpiresAt, smsStatus = 'simulated', smsMessage = '' }) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO tracking_invitations (
        id, case_id, token, otp_hash, otp_salt, otp_attempts, otp_max_attempts,
        otp_expires_at, status, sms_status, sms_message, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, 5, ?, 'active', ?, ?, ?)
    `);
    stmt.run(id, caseId, token, otpHash, otpSalt, otpExpiresAt, smsStatus, smsMessage, now);
    return this.getByToken(token);
  },

  getByToken(token) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM tracking_invitations WHERE token = ?`);
    return stmt.get(token) || null;
  },

  getById(id) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM tracking_invitations WHERE id = ?`);
    return stmt.get(id) || null;
  },

  getByCaseId(caseId) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM tracking_invitations WHERE case_id = ? ORDER BY created_at DESC`);
    return stmt.all(caseId) || [];
  },

  incrementAttempts(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE tracking_invitations SET otp_attempts = otp_attempts + 1 WHERE id = ?
    `);
    stmt.run(id);
    return this.getById(id);
  },

  markVerified(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE tracking_invitations SET status = 'verified' WHERE id = ?
    `);
    stmt.run(id);
    return this.getById(id);
  },

  markRevoked(id) {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE tracking_invitations SET status = 'revoked' WHERE id = ?
    `);
    stmt.run(id);
    return this.getById(id);
  }
};

// Tracking Sessions (Post-OTP Verification)
const TrackingSessionRepo = {
  create({ id, invitationId, caseId, sessionToken, expiresAt }) {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`
      INSERT INTO tracking_sessions (id, invitation_id, case_id, session_token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, invitationId, caseId, sessionToken, expiresAt, now);
    return this.getByToken(sessionToken);
  },

  getByToken(token) {
    const db = getDatabase();
    const stmt = db.prepare(`SELECT * FROM tracking_sessions WHERE session_token = ?`);
    return stmt.get(token) || null;
  },

  deleteExpired() {
    const db = getDatabase();
    const now = Date.now();
    const stmt = db.prepare(`DELETE FROM tracking_sessions WHERE expires_at < ?`);
    stmt.run(now);
  }
};

module.exports = {
  CallSessionRepo,
  RecordingRepo,
  TranscriptRepo,
  EmergencyCaseRepo,
  TrackingInvitationRepo,
  TrackingSessionRepo
};
