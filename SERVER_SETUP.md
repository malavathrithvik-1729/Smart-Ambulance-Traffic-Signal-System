# Team Lifeline V2 — Server Setup & Local Wi-Fi Demonstration Guide

**Project:** Smart Ambulance Traffic Signal System  
**Team:** Team Lifeline — SPR High School, Kamareddy, Telangana, India  
**Architecture:** Node.js, Express, Socket.IO, SQLite (`node:sqlite`)  

---

## 1. Prerequisites

- **Node.js**: v20+ or v24+ (Node.js v24.13.0 is verified with built-in `node:sqlite`).
- **NPM**: v10+ (included with Node.js).
- **Network**: A local Wi-Fi router or mobile phone personal hotspot. Both the Laptop and Phone must be connected to this same network.

---

## 2. Installation & Quick Start

1. Open a terminal in the project directory:
   ```bash
   cd "C:\Users\mahip\Downloads\Smart ambulance traffic signal system"
   ```

2. Copy environment configuration:
   ```bash
   copy .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```
   Or run with automatic reload during development:
   ```bash
   npm run dev
   ```

---

## 3. Server URLs & Roles

When started, the server outputs the exact network addresses:

| Device / Role | Recommended Browser URL | Purpose |
| :--- | :--- | :--- |
| **Ambulance Laptop** | `http://localhost:3000/ambulance.html` | Driver navigation HUD, route selection, live GPS telemetry broadcast |
| **Operator Console** | `http://localhost:3000/operator.html` | Telephone call simulator, SMS & OTP inspector, active cases monitor |
| **Victim Smartphone** | `http://<LAPTOP_LOCAL_IP>:3000/victim.html` | Mobile victim portal, OTP verification, live ambulance tracking map |
| **Landing Page** | `http://localhost:3000/` | Main public landing page with emergency intake form |
| **Exhibition Split** | `http://localhost:3000/emergency.html` | Combined side-by-side demonstration on a single large monitor |

> **Note:** The server automatically detects your laptop's local LAN IP (e.g., `192.168.31.25`) and displays it in the terminal and in the Operator Console.

---

## 4. Multi-Device Wi-Fi Testing (One Laptop + One Phone)

To demonstrate real cross-device synchronization without sharing browser storage:

### Step 1: Connect to the Same Wi-Fi
- Connect your **Laptop** and your **Smartphone** to the same Wi-Fi network (or connect your laptop to your smartphone's hotspot).

### Step 2: Open Ambulance Dashboard on Laptop
- On the laptop, open:
  `http://localhost:3000/ambulance.html`

### Step 3: Open Operator Console & Simulate Call
- On the laptop, open in another tab:
  `http://localhost:3000/operator.html`
- Under **Emergency Phone Call Simulator**, choose an emergency scenario (e.g. *NH44 Highway Collision near Clock Tower*).
- Click **"Dispatch Simulated Emergency Call"**.
- The pipeline will execute:
  1. Creates Call Session in SQLite.
  2. Stores audio recording (if consent granted).
  3. Transcribes speech and extracts structured emergency details (coordinates, landmarks, victims).
  4. Creates Emergency Case in SQLite (`EM-20261026-XXXX`).
  5. Generates a secure tracking invitation and 6-digit OTP.
  6. Dispatches simulated SMS containing the tracking URL and OTP code.

### Step 4: Open Tracking Link on Phone
- Look at the **SMS Dispatch & OTP Inspector** on the Operator Console.
- Open the tracking link on your phone (e.g. `http://192.168.31.25:3000/victim.html?invite=<token>`).
- The phone will display the **Emergency Tracking Access** prompt.
- Enter the 6-digit OTP code shown in the console (e.g., `862850`) and tap **"Verify OTP & Start Live Tracking"**.

### Step 5: Start Journey & Watch Live Telemetry
- On the laptop's Ambulance HUD, click **"Route 1 — NH-44 Highway"** and click **"Go — Start Journey"**.
- Watch the phone screen:
  - The ambulance marker moves live across the map.
  - The status pill turns green: **"Ambulance En Route"**.
  - Remaining distance and ETA count down in real time.
- When the ambulance reaches the scene, the phone receives `ARRIVED_SCENE` and displays the **"Ambulance Has Arrived!"** alert banner.

---

## 5. Storage & Database Layout

Data is stored persistently in SQLite:
- **Database file:** `data/lifeline.sqlite`
- **Audio recordings:** `storage/recordings/` (protected outside public web directory)
- **Tables:**
  - `call_sessions`: Call history, caller callback contact, recording consent status.
  - `recordings`: Audio metadata, duration, consent flag.
  - `transcripts`: Speech-to-text transcripts, language, extraction logs.
  - `emergency_cases`: Full 18-field emergency records, coordinates, dispatch status.
  - `tracking_invitations`: High-entropy tracking tokens, salted OTP hashes, attempt counters.
  - `tracking_sessions`: Verified tracking sessions with expiration timestamps.

---

## 6. Running Automated Tests

Run the full automated test suite:
```bash
node tests/test_phase2.js
```
Expected output:
```
TEST RESULTS: Total: 22 | Passed: 22 | Failed: 0
```

Run Phase 1 regression verification:
```bash
node tests/test_phase1.js
```
Expected output:
```
TEST RESULTS: Total: 44 | Passed: 44 | Failed: 0
```

---

## 7. Troubleshooting

* **Phone cannot reach the laptop IP:**
  - Verify both devices are on the same Wi-Fi.
  - On Windows, verify that Windows Firewall allows Node.js to receive incoming private network connections on port 3000.
* **OTP expired or invalid:**
  - OTPs expire after 5 minutes (300 seconds). Generate a fresh case in the Operator Console.
* **Audio files missing:**
  - Recordings are only created when caller consent is granted. If caller refuses consent, recording is safely bypassed.
