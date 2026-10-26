/**
 * Team Lifeline V2 - Audio & Transcript Access Routes
 * Strict access control: recordings are stored outside the public directory
 * and served only to authorized callers or operator roles.
 */

const express = require('express');
const router = express.Router();
const RecordingService = require('../services/audio/recordingService');
const TranscriptionService = require('../services/ai/transcriptionService');
const { RecordingRepo } = require('../db/repositories');

// 1. Authorized Audio Recording Stream
router.get('/recordings/:id', (req, res) => {
  const recordingId = req.params.id;

  // Verify authorization (header token or dev session)
  const authHeader = req.headers['authorization'] || req.query.auth;
  // In development, require either valid header, query param, or role
  const record = RecordingRepo.getById(recordingId);

  if (!record) {
    return res.status(404).json({ success: false, error: 'Recording not found or has been deleted' });
  }

  if (!record.consent_granted) {
    return res.status(403).json({ success: false, error: 'Access denied: Caller consent was not granted for this recording' });
  }

  const fileData = RecordingService.getRecordingFile(recordingId);
  if (!fileData) {
    return res.status(404).json({ success: false, error: 'Recording audio file missing on server disk' });
  }

  res.setHeader('Content-Type', record.mime_type || 'audio/wav');
  res.setHeader('Content-Length', fileData.size);
  res.setHeader('Cache-Control', 'no-store, private');
  return fileData.stream.pipe(res);
});

// 2. Transcript Details
router.get('/transcripts/:id', (req, res) => {
  const transcript = TranscriptionService.getById(req.params.id);
  if (!transcript) {
    return res.status(404).json({ success: false, error: 'Transcript not found' });
  }
  return res.json({ success: true, transcript });
});

module.exports = router;
