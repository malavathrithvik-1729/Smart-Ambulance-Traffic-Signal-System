/**
 * Team Lifeline V2 - SQLite Database Layer
 * Built on Node.js native `node:sqlite` (DatabaseSync).
 */

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const config = require('../config');

let dbInstance = null;

function initDatabase(customPath = null) {
  const dbPath = customPath || config.databasePath;

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);

  // Enable WAL mode for performance & concurrency if file-based
  if (dbPath !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }
  db.exec('PRAGMA foreign_keys = ON;');

  // Create Schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS call_sessions (
      id TEXT PRIMARY KEY,
      caller_contact TEXT,
      caller_name TEXT,
      consent_status TEXT DEFAULT 'pending',
      status TEXT DEFAULT 'incoming',
      intake_notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recordings (
      id TEXT PRIMARY KEY,
      call_session_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT DEFAULT 'audio/wav',
      duration_seconds REAL DEFAULT 0,
      consent_granted INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      deleted_at INTEGER,
      FOREIGN KEY (call_session_id) REFERENCES call_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transcripts (
      id TEXT PRIMARY KEY,
      call_session_id TEXT NOT NULL,
      recording_id TEXT,
      raw_text TEXT NOT NULL,
      language TEXT DEFAULT 'en',
      engine TEXT DEFAULT 'local_rules',
      status TEXT DEFAULT 'completed',
      created_at INTEGER NOT NULL,
      FOREIGN KEY (call_session_id) REFERENCES call_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS emergency_cases (
      id TEXT PRIMARY KEY,
      call_session_id TEXT,
      transcript_id TEXT,
      status TEXT DEFAULT 'reported',
      incident_type TEXT DEFAULT 'road_accident',
      incident_description TEXT NOT NULL,
      severity TEXT DEFAULT 'critical',
      incident_location TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      landmarks TEXT,
      caller_contact TEXT,
      caller_name TEXT,
      victim_count INTEGER DEFAULT 1,
      reported_condition TEXT,
      unconfirmed_fields TEXT DEFAULT '[]',
      driver_summary TEXT,
      assigned_ambulance_id TEXT,
      ambulance_lat REAL,
      ambulance_lng REAL,
      ambulance_speed REAL DEFAULT 0,
      ambulance_heading REAL DEFAULT 0,
      location_source TEXT DEFAULT 'simulated',
      eta_seconds INTEGER DEFAULT 300,
      distance_km REAL DEFAULT 2.5,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      metadata TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS tracking_invitations (
      id TEXT PRIMARY KEY,
      case_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      otp_hash TEXT NOT NULL,
      otp_salt TEXT NOT NULL,
      otp_attempts INTEGER DEFAULT 0,
      otp_max_attempts INTEGER DEFAULT 5,
      otp_expires_at INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      sms_status TEXT DEFAULT 'simulated',
      sms_message TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (case_id) REFERENCES emergency_cases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tracking_sessions (
      id TEXT PRIMARY KEY,
      invitation_id TEXT NOT NULL,
      case_id TEXT NOT NULL,
      session_token TEXT UNIQUE NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (invitation_id) REFERENCES tracking_invitations(id) ON DELETE CASCADE,
      FOREIGN KEY (case_id) REFERENCES emergency_cases(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_cases_status ON emergency_cases(status);
    CREATE INDEX IF NOT EXISTS idx_invitations_token ON tracking_invitations(token);
    CREATE INDEX IF NOT EXISTS idx_tracking_sessions_token ON tracking_sessions(session_token);
  `);

  dbInstance = db;
  return db;
}

function getDatabase() {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

module.exports = {
  initDatabase,
  getDatabase
};
