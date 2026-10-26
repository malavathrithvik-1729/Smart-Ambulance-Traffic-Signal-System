# TEAM LIFELINE V2 — IMPLEMENTATION PLAN & ROADMAP
**Project**: Smart Ambulance Traffic Signal System (V2)  
**Authors**: Team Lifeline (SPR High School, Kamareddy)  
**Maintained by**: Antigravity Assistant  
**Status**: Active  

---

## 🗺️ Roadmap & Phase Overview

| Phase | Title | Focus Area | Status |
| :---: | :--- | :--- | :---: |
| **0** | **Project Audit & Stabilization** | Codebase inspection, baseline testing, structural bug fixes, audit document | **COMPLETED** |
| **1** | **Frontend Architecture Unification & State Cohesion** | Unify duplicate victim/patient views, centralize chatbot, normalize navigation & storage | **COMPLETED** |
| **2** | **Backend Infrastructure & Multi-Device Real-Time Sync** | Local Node.js server, WebSockets, real multi-device testing over Wi-Fi, database persistence | **NEXT UP** |
| **3** | **Portals & Role-Based Emergency Workflows** | Dedicated Hospital Coordinator portal, Dispatcher console, refined Driver HUD | Planned |
| **4** | **Communication & Real Telephony Integration** | WebRTC in-browser audio calls, SMS emergency gateway, AI phone call centre integration | Planned |
| **5** | **Hardening, Offline Capabilities & Exhibition Readiness** | PWA offline maps, automated demo playback presets, final exhibition hardening | Planned |

---

## 📋 Phase 0: Project Audit and Stabilization

### Objectives
- Perform an end-to-end inspection of all HTML, CSS, JavaScript, PDF assets, and documentation.
- Identify what works, what is broken, what is simulated, and what external integrations are needed.
- Fix foundational bugs preventing the site from functioning reliably.
- Document system architecture and establish this implementation plan.

### Acceptance Criteria
- [x] All 6 HTML pages (`index.html`, `ambulance.html`, `victim.html`, `emergency.html`, `patient.html`, `project-details.html`) served with HTTP 200 OK.
- [x] Zero JavaScript syntax or runtime initialization errors in browser console or node runner.
- [x] All document hyperlinks and PDF references verified with no 404 or broken paths.
- [x] HTML DOM nesting validated (all tags balanced; no unclosed layout containers).
- [x] Emergency case state consistently passed from landing page to victim, driver, and split simulation views.
- [x] Complete `PROJECT_AUDIT.md` and `V2_IMPLEMENTATION_PLAN.md` generated and reviewed.

### Completed Work in Phase 0
1. **Restored Missing Resource**:
   - Recovered `evidences.pdf` from git repository HEAD, resolving a broken link in `project-details.html`.
2. **Fixed Structural DOM Bug in `ambulance.html`**:
   - Closed dangling `map-hud` container `<div>` before `#amb-map`, restoring proper layout nesting and map click responsiveness.
3. **Synchronized Case Intake State**:
   - Updated `index.html` `enterEmergency()` to store case data in both `localStorage` and `sessionStorage`.
   - Updated `emergency.html` to gracefully fall back to `localStorage.getItem('lifeline_em_case')` when direct session values are absent.
4. **Comprehensive Automated Verification**:
   - Verified JavaScript syntax across all standalone scripts and embedded HTML `<script>` blocks.
   - Built and ran an HTTP server route tester verifying that all 14 routes and PDF assets return HTTP 200 OK.
   - Validated balanced `<div>` counts across all HTML pages.
5. **Architectural & Simulation Documentation**:
   - Generated `PROJECT_AUDIT.md` detailing every subsystem and distinguishing actual functionality from browser-side simulations.

### Outstanding Work
- None remaining for Phase 0. Phase 0 goals are fully achieved.

### Known Limitations
- Ambulance GPS movement remains a client-side simulation (linear interpolation along OSRM route).
- Traffic signal locations and switching are simulated in browser memory.
- Inter-page communication is currently browser-bound via `BroadcastChannel` and cannot sync across separate mobile devices without a backend server (scheduled for Phase 2).
- Audio calls are simulated with browser `speechSynthesis` and `setTimeout`.

---

## 🚀 Phase 1: Frontend Architecture Unification & State Cohesion

### Objectives
Consolidate disjointed pages and script modules so the entire frontend operates as a unified, coherent web application before introducing a server backend.

### Acceptance Criteria
- [x] One canonical patient tracking implementation is established (`victim.html`).
- [x] `patient.html` remains compatible with existing links via graceful automated and manual redirect to `victim.html` preserving query strings.
- [x] First-aid knowledge is centralized in one source of truth (`js/chatbot.js`) with clinical trauma categories and conservative medical disclaimers (108/112).
- [x] Active portals use a consistent emergency case schema with safe fallbacks and validation (`js/shared-state.js`).
- [x] Active portals use the canonical `lifeline_em` communication channel with `localStorage` fallback and message deduplication.
- [x] Event payloads are validated and handled safely without race conditions or infinite message feedback loops.
- [x] Navigation headers and drawer menus are consistent, responsive, and provide active Case ID indicators.
- [x] Obsolete scratch files are archived safely after dependency verification (`archive/phase-1/`).
- [x] Existing project features, maps, visual identities, and documentation remain intact.
- [x] Automated test suite passes 100% of checks (`tests/test_phase1.js` — 44/44 passed).
- [x] Complete `PHASE_1_COMPLETION_REPORT.md` generated and reviewed.

