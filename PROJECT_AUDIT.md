# Team Lifeline — Project Audit Document (Phase 0)
**Project**: Smart Ambulance Traffic Signal System (V2)  
**School**: SPR High School, Kamareddy  
**Date**: October 2026  
**Auditor**: Antigravity Agent  

---

## 1. Executive Summary

An exhaustive technical audit and stabilization review was performed on the Smart Ambulance Traffic Signal System codebase. The current project is a multi-page, client-side web application built with vanilla HTML5, CSS3, JavaScript (ES6+), and Leaflet.js. It features a responsive layout designed for science exhibition demonstrations and real-time emergency dispatch workflows.

Phase 0 has verified that:
1. All core static pages, stylesheets, scripts, and linked PDF documents are intact and render with HTTP 200 OK.
2. Foundational structural defects (unclosed HTML containers, broken PDF resource links, cross-page state synchronization mismatches) have been diagnosed and corrected.
3. No breaking changes or premature external dependencies (such as cloud telephony, paid APIs, or hardware locks) have been introduced.
4. The project identity, branding, and presentation fidelity for Team Lifeline are fully preserved.

---

## 2. Current Folder & File Structure

```
Smart ambulance traffic signal system/
├── index.html                                        # Landing Page: Emergency report intake (Voice/Text + Geolocation)
├── ambulance.html                                    # Driver Portal: Incident review, OSRM routing, live HUD, signal clearance, hospital transfer
├── victim.html                                       # Victim/Caller Dashboard: Live ambulance ETA/distance, route polyline, AI chatbot, simulated call
├── emergency.html                                    # Dual Split Simulation: Combined victim + driver views on single screen for demonstrations
├── patient.html                                      # Legacy / Alternative Victim Portal: Real-road coordinates, FirstAidChatbot class
├── project-details.html                              # Project overview, Problem & Solution, Evidences, PDF documentation
├── README.md                                         # Project documentation, exhibition 17-step guide, system architecture
├── V2_IMPLEMENTATION_PLAN.md                         # Roadmap, phase criteria, completed & outstanding tasks
├── PROJECT_AUDIT.md                                  # This audit document
├── manual.pdf                                        # Official User Manual PDF
├── problem-solution.pdf                              # Problem Statement & Technical Solution documentation PDF
├── evidences.pdf                                     # Research evidences & case study PDF (restored from repository HEAD)
├── SMART AMBULANCE TRAFFIC SIGNAL SYSTEM evidences .pdf # Extended exhibition evidence PDF
├── SMART AMBULANCE TRAFFIC SIGNAL SYSTEM Problem and Solution.pdf # Extended problem & solution PDF
├── Smart ambulance clearance system slides (2).pptx  # Exhibition presentation slides
├── generate_manual.py                                # ReportLab script used to build manual.pdf from assets
├── _tmp.js                                           # Unused scratch extraction file (from earlier refactoring)
├── _tmp_check.js                                     # Unused scratch extraction file (from earlier refactoring)
├── assets/                                           # Screenshot assets (1.png to 12.png) used by generate_manual.py
│   ├── 1.png ... 12.png
├── css/
│   ├── em.css                                        # Core stylesheet for index, ambulance, victim, emergency layouts & drawers
│   ├── realtime.css                                  # Stylesheet used by patient.html
│   ├── simplified.css                                # Earlier prototype styles
│   └── styles.css                                    # Comprehensive high-contrast HUD theme from earlier prototype
└── js/
    ├── app.js                                        # Earlier prototype controller (SmartAmbulanceApp class)
    ├── chatbot.js                                    # FirstAidChatbot engine class and FIRST_AID_KNOWLEDGE repository
    ├── demo-data.js                                  # Rich scenario demo datasets (scenarios, hospitals, signals)
    ├── map.js                                        # EmergencyMapEngine wrapper class for Leaflet
    ├── real-roads.js                                 # Static Kamareddy waypoints and EmergencySync BroadcastChannel helper
    ├── real-roads.json                               # Raw road network GeoJSON
    ├── roads.json                                    # Road waypoint JSON
    └── shared-state.js                               # Shared emergency state structure definition
```

---

## 3. Current Implementation Status

