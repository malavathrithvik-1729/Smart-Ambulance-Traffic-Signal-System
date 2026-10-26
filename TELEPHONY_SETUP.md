# Team Lifeline V2 — Telephony & Telecommunication Integration Guide

**Project:** Smart Ambulance Traffic Signal System  
**Organization:** SPR High School, Kamareddy, Telangana  
**Telephony Architecture:** Modular Webhook Adapter (Twilio / Compatible Carrier Gateway)  

---

## 1. Overview & Architecture

The Team Lifeline emergency voice intake pipeline converts an incoming telephone call into an authenticated emergency dispatch record:

```
[Caller Phone] ──(PSTN Call)──> [Twilio / Telecom Gateway]
                                          │
                               (HTTP POST Webhook)
                                          ▼
                               [Team Lifeline Server]
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
             Consent Refused                             Consent Granted
         (Speech Gather / Text)                        (Audio Recorded)
                    │                                           │
                    └─────────────────────┬─────────────────────┘
                                          ▼
                             [Transcription Engine]
                                          ▼
                             [AI Extraction Service]
                                          ▼
                             [Emergency Case in SQLite]
                                          ▼
                             [Cryptographic OTP Service]
                                          │
                            (SMS Carrier or Simulator)
                                          ▼
                             [Victim Phone Tracking Link]
```

---

## 2. Telephony Provider Configuration (Twilio Example)

To connect a live cellular telephone number to the system:

1. Obtain a Twilio Voice-capable phone number (or regional carrier SIP trunk).
2. Set environment variables in `.env`:
   ```env
   TELEPHONY_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+91XXXXXXXXXX
   TWILIO_WEBHOOK_URL=https://your-public-domain.com/api/telephony/webhook
   ```
3. Configure the webhook in Twilio Console under Phone Numbers → Active Numbers → Voice & Fax:
   - **A CALL COMES IN:** Webhook
   - **URL:** `https://your-public-domain.com/api/telephony/webhook`
   - **HTTP METHOD:** `POST`

---

## 3. Webhook Endpoints & TwiML Flow

### 3.1 Initial Call Webhook (`POST /api/telephony/webhook`)
- Answers the call and plays the welcome announcement:
  *"Welcome to Team Lifeline Emergency Ambulance Service, Kamareddy."*
- Explains recording and data analysis:
  *"For emergency dispatch safety, this call may be recorded and analysed. Press 1 to consent to recording, or press 2 to proceed without recording."*
- Emits `<Gather numDigits="1" action="/api/telephony/consent">`.

### 3.2 Consent Handler (`POST /api/telephony/consent`)
- **If Digit `1` (Consent Granted):**
  - Updates `call_sessions.consent_status = 'granted'`.
  - Initiates `<Record action="/api/telephony/intake" maxLength="60" playBeep="true">`.
- **If Digit `2` (Consent Refused):**
  - Updates `call_sessions.consent_status = 'refused'`.
  - Initiates non-recorded speech gather `<Gather input="speech" action="/api/telephony/intake">`.

### 3.3 Intake & Dispatch Handler (`POST /api/telephony/intake`)
- Saves audio (if consent granted and URL provided).
- Transcribes speech via `TranscriptionService`.
- Extracts structured dispatch fields via `EmergencyExtractionService`.
- Generates case, OTP, and tracking invitation.
- Sends SMS to the caller's callback number.
- Emits Socket.IO `EMERGENCY_CREATED` alert to connected driver laptops.

---

## 4. SMS Provider Integration

### Canonical SMS Message Template
Every SMS dispatched strictly follows this concise, safety-first format:
> *“Team Lifeline demo: Your emergency request has been registered. Open [secure tracking link] and enter OTP [code] to view the ambulance status. If this is a real emergency, continue contacting official emergency services as appropriate.”*

### Real Twilio SMS Integration
Set in `.env`:
```env
SMS_PROVIDER=twilio
```
When configured, the backend issues an HTTPS request to `https://api.twilio.com/2010-04-01/Accounts/{SID}/Messages.json` using Node.js native fetch.

---

## 5. Offline & Testing Status

| Capability | In Simulation Mode (Default) | With Real Provider Configured | Tested with Live Provider? |
| :--- | :--- | :--- | :---: |
| **Incoming Call Simulation** | Yes (`/api/telephony/simulate` & Operator UI) | Yes (Twilio PSTN Webhook) | Awaiting Provider Credentials |
| **Consent Enforcement** | Yes (Strictly verified) | Yes (DTMF 1 vs 2) | Verified via Mock Webhooks |
| **Audio Storage** | Yes (Secure `storage/recordings/`) | Yes (Secure `storage/recordings/`) | Verified |
| **Speech Transcription** | Yes (Local fallback / synthetic engine) | External Whisper / Cloud STT | Verified (Local Engine) |
| **Emergency Extraction** | Yes (Deterministic rule-based matcher) | Yes (Deterministic rule-based matcher) | Verified |
| **Case Storage (SQLite)** | Yes (`data/lifeline.sqlite`) | Yes (`data/lifeline.sqlite`) | Verified |
| **OTP Generation & Hashing**| Yes (Crypto HMAC-SHA256, 5 min TTL) | Yes (Crypto HMAC-SHA256, 5 min TTL) | Verified |
| **SMS Delivery** | Yes (Simulated inbox in Operator Console) | Real Cellular Carrier SMS | Awaiting SMS Gateway Account |
| **Live Multi-Device Tracking**| Yes (Socket.IO over Wi-Fi) | Yes (Socket.IO over Wi-Fi / Internet) | Verified |

---

## 6. Costs and Regional Availability to Verify

Before deploying real cellular telephone numbers in production:
1. **Indian Telecom Regulations (TRAI / DLT):**
   - Sending SMS in India requires DLT registration for sender IDs and message templates.
   - For exhibition demonstrations, **SMS Simulation Mode** is recommended because it runs with zero carrier charges, zero delay, and displays the exact SMS body and OTP on the Operator Console.
2. **Toll-Free / Virtual Numbers:**
   - Twilio voice numbers in India have regulatory KYC requirements. For local exhibitions, testing via the built-in Call Simulator (`operator.html`) is 100% functional, self-contained, and free.