### Completed Work in Phase 1
1. **Task A — Unified Patient & Victim Portals**:
   - Made `victim.html` the canonical patient tracking interface, retaining its live Leaflet map, ambulance tracking HUD, ETA countdown, landmark update system, and integrated first-aid drawer.
   - Converted `patient.html` into a backwards-compatible transitional redirect page (`<meta http-equiv="refresh">` + 2-second countdown + `window.location.replace` preserving URL query parameters such as `?case=EM-...`).
2. **Task B — Centralized First-Aid Knowledge**:
   - Overhauled `js/chatbot.js` as the single source of truth for first-aid emergency advice.
   - Defined 7 clinical emergency trauma categories: `bleeding`, `unconscious`, `cpr`, `fracture`, `car_crash`, `burns`, `choking`.
   - Embedded conservative safety disclaimers emphasizing that chatbot advice is strictly immediate bystander support and never a substitute for calling 108 / 112 or professional medical care.
   - Exported reusable `FirstAidChatbot` controller class and `findFirstAidTopic()` query matcher for both modular (ESM) and standard browser environments.
3. **Task C — Standardized Emergency Case State**:
   - Overhauled `js/shared-state.js` with `DEFAULT_EMERGENCY_CASE` schema containing 18 validated fields: `caseId`, `status`, `createdAt`, `callerContact`, `callerName`, `incidentType`, `incidentDescription`, `severity`, `incidentLocation`, `latitude`, `longitude`, `landmarks`, `victimCount`, `assignedAmbulanceId`, `ambulanceLocation`, `etaSeconds`, `lastUpdatedAt`, and `metadata`.
   - Implemented `EmergencyStateManager` with schema validation, normalization, and error handling for corrupt storage payloads.
4. **Task D — Standardized Browser Communication**:
   - Implemented `LifelineSync` on canonical channel `'lifeline_em'` with `localStorage` fallback event sync (`'lifeline_em_msg'`).
   - Added unique instance IDs (`originId`) and message UUIDs (`msgId`) to eliminate cross-tab echo loops.
   - Wrapped `EmergencySync` in `js/real-roads.js` to delegate seamlessly to `LifelineSync`.
5. **Task E — Unified Navigation & Responsiveness**:
   - Aligned top navbars and side drawers across `index.html`, `ambulance.html`, `victim.html`, and `emergency.html`.
   - Added real-time Active Case ID pill badges (`#nav-case-badge`) linking directly across all portals.
   - Maintained full responsive CSS across desktop and mobile screens.
6. **Task F — Safe Code Archival**:
   - Verified that root temporary files `_tmp.js` and `_tmp_check.js` were unreferenced in all production HTML/CSS/JS files and archived them into `archive/phase-1/`.
7. **Task G & Verification**:
   - Created test suite `tests/test_phase1.js` covering 44 automated assertions (state schema, first-aid matcher, canonical channel, redirect mechanics, DOM balance, HTTP 200 checks).
   - Generated `PHASE_1_COMPLETION_REPORT.md`.

### Outstanding Work
- Browser-only boundary: `BroadcastChannel` and `localStorage` only sync within the same browser instance on the same device. Multi-device sync over local Wi-Fi / cellular network is slated for Phase 2.

### Known Limitations
- Ambulance route animation is still simulated in-memory using client-side Leaflet timers until real GPS telemetry streaming is introduced in Phase 2.
- Telephone audio calls are simulated with browser text-to-speech.

---

## 🌐 Phase 2: Backend Infrastructure & Multi-Device Real-Time Sync

### Objectives
Enable real cross-device testing so that an ambulance driver on an Android/iOS phone or tablet communicates with a victim on a laptop or second phone over local Wi-Fi or internet.

### Key Tasks
1. Implement a lightweight Node.js (Express + Socket.io / WebSockets) server.
2. Establish WebSocket rooms per emergency case (`EM-xxxx`).
3. Stream live GPS telemetry from driver device to victim device.
4. Persist emergency incidents, hospital bed status, and driver activity in an embedded database (e.g., SQLite / lowdb).

### Acceptance Criteria
- Emergency reported on Device A appears in real time on Device B without sharing the same browser memory.
- Driver movement on Device B updates map on Device A over local network.

---

## 🏥 Phase 3: Portals & Role-Based Emergency Workflows

### Objectives
Complete the full healthcare emergency lifecycle by adding a dedicated Hospital Receiving Desk portal and Dispatcher console.

### Key Tasks
1. **Hospital Receiving Desk Portal (`hospital.html`)**:
   - Displays incoming ambulances, patient triage summary, estimated arrival countdown.
   - Interactive ICU bed reservation and trauma OT ready toggle.
2. **Dispatcher Console**:
   - Real-time district map showing active incidents and ambulance fleet status.
3. **Enhanced Driver HUD**:
   - High-contrast night mode HUD with turn-by-turn distance notices.

---

## 📞 Phase 4: Communication & Telephony Integration

### Objectives
Add voice and messaging capabilities between victim, driver, and emergency operators.

### Key Tasks
1. In-browser WebRTC voice calling between victim and ambulance driver.
2. Automated First-Aid SMS dispatch simulation or integration via local SMS gateway / Twilio.
3. Preparation for AI telephone call centre integration (speech-to-text intake, triage summarization).

---

## 🛡️ Phase 5: Production Polish, Security & Exhibition Readiness

### Objectives
Ensure enterprise-grade reliability, responsive usability on all form factors, and offline resilience during live exhibitions.

### Key Tasks
1. Service Worker & PWA manifest for offline map caching.
2. Exhibition kiosk mode with one-click automated scenario demonstration.
3. Input sanitization and error boundaries.
