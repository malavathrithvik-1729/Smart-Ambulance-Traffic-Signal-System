/**
 * Team Lifeline — Shared Emergency State & Real-Time Sync Engine (V2)
 * Standardized Schema, State Persistence, and Canonical Broadcast Protocol
 * Developed for SPR High School, Kamareddy — Smart Ambulance Traffic Signal System
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const mod = factory();
    root.EmergencyStateManager = mod.EmergencyStateManager;
    root.LifelineSync = mod.LifelineSync;
    root.SHARED_EMERGENCY_STATE = mod.SHARED_EMERGENCY_STATE;
    root.DEFAULT_EMERGENCY_CASE = mod.DEFAULT_EMERGENCY_CASE;
  }
})(typeof window !== 'undefined' ? window : this, function () {

  /* ══════════════════════════════════════════════════════════════════════════
     1. CANONICAL EMERGENCY CASE SCHEMA & SAFE DEFAULTS
     ══════════════════════════════════════════════════════════════════════════ */
  const DEFAULT_EMERGENCY_CASE = Object.freeze({
    caseId: "EM-402",
    status: "DISPATCHED", // DISPATCHED | EN_ROUTE | AT_SCENE | TRANSPORTING_HOSPITAL | COMPLETED
    createdAt: 1761369000000,
    lastUpdatedAt: 1761369000000,
    incidentDescription: "Accident on NH-44 Bypass road near Indian Oil petrol pump. 2 people injured, one bleeding heavily.",
    callerName: "Suresh Reddy",
    callerContact: "+91 98480 23145",
    incidentLocation: "NH-44 Highway Bypass, Kamareddy",
    latitude: 18.3312,
    longitude: 78.3445,
    landmarks: "Near Indian Oil Petrol Pump & Flyover Pillar 42",
    victimCount: 2,
    assignedAmbulanceId: "AMB-LIFELINE-01",
    driverName: "Officer R. Sharma",
    ambulanceLocation: { lat: 18.3180, lng: 78.3350 },
    etaSeconds: 348,
    extraNotes: ""
  });

  /**
   * Safely normalizes arbitrary input (JSON string or object) into a strictly valid case.
   * Handles legacy structures ({ desc, lat, lng, ts }) and ensures numerical coordinates.
   */
  function normalizeCase(raw) {
    if (!raw) return { ...DEFAULT_EMERGENCY_CASE, createdAt: Date.now(), lastUpdatedAt: Date.now() };

    let obj = raw;
    if (typeof raw === 'string') {
      try {
        obj = JSON.parse(raw);
      } catch (_) {
        return { ...DEFAULT_EMERGENCY_CASE, createdAt: Date.now(), lastUpdatedAt: Date.now() };
      }
    }

    if (typeof obj !== 'object' || obj === null) {
      return { ...DEFAULT_EMERGENCY_CASE, createdAt: Date.now(), lastUpdatedAt: Date.now() };
    }

    // Latitude & Longitude extraction with geographic validity checks
    let lat = parseFloat(obj.latitude !== undefined ? obj.latitude : (obj.lat !== undefined ? obj.lat : DEFAULT_EMERGENCY_CASE.latitude));
    let lng = parseFloat(obj.longitude !== undefined ? obj.longitude : (obj.lng !== undefined ? obj.lng : DEFAULT_EMERGENCY_CASE.longitude));

    if (isNaN(lat) || lat < -90 || lat > 90) lat = DEFAULT_EMERGENCY_CASE.latitude;
    if (isNaN(lng) || lng < -180 || lng > 180) lng = DEFAULT_EMERGENCY_CASE.longitude;

    const desc = (typeof obj.incidentDescription === 'string' && obj.incidentDescription.trim())
      ? obj.incidentDescription.trim()
      : ((typeof obj.desc === 'string' && obj.desc.trim()) ? obj.desc.trim() : DEFAULT_EMERGENCY_CASE.incidentDescription);

    const ts = (typeof obj.createdAt === 'number' && !isNaN(obj.createdAt))
      ? obj.createdAt
      : ((typeof obj.ts === 'number' && !isNaN(obj.ts)) ? obj.ts : Date.now());

    return {
      caseId: typeof obj.caseId === 'string' && obj.caseId.trim() ? obj.caseId.trim() : DEFAULT_EMERGENCY_CASE.caseId,
      status: typeof obj.status === 'string' && obj.status ? obj.status : DEFAULT_EMERGENCY_CASE.status,
      createdAt: ts,
      lastUpdatedAt: (typeof obj.lastUpdatedAt === 'number' && !isNaN(obj.lastUpdatedAt)) ? obj.lastUpdatedAt : Date.now(),
      incidentDescription: desc,
      callerName: typeof obj.callerName === 'string' ? obj.callerName : DEFAULT_EMERGENCY_CASE.callerName,
      callerContact: typeof obj.callerContact === 'string' ? obj.callerContact : DEFAULT_EMERGENCY_CASE.callerContact,
      incidentLocation: typeof obj.incidentLocation === 'string' ? obj.incidentLocation : DEFAULT_EMERGENCY_CASE.incidentLocation,
      latitude: lat,
      longitude: lng,
      landmarks: typeof obj.landmarks === 'string' ? obj.landmarks : (typeof obj.extraNotes === 'string' ? obj.extraNotes : DEFAULT_EMERGENCY_CASE.landmarks),
      victimCount: typeof obj.victimCount === 'number' && !isNaN(obj.victimCount) ? obj.victimCount : DEFAULT_EMERGENCY_CASE.victimCount,
      assignedAmbulanceId: typeof obj.assignedAmbulanceId === 'string' ? obj.assignedAmbulanceId : DEFAULT_EMERGENCY_CASE.assignedAmbulanceId,
      driverName: typeof obj.driverName === 'string' ? obj.driverName : DEFAULT_EMERGENCY_CASE.driverName,
      ambulanceLocation: (obj.ambulanceLocation && typeof obj.ambulanceLocation.lat === 'number')
        ? { lat: obj.ambulanceLocation.lat, lng: obj.ambulanceLocation.lng }
        : DEFAULT_EMERGENCY_CASE.ambulanceLocation,
      etaSeconds: typeof obj.etaSeconds === 'number' ? obj.etaSeconds : DEFAULT_EMERGENCY_CASE.etaSeconds,
      extraNotes: typeof obj.extraNotes === 'string' ? obj.extraNotes : ""
    };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2. EMERGENCY STATE MANAGER (Storage Persistence)
     ══════════════════════════════════════════════════════════════════════════ */
  const STORAGE_KEY = 'lifeline_em_case';
  const STORAGE_MSG_KEY = 'lifeline_em_msg';
  const SESSION_DESC = 'em_desc';
  const SESSION_LAT = 'em_lat';
  const SESSION_LNG = 'em_lng';

  const EmergencyStateManager = {
    normalize: normalizeCase,

    createCase: function (options) {
      const opts = options || {};
      const caseId = opts.caseId || ('EM-' + Math.floor(100 + Math.random() * 900));
      const newCase = normalizeCase({
        ...opts,
        caseId,
        createdAt: Date.now(),
        lastUpdatedAt: Date.now()
      });
      this.saveCase(newCase);
      return newCase;
    },

    loadCase: function () {
      if (typeof window === 'undefined') return { ...DEFAULT_EMERGENCY_CASE };

      try {
        const stored = window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : null;
        if (stored) {
          return normalizeCase(stored);
        }
      } catch (_) {}

      // Fallback to sessionStorage keys if present
      try {
        if (window.sessionStorage) {
          const sDesc = window.sessionStorage.getItem(SESSION_DESC);
          const sLat = window.sessionStorage.getItem(SESSION_LAT);
          const sLng = window.sessionStorage.getItem(SESSION_LNG);
          if (sDesc || sLat || sLng) {
            return normalizeCase({
              incidentDescription: sDesc,
              latitude: sLat,
              longitude: sLng,
              createdAt: Date.now()
            });
          }
        }
      } catch (_) {}

      return { ...DEFAULT_EMERGENCY_CASE, createdAt: Date.now(), lastUpdatedAt: Date.now() };
    },

    saveCase: function (caseData) {
      if (typeof window === 'undefined') return caseData;
      const normalized = normalizeCase(caseData);
      normalized.lastUpdatedAt = Date.now();

      try {
        if (window.localStorage) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        }
      } catch (_) {}

      try {
        if (window.sessionStorage) {
          window.sessionStorage.setItem(SESSION_DESC, normalized.incidentDescription);
          window.sessionStorage.setItem(SESSION_LAT, String(normalized.latitude));
          window.sessionStorage.setItem(SESSION_LNG, String(normalized.longitude));
        }
      } catch (_) {}

      return normalized;
    },

    updateCase: function (partial) {
      const current = this.loadCase();
      const merged = { ...current, ...partial, lastUpdatedAt: Date.now() };
      return this.saveCase(merged);
    },

    clearCase: function () {
      if (typeof window === 'undefined') return;
      try {
        if (window.localStorage) window.localStorage.removeItem(STORAGE_KEY);
        if (window.sessionStorage) {
          window.sessionStorage.removeItem(SESSION_DESC);
          window.sessionStorage.removeItem(SESSION_LAT);
          window.sessionStorage.removeItem(SESSION_LNG);
        }
      } catch (_) {}
    }
  };

  /* ══════════════════════════════════════════════════════════════════════════
     3. CANONICAL BROWSER REAL-TIME SYNC PROTOCOL ('lifeline_em')
     ══════════════════════════════════════════════════════════════════════════ */
  const CANONICAL_CHANNEL = 'lifeline_em';

  class LifelineSyncManager {
    constructor(channelName) {
      this.channelName = channelName || CANONICAL_CHANNEL;
      this.originId = 'tab_' + Math.random().toString(36).substring(2, 9);
      this.processedMsgIds = new Set();
      this.listeners = [];
      this.channel = null;
      this.socket = null;
      this.currentCaseId = null;

      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(this.channelName);
          this.channel.onmessage = (e) => this._handleIncoming(e.data);
        } catch (err) {
          this.channel = null;
        }
      }

      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
          if (e.key === STORAGE_MSG_KEY && e.newValue) {
            try {
              const msg = JSON.parse(e.newValue);
              this._handleIncoming(msg);
            } catch (_) {}
          }
        });

        // Initialize Socket.IO connection if client script is loaded
        if (typeof window.io === 'function') {
          try {
            this.socket = window.io();
            this._initSocketListeners();
          } catch (_) {}
        } else {
          // Check again after DOM loads if socket.io is deferred
          window.addEventListener('DOMContentLoaded', () => {
            if (typeof window.io === 'function' && !this.socket) {
              try {
                this.socket = window.io();
                this._initSocketListeners();
              } catch (_) {}
            }
          });
        }
      }
    }

    _initSocketListeners() {
      if (!this.socket) return;
      const events = ['POSITION', 'JOURNEY_START', 'ARRIVED_SCENE', 'EXTRA_DESC', 'STATUS_UPDATED', 'EMERGENCY_CREATED'];
      events.forEach((evt) => {
        this.socket.on(evt, (data) => {
          this._handleIncoming({ ...(data && typeof data === 'object' ? data : {}), type: evt });
        });
      });
    }

    setCaseId(caseId) {
      this.currentCaseId = caseId;
    }

    joinCase(caseId, trackingToken = null, role = 'victim') {
      this.currentCaseId = caseId;
      if (this.socket && this.socket.connected) {
        this.socket.emit('join_case', { caseId, trackingToken, role });
      } else if (this.socket) {
        this.socket.on('connect', () => {
          this.socket.emit('join_case', { caseId, trackingToken, role });
        });
      }
    }

    _handleIncoming(msg) {
      if (!msg || typeof msg !== 'object') return;
      // Discard messages originating from the same instance
      if (msg._originId && msg._originId === this.originId) return;

      // Deduplicate by message ID
      if (msg._id) {
        if (this.processedMsgIds.has(msg._id)) return;
        this.processedMsgIds.add(msg._id);
        if (this.processedMsgIds.size > 200) {
          const first = this.processedMsgIds.values().next().value;
          this.processedMsgIds.delete(first);
        }
      }

      // Map legacy event types if received
      let normalizedType = msg.type;
      let normalizedPayload = msg;
      if (msg.type === 'AMBULANCE_PROGRESS' && msg.payload) {
        normalizedType = 'POSITION';
        normalizedPayload = {
          type: 'POSITION',
          pos: [msg.payload.lat, msg.payload.lng],
          eta: `${msg.payload.etaMin} min`,
          dist: `${msg.payload.distKm} km`
        };
      } else if (msg.type === 'AMBULANCE_ARRIVED') {
        normalizedType = 'ARRIVED_SCENE';
      } else if (msg.type === 'LOCATION_DESCRIPTION_UPDATED' && msg.payload) {
        normalizedType = 'EXTRA_DESC';
        normalizedPayload = { type: 'EXTRA_DESC', val: msg.payload.description || msg.payload.fullText };
      }

      this.listeners.forEach((fn) => {
        try {
          fn(normalizedPayload, normalizedType);
        } catch (err) {
          console.error('[LifelineSync] Listener error:', err);
        }
      });
    }

    send(type, payloadData) {
      const msgId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      this.processedMsgIds.add(msgId);

      const msg = {
        ...(payloadData && typeof payloadData === 'object' ? payloadData : {}),
        type,
        _id: msgId,
        _originId: this.originId,
        _ts: Date.now()
      };

      if (this.channel) {
        try {
          this.channel.postMessage(msg);
        } catch (_) {}
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(STORAGE_MSG_KEY, JSON.stringify(msg));
        } catch (_) {}
      }

      // Relay to Socket.IO backend if connected
      if (this.socket && this.socket.connected) {
        try {
          const caseId = (payloadData && payloadData.caseId) || this.currentCaseId || 'EM-402';
          if (type === 'POSITION') {
            const lat = Array.isArray(payloadData.pos) ? payloadData.pos[0] : payloadData.lat;
            const lng = Array.isArray(payloadData.pos) ? payloadData.pos[1] : payloadData.lng;
            this.socket.emit('ambulance_telemetry', {
              caseId,
              lat,
              lng,
              etaSeconds: payloadData.etaSeconds,
              distanceKm: payloadData.distanceKm,
              locationSource: payloadData.locationSource || 'simulated'
            });
          } else if (type === 'JOURNEY_START') {
            this.socket.emit('start_journey', { caseId });
          } else if (type === 'ARRIVED_SCENE') {
            this.socket.emit('mark_arrived', { caseId });
          } else if (type === 'EXTRA_DESC') {
            this.socket.emit('extra_landmark', {
              caseId,
              landmarks: payloadData.val || payloadData.landmarks,
              description: payloadData.val
            });
          }
        } catch (_) {}
      }
    }

    subscribe(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
      return () => {
        this.listeners = this.listeners.filter((fn) => fn !== callback);
      };
    }
  }

  const syncInstance = new LifelineSyncManager(CANONICAL_CHANNEL);

  /* ══════════════════════════════════════════════════════════════════════════
     4. PRESERVED REFERENCE DEMO DATA (Backwards Compatibility)
     ══════════════════════════════════════════════════════════════════════════ */
  const SHARED_EMERGENCY_STATE = {
    ...DEFAULT_EMERGENCY_CASE,
    routesList: [
      {
        id: "route-alpha",
        name: "Route Alpha (NH-44 Express)",
        recommended: true,
        distanceKm: 4.2,
        travelTimeMin: 5.8,
        trafficSignalsCount: 3,
        vehiclesCount: 34,
        color: "#10b981",
        coordinates: [
          [18.3180, 78.3350],
          [18.3205, 78.3370],
          [18.3235, 78.3392],
          [18.3265, 78.3415],
          [18.3290, 78.3432],
          [18.3312, 78.3445]
        ]
      },
      {
        id: "route-beta",
        name: "Route Beta (Subash Road Arterial)",
        recommended: false,
        distanceKm: 4.8,
        travelTimeMin: 8.2,
        trafficSignalsCount: 5,
        vehiclesCount: 68,
        color: "#f59e0b",
        coordinates: [
          [18.3180, 78.3350],
          [18.3195, 78.3325],
          [18.3225, 78.3320],
          [18.3255, 78.3340],
          [18.3285, 78.3385],
          [18.3305, 78.3420],
          [18.3312, 78.3445]
        ]
      }
    ],
    nearbyHospitals: [
      {
        id: "HOSP-01",
        name: "Government Area Hospital, Kamareddy",
        type: "District General & Trauma Hospital",
        distanceKm: 2.8,
        etaMin: 4.5,
        trafficSignalsCount: 2,
        icuBeds: 6,
        traumaOT: "READY (2 Units)",
        recommended: true,
        lat: 18.3280,
        lng: 78.3310
      },
      {
        id: "HOSP-02",
        name: "Lifeline Superspeciality Hospital",
        type: "Tertiary Multi-Specialty Center",
        distanceKm: 4.1,
        etaMin: 6.2,
        trafficSignalsCount: 3,
        icuBeds: 12,
        traumaOT: "READY (3 Units)",
        recommended: false,
        lat: 18.3360,
        lng: 78.3510
      }
    ]
  };

  return {
    DEFAULT_EMERGENCY_CASE,
    EmergencyStateManager,
    LifelineSync: syncInstance,
    SHARED_EMERGENCY_STATE
  };
});
