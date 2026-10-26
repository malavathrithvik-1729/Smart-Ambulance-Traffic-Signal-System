# Team Lifeline V2 — Phase 2 Completion Report

**Project:** Smart Ambulance Traffic Signal System  
**Team:** Team Lifeline — SPR High School, Kamareddy, Telangana, India  
**Status:** **Phase 2 Complete**  
**Core Deliverable:** End-to-End Phone Call Intake → Audio Consent & Recording → Transcription & AI Extraction → SQLite Dispatch → Cryptographic OTP & SMS → Multi-Device Real-Time Ambulance Tracking  

---

## 1. Executive Summary

Phase 2 transitions the Smart Ambulance Traffic Signal System from a browser-bound prototype to a full-stack, client-server emergency dispatch system capable of synchronizing across separate devices (Laptop for Ambulance Driver, Smartphone for Victim) over local Wi-Fi or cellular networks.

A complete phone call intake and audio-processing pipeline was built with explicit recording consent checks, audio storage outside public directories, deterministic extraction of critical emergency fields, cryptographic OTP generation, SMS invitation dispatch, and low-latency Socket.IO telemetry streaming.

---

## 2. Architecture & Subsystems

```
                                      ┌──────────────────────────────────────────────┐
                                      │           TEAM LIFELINE V2 SERVER            │
                                      │        Node.js + Express + Socket.IO         │
                                      └──────────────────────┬───────────────────────┘
                                                             │
                  ┌──────────────────────────────────────────┼──────────────────────────────────────────┐
                  ▼                                          ▼                                          ▼
     ┌────────────────────────┐                 ┌────────────────────────┐                 ┌────────────────────────┐
     │   TELEPHONY & AUDIO    │                 │   STORAGE & SECURITY   │                 │   REAL-TIME DISPATCH   │
     ├────────────────────────┤                 ├────────────────────────┤                 ├────────────────────────┤
     │ • Voice Webhook / IVR  │                 │ • SQLite Database      │                 │ • Socket.IO Rooms      │
     │ • DTMF Consent Checks  │                 │ • Call Sessions        │                 │ • Case Telemetry       │
     │ • Audio Storage (WAV)  │                 │ • Recordings & Transcr.│                 │ • Journey Transitions  │
     │ • Speech Transcription │                 │ • Emergency Cases      │                 │ • Arrival Alerts       │
     │ • Emergency Extraction │                 │ • Salted OTP Hashing   │                 │ • Multi-Device Wi-Fi   │
     │ • Call Simulation Mode │                 │ • 5-min Expiry & TTL   │                 │ • OSRM Route Geometry  │
     └────────────────────────┘                 └────────────────────────┘                 └────────────────────────┘
```

---

## 3. Files Created, Modified, and Managed

