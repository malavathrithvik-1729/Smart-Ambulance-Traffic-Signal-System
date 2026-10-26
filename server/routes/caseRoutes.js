/**
 * Team Lifeline V2 - Emergency Case Management Routes
 * Case listing, assignment, telemetry publishing, and journey state transitions.
 */

const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const { EmergencyCaseRepo } = require('../db/repositories');
const OtpService = require('../services/tracking/otpService');
const SmsService = require('../services/sms/smsProvider');
const { broadcastEmergencyCreated, broadcastCaseStatus, broadcastCaseTelemetry } = require('../socket/socketHandler');

// 1. List active emergency cases (for Driver HUD & Operator console)
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const cases = EmergencyCaseRepo.getAll(limit);
  return res.json({ success: true, count: cases.length, cases });
});

// 2. Get single emergency case details
router.get('/:id', (req, res) => {
  const emCase = EmergencyCaseRepo.getById(req.params.id);
  if (!emCase) {
    return res.status(404).json({ success: false, error: 'Emergency case not found' });
  }
  return res.json({ success: true, case: emCase });
});

// 3. Create a manual emergency case (from web intake / operator form)
router.post('/', async (req, res) => {
  try {
    const {
      incidentDescription,
      incidentType = 'road_accident',
      severity = 'critical',
      incidentLocation = 'Kamareddy Clock Tower',
      latitude = 18.3242,
      longitude = 78.3394,
      landmarks = '',
      callerContact = '',
      callerName = 'Bystander',
      victimCount = 1,
      reportedCondition = 'Emergency distress',
      assignedAmbulanceId = 'AMB-01'
    } = req.body || {};

    if (!incidentDescription) {
      return res.status(400).json({ success: false, error: 'incidentDescription is required' });
    }

    const caseId = `EM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const emergencyCase = EmergencyCaseRepo.create({
      id: caseId,
      status: 'reported',
      incidentType,
      incidentDescription,
      severity,
      incidentLocation,
      latitude: parseFloat(latitude) || 18.3242,
      longitude: parseFloat(longitude) || 78.3394,
      landmarks,
      callerContact,
      callerName,
      victimCount: parseInt(victimCount, 10) || 1,
      reportedCondition,
      driverSummary: `${severity.toUpperCase()}: ${incidentType.toUpperCase()} at ${incidentLocation}. ${victimCount} victim(s).`,
      assignedAmbulanceId,
      locationSource: 'simulated',
      etaSeconds: 300,
      distanceKm: 2.5
    });

    // Create tracking invitation + OTP
    const invitationData = OtpService.createInvitation(caseId, 'simulated');

    // Send SMS if caller contact provided
    let smsResult = null;
    if (callerContact) {
      smsResult = await SmsService.sendTrackingSms({
        to: callerContact,
        caseId,
        trackingToken: invitationData.token,
        otp: invitationData.rawOtp
      });
    }

    broadcastEmergencyCreated(emergencyCase);

    return res.status(201).json({
      success: true,
      case: emergencyCase,
      invitation: {
        token: invitationData.token,
        expiresAt: invitationData.expiresAt
      },
      sms: smsResult
    });
  } catch (err) {
    console.error('[CREATE CASE ERROR]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Driver accepts emergency case
router.post('/:id/accept', (req, res) => {
  const { ambulanceId = 'AMB-01' } = req.body || {};
  const emCase = EmergencyCaseRepo.getById(req.params.id);
  if (!emCase) {
    return res.status(404).json({ success: false, error: 'Emergency case not found' });
  }

  const updated = EmergencyCaseRepo.updateStatus(emCase.id, 'dispatched');
  broadcastCaseStatus(emCase.id, 'dispatched');

  return res.json({ success: true, case: updated });
});

// 5. Driver starts journey
router.post('/:id/start-journey', (req, res) => {
  const emCase = EmergencyCaseRepo.getById(req.params.id);
  if (!emCase) {
    return res.status(404).json({ success: false, error: 'Emergency case not found' });
  }

  const updated = EmergencyCaseRepo.updateStatus(emCase.id, 'en_route');
  broadcastCaseStatus(emCase.id, 'en_route');

  return res.json({ success: true, case: updated });
});

// 6. Driver publishes location telemetry (simulated or real browser GPS)
router.post('/:id/telemetry', (req, res) => {
  const { lat, lng, speed = 0, heading = 0, etaSeconds, distanceKm, locationSource = 'simulated' } = req.body || {};

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ success: false, error: 'lat and lng are required' });
  }

  const emCase = EmergencyCaseRepo.getById(req.params.id);
  if (!emCase) {
    return res.status(404).json({ success: false, error: 'Emergency case not found' });
  }

  const updated = EmergencyCaseRepo.updateTelemetry(emCase.id, {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    speed: parseFloat(speed) || 0,
    heading: parseFloat(heading) || 0,
    etaSeconds: etaSeconds !== undefined ? parseInt(etaSeconds, 10) : null,
    distanceKm: distanceKm !== undefined ? parseFloat(distanceKm) : null,
    locationSource
  });

  broadcastCaseTelemetry(emCase.id, {
    lat: updated.ambulance_lat,
    lng: updated.ambulance_lng,
    speed: updated.ambulance_speed,
    heading: updated.ambulance_heading,
    etaSeconds: updated.eta_seconds,
    distanceKm: updated.distance_km,
    locationSource: updated.location_source
  });

  return res.json({ success: true, telemetry: updated });
});

// 7. Driver marks arrived at scene
router.post('/:id/arrived', (req, res) => {
  const emCase = EmergencyCaseRepo.getById(req.params.id);
  if (!emCase) {
    return res.status(404).json({ success: false, error: 'Emergency case not found' });
  }

  const updated = EmergencyCaseRepo.updateStatus(emCase.id, 'arrived');
  broadcastCaseStatus(emCase.id, 'arrived');

  return res.json({ success: true, case: updated });
});

module.exports = router;
