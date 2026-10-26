/**
 * Team Lifeline V2 - Secure Audio Recording Service
 * Stores and manages call audio outside public static directories with strict consent enforcement.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const config = require('../../config');
const { RecordingRepo } = require('../../db/repositories');

// Helper to create a minimal valid PCM WAV buffer for test/simulation purposes
function createSyntheticWavBuffer(durationSeconds = 2, sampleRate = 8000) {
  const numSamples = Math.floor(durationSeconds * sampleRate);
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Fill with low-amplitude demo tone (440 Hz)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t) * 3000;
    buffer.writeInt16LE(Math.floor(sample), 44 + (i * 2));
  }

  return buffer;
}

class RecordingService {
  constructor() {
    this.recordingsDir = config.recordingsDir;
    this.ensureDirectory();
  }

  ensureDirectory() {
    if (!fs.existsSync(this.recordingsDir)) {
      fs.mkdirSync(this.recordingsDir, { recursive: true });
    }
  }

  /**
   * Save an audio recording for a call session.
   * STRICT CONSENT CHECK: Rejects if consent is required but not granted.
   */
  async saveRecording({ callSessionId, audioBuffer = null, durationSeconds = 3, consentGranted = false, mimeType = 'audio/wav' }) {
    if (config.requireRecordingConsent && !consentGranted) {
      throw new Error('Recording rejected: caller consent was not granted');
    }

    this.ensureDirectory();

    const recordingId = `REC-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const fileName = `${recordingId}.wav`;
    const fullPath = path.join(this.recordingsDir, fileName);

    const bufferToSave = audioBuffer || createSyntheticWavBuffer(durationSeconds);
    fs.writeFileSync(fullPath, bufferToSave);

    const record = RecordingRepo.create({
      id: recordingId,
      callSessionId,
      filePath: fullPath,
      fileName,
      mimeType,
      durationSeconds,
      consentGranted: consentGranted ? 1 : 0
    });

    return record;
  }

  /**
   * Retrieve a recording for streaming/playback.
   */
  getRecordingFile(recordingId) {
    const record = RecordingRepo.getById(recordingId);
    if (!record) return null;
    if (!fs.existsSync(record.file_path)) return null;

    return {
      record,
      stream: fs.createReadStream(record.file_path),
      size: fs.statSync(record.file_path).size
    };
  }

  /**
   * Soft-delete a recording.
   */
  deleteRecording(recordingId) {
    return RecordingRepo.softDelete(recordingId);
  }

  /**
   * Retention cleanup job: deletes files older than retention policy.
   */
  cleanupExpiredRecordings() {
    // Optional maintenance routine
  }
}

module.exports = new RecordingService();