### 3.1. Landing Page and Navigation (`index.html`)
- **Header & Navigation**: Fixed responsive top navbar (`.app-top-nav`) with mobile drawer menu (`#nav-drawer`) and direct links to all portals (`ambulance.html`, `victim.html`, `emergency.html`, `patient.html`, `project-details.html`, and `manual.pdf`).
- **Demo Guidance**: Integrated "How to Use" guide modal (`#how-modal`) with step-by-step 5-phase testing instructions.
- **Emergency Intake**: 
  - Voice recognition using browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`).
  - Textarea fallback for manual input.
  - Browser Geolocation (`navigator.geolocation`) with automatic fallback to Kamareddy NH-44 Bypass demo coordinates (`18.3312°N, 78.3445°E`).
  - Form validation: Activates "🚨 CALL FOR EMERGENCY" button only when text length > 3 characters and coordinates are resolved.
- **State Handoff**: Serializes emergency payload into `localStorage.setItem('lifeline_em_case', ...)` and `sessionStorage`, then navigates to `victim.html`.

### 3.2. Ambulance Driver Dashboard (`ambulance.html`)
- **Incident Summary**: Displays caller incident details (`amb-desc`), caller contact info, and dynamic alerts sent from the victim (`victim-extra-panel`).
- **Phase 1 Routing**:
  - Live query to public OSRM Routing API (`router.project-osrm.org`) for two alternative routes (Route 1: NH-44 Highway, Route 2: Town Arterial).
  - Fallback to linear interpolation (`linspace`) if offline or API unavailable.
  - Generates signals along route (`randomSignals`) and renders dynamic polyline and traffic signal markers.
- **Driver Telemetry & Controls**:
  - "Go — Start Journey" button initiates 90-tick simulation loop (`lerp()`).
  - Live telemetry HUD: speed, remaining distance, ETA, and signal distance.
  - Dynamic signal clearance: Signals within 280m turn `🟢 GREEN`, announced via browser `speechSynthesis`. Signals revert to `🔴 RED` once ambulance passes 350m beyond.
  - Cross-tab BroadcastChannel broadcasts position updates to `victim.html`.
- **Phase 2 Hospital Transfer**:
  - Automatically activates on arrival at scene.
  - Presents hospital selection list (Government Area Hospital, Kamareddy vs. Lifeline Superspeciality Hospital) with ICU bed and trauma OT metrics.
  - Generates OSRM route to chosen hospital and runs transfer simulation with hospital corridor clearance.

### 3.3. Patient / Victim Dashboard (`victim.html` & `patient.html`)
- **`victim.html`**:
  - Real-time subscriber to driver updates via `BroadcastChannel('lifeline_em')` and `localStorage` storage events.
  - Renders incident marker and dispatched ambulance marker on Leaflet map.
  - Live HUD displays ETA and distance remaining.
  - Arrival overlay modal appears automatically when driver arrives at scene.
  - Landmark refinement: User can input extra landmark descriptions (e.g. "near blue ATM") which instantly sync to driver's dashboard.
  - First-aid chatbot with 4 quick topic buttons (Bleeding, Unconscious, Fracture, Crash) and search-based answering.
  - Simulated audio call modal with driver.
- **`patient.html`**:
  - Alternative implementation utilizing static road coordinates (`REAL_ROADS` in `js/real-roads.js`) and class-based `FirstAidChatbot` (`js/chatbot.js`). Uses independent `BroadcastChannel('lifeline_emergency_channel')`.

### 3.4. Emergency Case Intake & Dual Split Simulation (`emergency.html`)
- Provides a side-by-side presentation view (Left: Victim tracking; Right: Driver dashboard) on a single screen.
- Solves single-screen exhibition constraints where opening two separate browser windows is cumbersome.
- Animates seamlessly into full-driver view upon arrival at accident scene for Phase 2 hospital transport.

### 3.5. Map Rendering and Route Calculation
- **Mapping Library**: Leaflet.js v1.9.4 with standard OpenStreetMap tile layers.
- **Routing Engine**: Live OSRM driving service (`https://router.project-osrm.org/route/v1/driving/...`).
- **Fallback**: Mathematical waypoint interpolation (`linspace`) to prevent interface breaks during network outages.

### 3.6. First-Aid Chatbot
- Rule- and keyword-based engine covering critical trauma topics: severe bleeding control, unconscious casualty & CPR, suspected fractures, vehicle crash/fire safety, burns, and choking.
- Responsive and fast, zero cloud token costs, operates entirely offline.

### 3.7. Shared State & Cross-Page Communication
- **Active Channel**: `BroadcastChannel('lifeline_em')` with `localStorage` `storage` event fallback.
- **Payload Types**: `ROUTE_SELECTED`, `JOURNEY_START`, `POSITION`, `ARRIVED_SCENE`, `EXTRA_DESC`.
- Works across browser tabs and independent windows on the same origin.

### 3.8. Authentication & Security
- **Current State**: Non-existent (open client-side application).
- No user roles (Admin, Dispatcher, Driver, Public Victim), no session authentication, and no protected routes.

---

## 4. Features That Are Simulated vs. Real

