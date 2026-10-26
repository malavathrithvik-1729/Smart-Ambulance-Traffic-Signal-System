/**
 * Team Lifeline V2 - Main Backend Server Entrypoint
 * Node.js + Express + Socket.IO + SQLite
 *
 * Dispatches:
 * - Real-time ambulance tracking across separate laptop and phone devices over Wi-Fi
 * - Telephony call intake, audio consent, transcription, and emergency extraction
 * - Cryptographic OTP generation and SMS dispatch simulation
 */

const http = require('node:http');
const path = require('node:path');
const express = require('express');
const { Server } = require('socket.io');

const config = require('./config');
const { initDatabase } = require('./db/database');
const { setupSocketIO } = require('./socket/socketHandler');

// Route modules
const telephonyRoutes = require('./routes/telephonyRoutes');
const caseRoutes = require('./routes/caseRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const audioRoutes = require('./routes/audioRoutes');
const operatorRoutes = require('./routes/operatorRoutes');

// Initialize SQLite database
initDatabase();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
setupSocketIO(io);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware for multi-device local network access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Security: Prevent direct static access to private storage, databases, and environment files
app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (
    p.startsWith('/storage') ||
    p.startsWith('/data') ||
    p.startsWith('/.git') ||
    p.startsWith('/tests') ||
    p.includes('.env') ||
    p.endsWith('.sqlite') ||
    p.endsWith('.db')
  ) {
    return res.status(403).json({ error: 'Access forbidden: Protected system resource' });
  }
  next();
});

// API Routes
app.use('/api/telephony', telephonyRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/operator', operatorRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    time: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    simulationMode: config.simulationMode
  });
});

// Serve frontend static files
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir, {
  extensions: ['html', 'htm']
}));

// Fallback route
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

// Start listening if executed directly
if (require.main === module) {
  server.listen(config.port, config.host, () => {
    console.log('\n======================================================');
    console.log('   🚑 TEAM LIFELINE V2 — EMERGENCY DISPATCH SERVER');
    console.log('   SPR High School, Kamareddy, Telangana');
    console.log('======================================================');
    console.log(` Mode:             ${config.simulationMode ? 'SIMULATION (Offline/Demo Ready)' : 'LIVE PRODUCTION'}`);
    console.log(` Local Laptop:     http://localhost:${config.port}`);
    console.log(` Ambulance Driver: http://localhost:${config.port}/ambulance.html`);
    console.log(` Operator Console: http://localhost:${config.port}/operator.html`);
    console.log(` Phone / Wi-Fi:    http://${config.localIp}:${config.port}/victim.html`);
    console.log(` WebSocket Port:   ${config.port} (Socket.IO active)`);
    console.log('======================================================\n');
  });
}

module.exports = { app, server, io };