| File Path | Type | Action | Description |
| :--- | :---: | :---: | :--- |
| [`package.json`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/package.json) | Config | Created | Declared Express, Socket.IO, and NPM test scripts. |
| [`.env.example`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/.env.example) | Config | Created | Configuration template with ports, paths, and provider credentials. |
| [`.gitignore`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/.gitignore) | Config | Created | Protected databases, audio files, environment secrets, and node_modules. |
| [`server/config.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/config.js) | Server | Created | Centralized environment loader with automatic Wi-Fi IP detection. |
| [`server/db/database.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/db/database.js) | Server | Created | SQLite schema initialization via native `node:sqlite`. |
| [`server/db/repositories.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/db/repositories.js) | Server | Created | Data access objects for cases, recordings, sessions, and OTPs. |
| [`server/services/telephony/mockTelephony.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/services/telephony/mockTelephony.js) | Server | Created | Complete emergency call pipeline simulation for offline testing. |
| [`server/services/telephony/telephonyProvider.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/services/telephony/telephonyProvider.js) | Server | Created | Twilio TwiML voice webhook and consent handler. |
| [`server/services/audio/recordingService.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/services/audio/recordingService.js) | Server | Created | Secure audio file storage with strict consent enforcement. |
| [`server/services/ai/transcriptionService.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/services/ai/transcriptionService.js) | Server | Created | Modular speech-to-text adapter with local rule-based engine. |
| [`server/services/ai/extractionService.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/services/ai/extractionService.js) | Server | Created | Deterministic emergency field extraction (Kamareddy coordinates). |
| [`server/services/sms/mockSms.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/services/sms/mockSms.js) | Server | Created | Simulated carrier SMS delivery logger. |
| [`server/services/sms/smsProvider.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/services/sms/smsProvider.js) | Server | Created | SMS dispatcher supporting Twilio and simulation mode. |
| [`server/services/tracking/otpService.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/services/tracking/otpService.js) | Server | Created | Cryptographic OTP generation, HMAC-SHA256 hashing, and verification. |
| [`server/socket/socketHandler.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/socket/socketHandler.js) | Server | Created | Socket.IO case rooms and telemetry broadcasting. |
| [`server/routes/telephonyRoutes.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/routes/telephonyRoutes.js) | Server | Created | Webhooks for call, consent, intake speech, and simulation. |
| [`server/routes/caseRoutes.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/routes/caseRoutes.js) | Server | Created | Case CRUD, driver acceptance, telemetry, and status endpoints. |
| [`server/routes/trackingRoutes.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/routes/trackingRoutes.js) | Server | Created | Invitation resolution and OTP verification endpoints. |
| [`server/routes/audioRoutes.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/routes/audioRoutes.js) | Server | Created | Protected audio stream and transcript endpoints. |
| [`server/routes/operatorRoutes.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/routes/operatorRoutes.js) | Server | Created | Operator status, IP discovery, and SMS inbox inspector. |
| [`server/index.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/server/index.js) | Server | Created | Main server entry point (Express, Socket.IO, static asset protection). |
| [`operator.html`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/operator.html) | Frontend | Created | Interactive Call Simulator & Operator Console. |
| [`victim.html`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/victim.html) | Frontend | Modified | Integrated Socket.IO, OTP verification modal, live session activation. |
| [`ambulance.html`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/ambulance.html) | Frontend | Modified | Integrated Socket.IO, incoming case listener, case query loader. |
| [`index.html`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/index.html) | Frontend | Modified | Added Dispatch Console navigation links and server intake registration. |
| [`js/shared-state.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/js/shared-state.js) | Frontend | Modified | Augmented `LifelineSync` to relay to Socket.IO backend. |
| [`tests/test_phase2.js`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/tests/test_phase2.js) | Testing | Created | Automated test suite (22/22 passing assertions). |
| [`SERVER_SETUP.md`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/SERVER_SETUP.md) | Docs | Created | Multi-device Wi-Fi setup and demo guide. |
| [`TELEPHONY_SETUP.md`](file:///c:/Users/mahip/Downloads/Smart%20ambulance%20traffic%20signal%20system/TELEPHONY_SETUP.md) | Docs | Created | Telecom provider architecture, TwiML, and carrier requirements. |

---

## 4. API & Real-Time Socket.IO Protocol

### REST Endpoints
- `POST /api/telephony/webhook`: Inbound call webhook (plays welcome announcement, DTMF prompt).
- `POST /api/telephony/consent`: Evaluates caller consent (1 = Record, 2 = Speech gather only).
- `POST /api/telephony/intake`: Processes audio/speech, extracts emergency fields, creates case.
- `POST /api/telephony/simulate`: Executes complete simulation pipeline in one call.
- `GET /api/cases`: Lists active emergency cases from SQLite.
- `GET /api/cases/:id`: Detailed case info.
- `POST /api/cases/:id/accept`: Driver accepts emergency case.
- `POST /api/cases/:id/start-journey`: Driver begins journey to scene (`en_route`).
- `POST /api/cases/:id/telemetry`: Publishes GPS telemetry (`lat`, `lng`, `speed`, `etaSeconds`, `distanceKm`).
- `POST /api/cases/:id/arrived`: Marks ambulance arrived at scene.
- `GET /api/tracking/invite/:token`: Resolves tracking invitation and checks expiration.
- `POST /api/tracking/verify-otp`: Validates 6-digit OTP, creates session token, returns authorized case.
- `GET /api/tracking/live/:sessionToken`: Retrieves live case telemetry for authenticated tracking session.
- `GET /api/audio/recordings/:id`: Streams recorded WAV file (enforces caller consent check).
- `GET /api/operator/status`: System status and local Wi-Fi IP address.
- `GET /api/operator/sms-inbox`: Displays recent simulated SMS messages and OTPs for testing.

### Socket.IO Events
- **Rooms:** `fleet_room` (ambulance drivers & operators), `case:<caseId>` (authorized victims & assigned ambulance).
- **Client → Server:**
  - `join_fleet`: Driver/operator joins global fleet updates.
  - `join_case { caseId, trackingToken, role }`: Joins specific emergency case room.
  - `ambulance_telemetry { caseId, lat, lng, speed, heading, etaSeconds, distanceKm, locationSource }`.
  - `start_journey { caseId }`.
  - `mark_arrived { caseId }`.
  - `extra_landmark { caseId, landmarks, description }`.
- **Server → Client:**
  - `EMERGENCY_CREATED`: Alert broadcast to all drivers when a new case is registered.
  - `POSITION`: High-frequency location update to victim map.
  - `JOURNEY_START`: Journey active signal corridor alert.
  - `ARRIVED_SCENE`: Arrival notification overlay.
  - `EXTRA_DESC`: Victim landmark update to driver HUD.
  - `STATUS_UPDATED`: General status transitions.

---

## 5. Security, Privacy & Consent Controls

1. **Strict Recording Consent Enforcement:**
   - Callers are explicitly informed of recording and analysis.
   - If caller refuses consent (DTMF 2), audio recording is completely bypassed; the system performs non-recorded speech intake.
   - Attempting to save a recording without consent throws an exception.
2. **Audio File Protection:**
   - Recordings are stored in `storage/recordings/` outside the web root. Direct HTTP access to `/storage` and `/data` is blocked by server middleware.
   - Streaming endpoint `/api/audio/recordings/:id` checks database consent flags before serving bytes.
3. **Cryptographic OTP Generation & Verification:**
   - 6-digit integers generated using `crypto.randomInt(100000, 1000000)`.
   - Never stored in plaintext in the database (HMAC-SHA256 with 16-byte random salt).
   - 5-minute expiration (`otp_expires_at`).
   - Rate limiting: locked after 5 failed attempts.
   - Single-use: immediately marked verified and blocked from reuse.
   - Timing-safe hash comparison (`crypto.timingSafeEqual`) prevents timing side-channel attacks.
4. **Authorized Tracking Sessions:**
   - Verification returns a 64-character hex session token (`crypto.randomBytes(32)`).
   - Socket.IO verifies session validity before admitting clients to victim rooms.

---

## 6. Automated Test Results

The test suite was run and validated:

```
======================================================
   TEAM LIFELINE V2 — PHASE 2 TEST SUITE
======================================================
Test Group 1: Telephony Call Intake & Consent Handling (4/4)  -> PASS
Test Group 2: Audio Recording & Consent Security (3/3)        -> PASS
Test Group 3: Speech Transcription & Extraction (3/3)        -> PASS
Test Group 4: Emergency Case Persistence in SQLite (3/3)      -> PASS
Test Group 5: Cryptographic OTP & Session Security (4/4)      -> PASS
Test Group 6: SMS Provider Formatting & Simulation (2/2)      -> PASS
Test Group 7: Full Telephony Simulator Pipeline (1/1)         -> PASS
Test Group 8: File Integrity & System Defaults (2/2)          -> PASS

======================================================
TEST RESULTS: Total: 22 | Passed: 22 | Failed: 0
======================================================
```

Regression suite for Phase 1:
```
======================================================
TEST RESULTS: Total: 44 | Passed: 44 | Failed: 0
======================================================
```

**Overall Test Count: 66 Passed | 0 Failed (100% Pass Rate).**

---

## 7. Known Limitations & Real Provider Status

1. **Carrier Telecom Access:**
   - Live cellular phone call answering and SMS delivery require paid Twilio (or regional telecom) credentials and Indian DLT regulatory registration.
   - In accordance with prompt instructions, the system defaults to **Simulation Mode**, which runs locally with 100% functionality and zero costs. The real provider adapters (`TwilioTelephonyProvider`, `TwilioSmsProvider`) are implemented and ready to activate as soon as API keys are provided.
2. **Physical Traffic Signals:**
   - Traffic signal lights and emergency corridor preemption remain simulated in software; physical hardware integration is scheduled for later phases.
3. **Browser GPS vs. Route Simulation:**
   - The Driver HUD supports both real browser GPS (`navigator.geolocation`) and simulated OSRM route interpolation. Every simulated position is explicitly labelled with `locationSource: 'simulated'`.

---

## 8. Readiness for Next Phase

The software is complete, tested, and fully demonstratable with one laptop representing the ambulance and one phone representing the victim. Phase 2 acceptance criteria are 100% met.
