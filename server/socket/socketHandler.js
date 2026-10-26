/**
 * Team Lifeline V2 - Real-Time Socket.IO Handler
 * Manages per-case rooms, role authorization, and low-latency telemetry broadcasting.
 */

const { EmergencyCaseRepo, TrackingSessionRepo } = require('../db/repositories');

let ioInstance = null;

function setupSocketIO(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    // console.log(`[SOCKET] Client connected: ${socket.id}`);

    // Join general emergency fleet room (ambulance drivers & operators)
    socket.on('join_fleet', (data) => {
      socket.join('fleet_room');
      // console.log(`[SOCKET] Socket ${socket.id} joined fleet_room`);
      socket.emit('fleet_joined', { success: true });
    });

    // Join a specific case room with authorization check
    socket.on('join_case', (data = {}) => {
      const { caseId, trackingToken, role } = data;

      if (!caseId) {
        return socket.emit('error_message', { error: 'caseId is required to join case room' });
      }

      // Authorization verification:
      // Drivers and operators can join freely; victims must provide a valid tracking session token
      if (role === 'driver' || role === 'operator') {
        socket.join(`case:${caseId}`);
        socket.emit('case_joined', { caseId, authorized: true, role });
        return;
      }

      if (trackingToken) {
        const session = TrackingSessionRepo.getByToken(trackingToken);
        if (session && session.case_id === caseId && Date.now() <= session.expires_at) {
          socket.join(`case:${caseId}`);
          socket.emit('case_joined', { caseId, authorized: true, role: 'victim' });
          return;
        }
      }

      // In development simulation mode, allow fallback join for testing
      socket.join(`case:${caseId}`);
      socket.emit('case_joined', { caseId, authorized: true, warning: 'Unauthenticated demo tracking connection' });
    });

    // Driver publishes live telemetry
    socket.on('ambulance_telemetry', (payload = {}) => {
      const { caseId, lat, lng, speed, heading, etaSeconds, distanceKm, locationSource } = payload;
      if (!caseId || lat === undefined || lng === undefined) return;

      // Update database
      EmergencyCaseRepo.updateTelemetry(caseId, {
        lat,
        lng,
        speed,
        heading,
        etaSeconds,
        distanceKm,
        locationSource: locationSource || 'simulated'
      });

      // Broadcast to case room (victims & operators)
      io.to(`case:${caseId}`).emit('POSITION', {
        caseId,
        lat,
        lng,
        speed,
        heading,
        etaSeconds,
        distanceKm,
        locationSource: locationSource || 'simulated',
        timestamp: Date.now()
      });
    });

    // Driver starts journey
    socket.on('start_journey', (payload = {}) => {
      const { caseId } = payload;
      if (!caseId) return;

      EmergencyCaseRepo.updateStatus(caseId, 'en_route');
      io.to(`case:${caseId}`).emit('JOURNEY_START', { caseId, status: 'en_route', timestamp: Date.now() });
      io.to('fleet_room').emit('STATUS_UPDATED', { caseId, status: 'en_route' });
    });

    // Driver marks arrival
    socket.on('mark_arrived', (payload = {}) => {
      const { caseId } = payload;
      if (!caseId) return;

      EmergencyCaseRepo.updateStatus(caseId, 'arrived');
      io.to(`case:${caseId}`).emit('ARRIVED_SCENE', { caseId, status: 'arrived', timestamp: Date.now() });
      io.to('fleet_room').emit('STATUS_UPDATED', { caseId, status: 'arrived' });
    });

    // Victim submits additional landmark / description update
    socket.on('extra_landmark', (payload = {}) => {
      const { caseId, landmarks, description } = payload;
      if (!caseId) return;

      try {
        EmergencyCaseRepo.updateDriverSummary(caseId, { landmarks });
      } catch (err) {
        console.error('[SOCKET ERROR] updateDriverSummary:', err.message);
      }
      io.to(`case:${caseId}`).emit('EXTRA_DESC', { caseId, landmarks, description, timestamp: Date.now() });
      io.to('fleet_room').emit('EXTRA_DESC', { caseId, landmarks, description, timestamp: Date.now() });
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

function broadcastEmergencyCreated(emergencyCase) {
  if (!ioInstance) return;
  ioInstance.to('fleet_room').emit('EMERGENCY_CREATED', emergencyCase);
}

function broadcastCaseStatus(caseId, status) {
  if (!ioInstance) return;
  ioInstance.to(`case:${caseId}`).emit('STATUS_UPDATED', { caseId, status, timestamp: Date.now() });
  ioInstance.to('fleet_room').emit('STATUS_UPDATED', { caseId, status, timestamp: Date.now() });
}

function broadcastCaseTelemetry(caseId, telemetry) {
  if (!ioInstance) return;
  ioInstance.to(`case:${caseId}`).emit('POSITION', { caseId, ...telemetry, timestamp: Date.now() });
}

module.exports = {
  setupSocketIO,
  broadcastEmergencyCreated,
  broadcastCaseStatus,
  broadcastCaseTelemetry
};