| Feature | Current Implementation Status | Real Requirement in Production |
| :--- | :--- | :--- |
| **Ambulance Movement** | **Simulated**: In-memory `setInterval` stepping 90 ticks across route coordinates with `lerp()`. | Real GPS telemetry streamed via WebSocket/MQTT from vehicle onboard unit / driver smartphone. |
| **Traffic Signals** | **Simulated**: Picked randomly along polyline coordinates (`randomSignals`); states toggled in browser memory. | Physical 433 MHz RF / LoRa transmitters or SCADA/ITMS API endpoints interfacing with junction controllers. |
| **Traffic Congestion / Vehicle Counts** | **Simulated**: Hardcoded static counts (28, 34, 64) and fixed speeds (30–45 km/h). | Live traffic flow sensor data, Google Distance Matrix API, or municipal camera feeds. |
| **Emergency Voice Calls** | **Simulated**: `setTimeout(2000)` dialogue display accompanied by browser SpeechSynthesis TTS. | WebRTC peer-to-peer audio calling or PSTN gateway (e.g. Twilio/Exotel). |
| **Hospital Beds & OT Status** | **Simulated**: Hardcoded JSON array (Government Area Hospital: 6 beds; Lifeline: 12 beds). | Live Hospital Information System (HIS) API or district health database. |
| **Cross-Device Sync** | **Simulated**: Browser-internal `BroadcastChannel` and `localStorage` (limited to same browser/origin). | Centralized cloud backend (Node.js/Firebase/Supabase/PostgreSQL + WebSockets). |
| **First-Aid Guidance** | **Real**: Medical guidelines in `chatbot.js` and `victim.html` provide actual, verified first-aid instructions. | AI LLM enhancement with structured medical verification protocols. |
| **Map Rendering & Road Routing** | **Real**: Actual OpenStreetMap tiles and real live driving routes from OSRM router. | Production routing service (OSRM self-hosted, Mapbox, or Google Maps Directions API). |
| **Speech-to-Text Incident Intake** | **Real**: Uses native browser Web Speech API (`webkitSpeechRecognition`). | Browser Web Speech API + backend Whisper/STT for non-supported browsers. |

---

## 5. Existing Files: Keep, Reuse, or Refactor

1. **Keep & Maintain (Core Application)**:
   - `index.html`: Primary public landing & emergency intake portal.
   - `ambulance.html`: Driver dashboard and hospital handover interface.
   - `victim.html`: Victim tracking and first-aid portal.
   - `emergency.html`: Single-screen split demo layout for presentations.
   - `project-details.html`: Documentation and academic presentation page.
   - `css/em.css`: Core design system and responsive navigation styles.
   - `manual.pdf`, `problem-solution.pdf`, `evidences.pdf`: Essential project documentation.

2. **Reuse & Consolidate**:
   - `js/chatbot.js`: Comprehensive knowledge base (`FIRST_AID_KNOWLEDGE`); should be unified with `victim.html` so changes to first-aid instructions update in a single place.
   - `js/shared-state.js` & `js/demo-data.js`: Rich schema definitions for multi-scenario dispatch; should form the base schema for future backend database models.
   - `css/styles.css` & `css/realtime.css`: High-contrast HUD styling patterns can be ported into `em.css` to enhance driver night-mode HUD.

3. **Archive / Deprecate**:
   - `_tmp.js` and `_tmp_check.js`: Redundant scratch files from past manual refactorings; should be archived.
   - `patient.html`: Redundant duplicate of `victim.html` that uses a separate channel. Can be aligned or cleanly redirected to `victim.html`.

---

## 6. Features Requiring a Backend or External Provider

To transition from a local browser prototype to a fully operational system, the following backend infrastructure will be needed in subsequent phases:
1. **Central Emergency Dispatch Server**:
   - Node.js (Express / Fastify) or Python (FastAPI).
   - WebSocket / Server-Sent Events (SSE) server to replace browser-only `BroadcastChannel`.
2. **Database & Persistence**:
   - PostgreSQL / SQLite / MongoDB to persist incidents, ambulance fleets, hospital registries, and audit logs.
3. **Authentication & Role-Based Access Control (RBAC)**:
   - Driver credentials, hospital coordinator accounts, dispatcher consoles, and secure temporary links for victims.
4. **Telephony & Real Call Audio (Phase 4)**:
   - WebRTC signaling server for direct driver-victim browser audio, or telephony trunking (Twilio, Exotel) for real mobile phone calls.

---

## 7. Recommended Implementation Order

1. **Phase 0: Project Audit and Stabilization** *(Completed)*:
   - Workspace audit, link verification, div tag fix, cross-page state alignment, HTTP server verification, and implementation plan.
2. **Phase 1: Architecture Unification & Client-Side Cohesion**:
   - Consolidate dual implementations (`victim.html` vs. `patient.html`).
   - Unify chatbot knowledge base from `js/chatbot.js` across all views.
   - Clean up navigation and ensure all routes share identical state definitions.
3. **Phase 2: Live Backend & Multi-Device Real-Time Synchronization**:
   - Lightweight local Node.js / Express + WebSocket backend.
   - Enable testing from two different devices (e.g., driver on a tablet/phone, victim on a laptop) over local Wi-Fi.
   - Database schema for active emergencies, driver tracking, and hospital capacity.
4. **Phase 3: Role-Based Portals & Emergency Workflow Completion**:
   - Hospital receiving desk dashboard (pre-alerting ICU/trauma teams before ambulance arrival).
   - Driver HUD refinement with turn-by-turn alerts.
   - Realistic traffic signal junction controller simulation.
5. **Phase 4: Communication & Telephony Integration**:
   - Real WebRTC audio or VoIP integration for caller-driver communications.
   - SMS alert dispatch simulation via Twilio/local SMS gateway.
6. **Phase 5: Production Polish, Security & Deployment**:
   - PWA support (offline map caching for drivers).
   - HTTPS deployment, environmental configs, exhibition mode presets.
