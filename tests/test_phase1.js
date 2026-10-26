/**
 * Team Lifeline V2 — Phase 1 Automated Verification Suite
 * Tests:
 * 1. JavaScript Syntax & HTML inline script compilation
 * 2. HTML DOM Container Tag Balancing
 * 3. Hyperlink & Asset Integrity (HTTP 200 checks)
 * 4. Emergency Case Schema, Normalization & Persistence
 * 5. LifelineSync Event Protocol & Deduplication
 * 6. Centralized First-Aid Chatbot Engine & Safety Disclaimers
 * 7. Patient Portal Compatibility & Redirect Safety
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');

const rootDir = path.resolve(__dirname, '..');
let testCount = 0;
let passedCount = 0;
let failedCount = 0;

function it(name, fn) {
  testCount++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
    failedCount++;
  }
}

async function runAsyncTests() {
  console.log('\n======================================================');
  console.log('   TEAM LIFELINE V2 — PHASE 1 TEST SUITE');
  console.log('======================================================\n');

  // ── 1. Syntax Verification ────────────────────────────────────────────────
  console.log('Test Group 1: JavaScript & HTML Script Syntax');
  const jsFiles = [
    'js/shared-state.js',
    'js/chatbot.js',
    'js/real-roads.js',
    'js/demo-data.js',
    'js/map.js',
    'js/app.js'
  ];
  jsFiles.forEach(f => {
    it(`Syntax of ${f}`, () => {
      const code = fs.readFileSync(path.join(rootDir, f), 'utf8');
      new Function(code);
    });
  });

  const htmlFiles = [
    'index.html',
    'ambulance.html',
    'victim.html',
    'emergency.html',
    'patient.html',
    'project-details.html'
  ];
  htmlFiles.forEach(f => {
    it(`Inline scripts in ${f}`, () => {
      const html = fs.readFileSync(path.join(rootDir, f), 'utf8');
      const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
      let match;
      let idx = 0;
      while ((match = scriptRegex.exec(html)) !== null) {
        if (/src\s*=/i.test(match[1])) continue;
        idx++;
        new Function(match[2]);
      }
      assert(idx >= 0, `Script check completed for ${f}`);
    });
  });

  // ── 2. DOM Balance Verification ───────────────────────────────────────────
  console.log('\nTest Group 2: DOM Container Tag Balance');
  htmlFiles.forEach(f => {
    it(`Container balance in ${f}`, () => {
      const content = fs.readFileSync(path.join(rootDir, f), 'utf8');
      const openDivs = (content.match(/<div\b/gi) || []).length;
      const closeDivs = (content.match(/<\/div>/gi) || []).length;
      assert.strictEqual(openDivs, closeDivs, `Unclosed <div> in ${f}: ${openDivs} open vs ${closeDivs} close`);
    });
  });

  // ── 3. Emergency Case Schema & Normalization ──────────────────────────────
  console.log('\nTest Group 3: Emergency Case Schema & Normalization (shared-state.js)');
  const { EmergencyStateManager, DEFAULT_EMERGENCY_CASE } = require(path.join(rootDir, 'js/shared-state.js'));

  it('Default case has all required canonical fields', () => {
    const required = [
      'caseId', 'status', 'createdAt', 'lastUpdatedAt', 'incidentDescription',
      'callerName', 'callerContact', 'incidentLocation', 'latitude', 'longitude',
      'landmarks', 'assignedAmbulanceId', 'driverName', 'ambulanceLocation', 'etaSeconds'
    ];
    required.forEach(field => {
      assert(DEFAULT_EMERGENCY_CASE[field] !== undefined, `Missing field in default case: ${field}`);
    });
  });

  it('Normalization sanitizes legacy { desc, lat, lng, ts } format', () => {
    const legacy = {
      desc: 'Highway truck collision near flyover',
      lat: '18.3421',
      lng: '78.3512',
      ts: 1700000000000
    };
    const norm = EmergencyStateManager.normalize(legacy);
    assert.strictEqual(norm.incidentDescription, 'Highway truck collision near flyover');
    assert.strictEqual(norm.latitude, 18.3421);
    assert.strictEqual(norm.longitude, 78.3512);
    assert.strictEqual(norm.createdAt, 1700000000000);
    assert.strictEqual(typeof norm.caseId, 'string');
    assert.strictEqual(typeof norm.status, 'string');
  });

  it('Normalization safely handles corrupted, NaN, and out-of-bounds coordinates', () => {
    const corrupted = {
      latitude: 'not-a-number',
      longitude: 999.99,
      incidentDescription: ''
    };
    const norm = EmergencyStateManager.normalize(corrupted);
    assert.strictEqual(norm.latitude, DEFAULT_EMERGENCY_CASE.latitude);
    assert.strictEqual(norm.longitude, DEFAULT_EMERGENCY_CASE.longitude);
    assert.strictEqual(norm.incidentDescription, DEFAULT_EMERGENCY_CASE.incidentDescription);
  });

  it('createCase generates a unique caseId and fresh timestamps', () => {
    const c1 = EmergencyStateManager.createCase({ incidentDescription: 'Motorcycle slip' });
    assert(c1.caseId.startsWith('EM-'), 'Case ID should begin with EM- prefix');
    assert(c1.createdAt > 0, 'createdAt should be positive timestamp');
    assert.strictEqual(c1.incidentDescription, 'Motorcycle slip');
  });

  // ── 4. LifelineSync Protocol & Event Mapping ──────────────────────────────
  console.log('\nTest Group 4: Canonical BroadcastChannel Sync Protocol (lifeline_em)');
  const { LifelineSync } = require(path.join(rootDir, 'js/shared-state.js'));

  it('LifelineSync uses canonical channel name lifeline_em', () => {
    assert.strictEqual(LifelineSync.channelName, 'lifeline_em');
  });

  it('LifelineSync deduplicates and maps legacy event names', () => {
    let received = null;
    const unsub = LifelineSync.subscribe((msg, type) => {
      received = { msg, type };
    });

    // Simulate incoming legacy AMBULANCE_PROGRESS
    LifelineSync._handleIncoming({
      type: 'AMBULANCE_PROGRESS',
      _id: 'test_msg_1',
      _originId: 'remote_tab_99',
      payload: { lat: 18.32, lng: 78.34, etaMin: '4.0', distKm: '2.1' }
    });

    assert(received !== null, 'Message should have been delivered to subscriber');
    assert.strictEqual(received.type, 'POSITION');
    assert.deepStrictEqual(received.msg.pos, [18.32, 78.34]);
    assert.strictEqual(received.msg.eta, '4.0 min');

    // Duplicate message with same _id should be ignored
    received = null;
    LifelineSync._handleIncoming({
      type: 'AMBULANCE_PROGRESS',
      _id: 'test_msg_1',
      _originId: 'remote_tab_99',
      payload: { lat: 18.32, lng: 78.34, etaMin: '4.0', distKm: '2.1' }
    });
    assert.strictEqual(received, null, 'Duplicate message ID must be dropped');

    // Self-origin message should be ignored (no loopback)
    received = null;
    LifelineSync._handleIncoming({
      type: 'ROUTE_SELECTED',
      _id: 'test_msg_2',
      _originId: LifelineSync.originId,
      coords: [[18.31, 78.33]]
    });
    assert.strictEqual(received, null, 'Self-origin message must be suppressed');

    unsub();
  });

  // ── 5. Centralized Chatbot Knowledge Base & Safety Disclaimers ────────────
  console.log('\nTest Group 5: First-Aid AI Knowledge Base & Safety Disclaimers (chatbot.js)');
  const { FIRST_AID_KNOWLEDGE, FIRST_AID_DISCLAIMER, findFirstAidTopic, FirstAidChatbot } = require(path.join(rootDir, 'js/chatbot.js'));

  it('Medical disclaimer banner is defined with emergency numbers', () => {
    assert(FIRST_AID_DISCLAIMER.includes('EMERGENCY MEDICAL NOTICE'));
    assert(FIRST_AID_DISCLAIMER.includes('108') || FIRST_AID_DISCLAIMER.includes('112'));
  });

  it('All 7 key first-aid trauma categories exist and contain structured steps', () => {
    const keys = ['bleeding', 'unconscious', 'cpr', 'fracture', 'car_crash', 'burns', 'choking'];
    keys.forEach(k => {
      const topic = FIRST_AID_KNOWLEDGE[k];
      assert(topic, `Topic ${k} missing from knowledge base`);
      assert(topic.title, `Topic ${k} missing title`);
      assert(Array.isArray(topic.steps) && topic.steps.length >= 3, `Topic ${k} steps insufficient`);
      assert(topic.warning, `Topic ${k} missing caution warning`);
    });
  });

  it('findFirstAidTopic resolves queries accurately', () => {
    assert.strictEqual(findFirstAidTopic('someone is bleeding heavily').key, 'bleeding');
    assert.strictEqual(findFirstAidTopic('need to do CPR chest compressions').key, 'cpr');
    assert.strictEqual(findFirstAidTopic('victim is unconscious and not breathing').key, 'unconscious');
    assert.strictEqual(findFirstAidTopic('suspected broken bone in leg').key, 'fracture');
    assert.strictEqual(findFirstAidTopic('car crash and smoke from engine').key, 'car_crash');
    assert.strictEqual(findFirstAidTopic('hot water scald burn on arm').key, 'burns');
    assert.strictEqual(findFirstAidTopic('food caught in throat choking').key, 'choking');
    assert.strictEqual(findFirstAidTopic('random question'), null);
  });

  it('FirstAidChatbot class instantiates without errors', () => {
    const bot = new FirstAidChatbot('dummy-container');
    assert.strictEqual(bot.containerId, 'dummy-container');
    assert.strictEqual(bot.initialized, false);
  });

  // ── 6. Patient Portal Compatibility & Redirect Safety ─────────────────────
  console.log('\nTest Group 6: Patient Portal Compatibility (patient.html)');
  it('patient.html has meta refresh and links to canonical victim.html', () => {
    const html = fs.readFileSync(path.join(rootDir, 'patient.html'), 'utf8');
    assert(html.includes('meta http-equiv="refresh"'), 'patient.html must have meta refresh');
    assert(html.includes('victim.html'), 'patient.html must reference canonical victim.html');
    assert(html.includes('window.location.replace'), 'patient.html must have programmatic redirect');
    assert(!html.includes('lifeline_emergency_channel'), 'Obsolete channel name must not be present');
  });

  // ── 7. Safe Archival of Scratch Files ─────────────────────────────────────
  console.log('\nTest Group 7: Safe Code Archival');
  it('_tmp.js and _tmp_check.js are cleanly moved to archive/phase-1', () => {
    assert(!fs.existsSync(path.join(rootDir, '_tmp.js')), '_tmp.js must be removed from workspace root');
    assert(!fs.existsSync(path.join(rootDir, '_tmp_check.js')), '_tmp_check.js must be removed from workspace root');
    assert(fs.existsSync(path.join(rootDir, 'archive/phase-1/_tmp.js')), 'archive/phase-1/_tmp.js must exist');
    assert(fs.existsSync(path.join(rootDir, 'archive/phase-1/_tmp_check.js')), 'archive/phase-1/_tmp_check.js must exist');
  });

  // ── 8. HTTP Route & Asset Resolution ──────────────────────────────────────
  console.log('\nTest Group 8: End-to-End HTTP Route & Asset Resolution');
  const PORT = 8133;
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(rootDir, reqPath);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    res.writeHead(200);
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise(resolve => server.listen(PORT, resolve));

  const routes = [
    '/',
    '/index.html',
    '/ambulance.html',
    '/victim.html',
    '/emergency.html',
    '/patient.html',
    '/project-details.html',
    '/manual.pdf',
    '/evidences.pdf',
    '/problem-solution.pdf',
    '/css/em.css',
    '/js/shared-state.js',
    '/js/chatbot.js',
    '/js/real-roads.js'
  ];

  for (const r of routes) {
    await new Promise(resolve => {
      http.get(`http://127.0.0.1:${PORT}${r}`, res => {
        it(`HTTP 200 for ${r}`, () => {
          assert.strictEqual(res.statusCode, 200, `Expected 200 for ${r}, got ${res.statusCode}`);
        });
        res.resume();
        resolve();
      }).on('error', err => {
        it(`HTTP 200 for ${r}`, () => {
          assert.fail(`Connection error for ${r}: ${err.message}`);
        });
        resolve();
      });
    });
  }

  await new Promise(resolve => server.close(resolve));

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n======================================================');
  console.log(`TEST RESULTS: Total: ${testCount} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAsyncTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
