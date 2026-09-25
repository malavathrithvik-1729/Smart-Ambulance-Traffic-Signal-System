
/* ═══════════════════════════════════════════════
   SESSION DATA
═══════════════════════════════════════════════ */
const emDesc    = sessionStorage.getItem('em_desc') || 'Accident on NH-44 Bypass near Indian Oil pump. 2 people injured, one bleeding heavily.';
const victimLat = parseFloat(sessionStorage.getItem('em_lat') || '18.3312');
const victimLng = parseFloat(sessionStorage.getItem('em_lng') || '78.3445');
const AMB_BASE  = [18.317987, 78.334956];

// Hospitals
const HOSPITALS = [
  { id:'H1', name:'Government Area Hospital, Kamareddy', lat:18.3280, lng:78.3310, icuBeds:6,  traumaOT:'READY', recommended:true  },
  { id:'H2', name:'Lifeline Superspeciality Hospital',   lat:18.3360, lng:78.3510, icuBeds:12, traumaOT:'READY', recommended:false }
];

/* ═══════════════════════════════════════════════
   MAP INIT — two Leaflet maps
═══════════════════════════════════════════════ */
const TILE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TOPT = { maxZoom:19, attribution:'© OpenStreetMap' };

const vMap = L.map('victim-map',  { zoomControl:false }).setView([victimLat, victimLng], 14);
const aMap = L.map('amb-map',     { zoomControl:false }).setView([AMB_BASE[0], AMB_BASE[1]], 14);
L.tileLayer(TILE, TOPT).addTo(vMap);
L.tileLayer(TILE, TOPT).addTo(aMap);

/* ── Icons ── */
const victimIcon = L.divIcon({
  html:`<div style="background:#ef4444;width:32px;height:32px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px #ef4444;font-size:16px;">📍</div>`,
  className:'', iconSize:[32,32], iconAnchor:[16,16]
});
const ambIcon = L.divIcon({
  html:`<div style="background:#10b981;width:36px;height:36px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 0 18px #10b981;">🚑</div>`,
  className:'', iconSize:[36,36], iconAnchor:[18,18]
});

L.marker([victimLat,victimLng],{icon:victimIcon}).addTo(vMap).bindPopup('Accident Scene').openPopup();
L.marker([victimLat,victimLng],{icon:victimIcon}).addTo(aMap).bindPopup('Accident Scene').openPopup();

const vAmbMarker = L.marker(AMB_BASE,{icon:ambIcon}).addTo(vMap);
const aAmbMarker = L.marker(AMB_BASE,{icon:ambIcon,zIndexOffset:1000}).addTo(aMap);

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let scenePaths    = [null, null];   // 2 scene routes
let hospPaths     = {};             // { H1:[route1,route2], H2:[route1,route2] }
let selectedSceneRoute = 0;
let selectedHospRoute  = 0;
let selectedHospId     = null;
let isJourneyActive    = false;
let tlMarkers          = [];
let sceneLines         = [];
let hospLines          = [];
let journeyTimer       = null;

/* ═══════════════════════════════════════════════
   RANDOM TRAFFIC LIGHTS along a path
   Picks N random waypoints from the path (avoiding
   start/end 10%) and places signals there.
═══════════════════════════════════════════════ */
function randomSignalsOnPath(path, count) {
  const n = path.length;
  const startIdx = Math.floor(n * 0.10);
  const endIdx   = Math.floor(n * 0.90);
  const pool     = [];
  for (let i = startIdx; i <= endIdx; i++) pool.push(i);

  // Shuffle and pick `count`
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const chosen = pool.slice(0, Math.min(count, pool.length)).sort((a,b)=>a-b);
  const NAMES  = ['Market Junction','NH-44 Cross','Bus Stand Signal','Town Hall Rd','Old Bridge Cross',
                   'Grain Market Turn','Police Station Rd','District HQ Cross','Bypass Entry','Collector Office Rd'];

  return chosen.map((idx, i) => ({
    id: `TL_${idx}`,
    name: NAMES[i % NAMES.length],
    lat: path[idx][0],
    lng: path[idx][1],
    pathIdx: idx,
    state: 'red'
  }));
}

/* ═══════════════════════════════════════════════
   OSRM FETCH
═══════════════════════════════════════════════ */
async function osrmFetch(from, to, via) {
  const pts = via ? `${from};${via};${to}` : `${from};${to}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${pts}?overview=full&geometries=geojson`;
  const r   = await fetch(url);
  const d   = await r.json();
  const rt  = d.routes[0];
  return {
    coords: rt.geometry.coordinates.map(c=>[c[1],c[0]]),
    dist: rt.distance,
    dur:  rt.duration
  };
}

function lerp(path, pct) {
  const n = path.length - 1;
  const f = pct * n;
  const i = Math.min(Math.floor(f), n-1);
  const t = f - i;
  return [
    path[i][0] + (path[i+1][0]-path[i][0])*t,
    path[i][1] + (path[i+1][1]-path[i][1])*t
  ];
}

/* ═══════════════════════════════════════════════
   LOAD SCENE ROUTES ON BOOT
═══════════════════════════════════════════════ */
async function loadSceneRoutes() {
  try {
    const from = `${AMB_BASE[1]},${AMB_BASE[0]}`;
    const to   = `${victimLng},${victimLat}`;

    const [r1, r2] = await Promise.all([
      osrmFetch(from, to),
      osrmFetch(from, to, '78.3310,18.3240')
    ]);

    scenePaths[0] = r1.coords;
    scenePaths[1] = r2.coords;

    // Count random signals
    const sigs0 = 3 + Math.floor(Math.random()*2); // 3-4
    const sigs1 = 4 + Math.floor(Math.random()*2); // 4-5

    document.getElementById('r0-time').innerText = fDur(r1.dur);
    document.getElementById('r0-dist').innerText = fDist(r1.dist);
    document.getElementById('r0-sigs').innerText = sigs0;

    document.getElementById('r1-time').innerText = fDur(r2.dur);
    document.getElementById('r1-dist').innerText = fDist(r2.dist);
    document.getElementById('r1-sigs').innerText = sigs1;

    drawSceneRoutes();
  } catch(e) {
    console.warn('OSRM failed, using fallback', e);
    scenePaths[0] = linspace(AMB_BASE, [victimLat, victimLng], 50);
    scenePaths[1] = scenePaths[0];
    drawSceneRoutes();
  }
}

function linspace(a, b, n) {
  return Array.from({length:n+1}, (_,i) => [a[0]+(b[0]-a[0])*i/n, a[1]+(b[1]-a[1])*i/n]);
}

/* ═══════════════════════════════════════════════
   DRAW SCENE ROUTES
═══════════════════════════════════════════════ */
function drawSceneRoutes() {
  sceneLines.forEach(l => { aMap.removeLayer(l); vMap.removeLayer(l); });
  sceneLines = [];
  clearTLMarkers();

  if (!scenePaths[0]) return;

  [0,1].forEach(i => {
    const isSelected = i === selectedSceneRoute;
    const c = i===0 ? '#10b981' : '#f59e0b';
    const la = L.polyline(scenePaths[i], { color:c, weight:isSelected?6:3, opacity:isSelected?.9:.35, dashArray:isSelected?null:'7,6' }).addTo(aMap);
    const lv = L.polyline(scenePaths[i], { color:c, weight:isSelected?5:2, opacity:isSelected?.8:.3,  dashArray:isSelected?null:'7,6' }).addTo(vMap);
    sceneLines.push(la, lv);
  });

  // Draw random traffic lights on selected route
  const sigCount = selectedSceneRoute===0 ? 3 : 4;
  const sigs = randomSignalsOnPath(scenePaths[selectedSceneRoute], sigCount);
  drawTLMarkers(sigs);

  const bounds = L.latLngBounds(scenePaths[selectedSceneRoute]);
  aMap.fitBounds(bounds, {padding:[44,44]});
  vMap.fitBounds(bounds, {padding:[44,44]});
}

/* ═══════════════════════════════════════════════
   TRAFFIC LIGHT RENDERING
═══════════════════════════════════════════════ */
function drawTLMarkers(signals) {
  clearTLMarkers();
  signals.forEach(sig => {
    const m = L.marker([sig.lat, sig.lng], { icon: makeTLIcon(sig.state), zIndexOffset:500 }).addTo(aMap);
    m.bindPopup(`<b>${sig.name}</b><br>${sig.state.toUpperCase()}`);
    tlMarkers.push({ lMarker: m, data: sig });
  });
}

function clearTLMarkers() {
  tlMarkers.forEach(t => aMap.removeLayer(t.lMarker));
  tlMarkers = [];
}

function makeTLIcon(state) {
  const r = state==='red'   ? '#ef4444' : 'rgba(239,68,68,.12)';
  const a = state==='amber' ? '#f59e0b' : 'rgba(245,158,11,.12)';
  const g = state==='green' ? '#10b981' : 'rgba(16,185,129,.12)';
  const glow = state==='green' ? '0 0 12px #10b981' : state==='red' ? '0 0 8px #ef4444' : 'none';
  return L.divIcon({
    html:`<div style="background:#040a14;border:1px solid ${state==='green'?'#10b981':state==='red'?'#ef4444':'#334155'};
      border-radius:8px;padding:3px 5px;display:flex;flex-direction:column;gap:3px;
      align-items:center;box-shadow:${glow};">
      <div style="width:10px;height:10px;border-radius:50%;background:${r};"></div>
      <div style="width:10px;height:10px;border-radius:50%;background:${a};"></div>
      <div style="width:10px;height:10px;border-radius:50%;background:${g};box-shadow:${state==='green'?'0 0 8px #10b981':'none'};"></div>
    </div>`,
    className:'', iconSize:[20,40], iconAnchor:[10,20]
  });
}

/* ═══════════════════════════════════════════════
   ROUTE SELECTION
═══════════════════════════════════════════════ */
function selectRoute(idx, phase) {
  if (isJourneyActive) return;

  if (phase === 'scene') {
    selectedSceneRoute = idx;
    document.getElementById('rc-0').classList.toggle('active', idx===0);
    document.getElementById('rc-1').classList.toggle('active', idx===1);
    drawSceneRoutes();
  } else {
    selectedHospRoute = idx;
    document.querySelectorAll('.hosp-route-opt').forEach((el,i) => el.classList.toggle('active', i===idx));
    drawHospRoutes();
  }
}

/* ═══════════════════════════════════════════════
   JOURNEY — step through road waypoints precisely
═══════════════════════════════════════════════ */
const TICK_MS    = 280;
const TICK_COUNT = 90;

function startJourney(phase) {
  if (isJourneyActive) return;

  const path = phase==='scene'
    ? scenePaths[selectedSceneRoute]
    : hospPaths[selectedHospId][selectedHospRoute];

  if (!path) { alert('Routes still loading…'); return; }

  isJourneyActive = true;

  const goBtn = phase==='scene' ? document.getElementById('go-btn') : document.getElementById('hosp-go-btn');
  goBtn.innerText = '⏳ Journey in Progress…';

  document.getElementById('driver-hud-card').style.display = 'block';
  document.getElementById('scene-routes-card').style.display = phase==='scene' ? 'block' : 'none';

  document.getElementById('tb-status-text').innerText =
    phase==='scene' ? 'En Route to Scene' : 'En Route to Hospital';

  if (phase==='scene') {
    document.getElementById('v-corridor-status').innerText = '🟢 Smart corridor active — signals turning green';
    document.getElementById('v-corridor-status').style.color = '#10b981';
  }

  speak(phase==='scene'
    ? 'Emergency ambulance departing. Smart signal corridor activated.'
    : 'Ambulance transferring patient to hospital. Signal corridor engaged.');

  let step = 0;
  const routeObj = phase === 'scene'
    ? { dist: parseFloat(document.getElementById(selectedSceneRoute===0?'r0-dist':'r1-dist').innerText)*1000,
        dur: 0 }
    : { dist: HOSPITALS.find(h=>h.id===selectedHospId).distM,
        dur:  HOSPITALS.find(h=>h.id===selectedHospId).durS };

  // Estimate dur from speed if not available
  const speedMs = 30/3.6; // 30 km/h average in town
  const totalDist = (path.length > 2)
    ? haversine(path[0][0],path[0][1], path[path.length-1][0], path[path.length-1][1])
    : 2000;
  const estDur = totalDist / speedMs;

  journeyTimer = setInterval(() => {
    step++;
    const pct = step / TICK_COUNT;
    const pos = lerp(path, pct);

    aAmbMarker.setLatLng(pos);
    vAmbMarker.setLatLng(pos);

    // Pan ambulance map gently
    if (step % 5 === 0) aMap.panTo(pos, {animate:true, duration:.8});

    // ETA & distance
    const distRem = (totalDist * (1-pct) / 1000).toFixed(1);
    const etaMin  = (estDur  * (1-pct) / 60).toFixed(1);
    const spd     = Math.round(30 + Math.random()*15);

    document.getElementById('a-speed').innerText = spd;
    document.getElementById('hud-speed').innerText = spd;
    document.getElementById('a-dist').innerText  = distRem + ' km';
    document.getElementById('hud-dist').innerText = distRem + ' km';
    document.getElementById('a-eta').innerText   = etaMin + ' min';
    document.getElementById('hud-eta').innerText = etaMin + ' min';
    if (phase === 'scene') {
      document.getElementById('v-eta').innerText   = etaMin + ' min';
      document.getElementById('v-dist').innerText  = distRem + ' km';
      document.getElementById('v-hud-eta').innerText  = etaMin + ' min';
      document.getElementById('v-hud-dist').innerText = distRem + ' km';
    }

    // Traffic light proximity
    checkSignals(pos);

    if (step >= TICK_COUNT) {
      clearInterval(journeyTimer);
      isJourneyActive = false;
      document.getElementById('a-speed').innerText  = '0';
      document.getElementById('hud-speed').innerText = '0';

      if (phase === 'scene') onSceneArrival();
      else onHospArrival();
    }
  }, TICK_MS);
}

/* ═══════════════════════════════════════════════
   SIGNAL PROXIMITY CHECK
═══════════════════════════════════════════════ */
function checkSignals(pos) {
  let nearest = null, nearestDist = Infinity;

  tlMarkers.forEach(tl => {
    const d = haversine(pos[0], pos[1], tl.data.lat, tl.data.lng);

    if (d < 280 && tl.data.state === 'red') {
      tl.data.state = 'green';
      tl.lMarker.setIcon(makeTLIcon('green'));
      tl.lMarker.setPopupContent(`<b>${tl.data.name}</b><br>🟢 GREEN — Priority Corridor`);
      speak(`${tl.data.name}, green.`);
    } else if (d > 350 && tl.data.state === 'green') {
      tl.data.state = 'red';
      tl.lMarker.setIcon(makeTLIcon('red'));
      tl.lMarker.setPopupContent(`<b>${tl.data.name}</b><br>🔴 Normal Cycle Resumed`);
    }

    if (d < nearestDist) { nearestDist = d; nearest = tl; }
  });

  if (nearest) {
    const color = nearest.data.state === 'green' ? '#10b981' : '#ef4444';
    const icon  = nearest.data.state === 'green' ? '🟢' : '🔴';
    document.getElementById('hud-signal').style.color = color;
    document.getElementById('hud-signal').innerHTML =
      `${icon} ${nearest.data.name} — ${nearest.data.state.toUpperCase()} (${Math.round(nearestDist)}m)`;
  }
}

/* ═══════════════════════════════════════════════
   SCENE ARRIVAL
═══════════════════════════════════════════════ */
function onSceneArrival() {
  speak('Arrived at accident scene. Paramedics are with the patient. Please select hospital.');
  document.getElementById('tb-status-text').innerText = 'Arrived — Selecting Hospital';

  // Show arrival overlay
  document.getElementById('arrival-screen').classList.add('show');

  // Clear scene route lines from maps
  sceneLines.forEach(l => { try { aMap.removeLayer(l); } catch(e){} try { vMap.removeLayer(l); } catch(e){} });
  clearTLMarkers();

  // Reset HUD signal display
  document.getElementById('hud-signal').innerHTML = '🚦 Standby';
}

function dismissArrival() {
  document.getElementById('arrival-screen').classList.remove('show');

  // ── Close victim panel, expand ambulance to full width ──
  document.getElementById('victim-half').classList.add('hidden');
  setTimeout(() => {
    document.getElementById('split').classList.add('full-amb');
    document.getElementById('divider-bar').style.display = 'none';
    // Invalidate map size so it fills the new width
    setTimeout(() => aMap.invalidateSize(), 400);
  }, 300);

  // Hide scene routes card, show hospital selection
  document.getElementById('scene-routes-card').style.display = 'none';
  document.getElementById('driver-hud-card').style.display = 'none';
  document.getElementById('hosp-select-card').style.display = 'block';

  renderHospitalList();
  // Place ambulance at victim location (scene)
  aAmbMarker.setLatLng([victimLat, victimLng]);
  vAmbMarker.setLatLng([victimLat, victimLng]);
  aMap.setView([victimLat, victimLng], 13);

  // Pre-fetch hospital routes in background
  loadAllHospitalRoutes();
}

/* ═══════════════════════════════════════════════
   HOSPITAL LIST
═══════════════════════════════════════════════ */
function renderHospitalList() {
  const cont = document.getElementById('hosp-list');
  cont.innerHTML = HOSPITALS.map(h => `
    <div class="hosp-card ${h.recommended?'rec':''}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <b style="font-size:12.5px;">${h.name}</b>
        ${h.recommended?`<span style="background:var(--green);color:#022c22;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;">RECOMMENDED</span>`:''}
      </div>
      <div style="display:flex;gap:12px;font-size:11px;color:var(--muted);margin-bottom:8px;">
        <span>ICU Beds: <b style="color:var(--blue);">${h.icuBeds} Free</b></span>
        <span>OT: <b style="color:var(--green);">${h.traumaOT}</b></span>
      </div>
      <button class="btn btn-green btn-full" style="font-size:12px;padding:8px;" onclick="selectHospital('${h.id}')">
        🏥 Select &amp; View Routes
      </button>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════
   LOAD ALL HOSPITAL ROUTES
═══════════════════════════════════════════════ */
async function loadAllHospitalRoutes() {
  for (const h of HOSPITALS) {
    try {
      const from = `${victimLng},${victimLat}`;
      const to   = `${h.lng},${h.lat}`;

      // Mid waypoint for alternate route (offset slightly)
      const midLat = (victimLat + h.lat)/2 + (Math.random()-.5)*0.005;
      const midLng = (victimLng + h.lng)/2 + (Math.random()-.5)*0.005;

      const [direct, alternate] = await Promise.all([
        osrmFetch(from, to),
        osrmFetch(from, to, `${midLng},${midLat}`)
      ]);

      hospPaths[h.id] = [direct, alternate];
      h.distM = direct.dist;
      h.durS  = direct.dur;

    } catch(e) {
      const fb = linspace([victimLat,victimLng],[h.lat,h.lng],40);
      hospPaths[h.id] = [
        { coords: fb, dist: 2000, dur: 300 },
        { coords: fb, dist: 2500, dur: 360 }
      ];
      h.distM = 2000; h.durS = 300;
    }
  }
}

/* ═══════════════════════════════════════════════
   HOSPITAL ROUTE DISPLAY
═══════════════════════════════════════════════ */
function selectHospital(hid) {
  selectedHospId    = hid;
  selectedHospRoute = 0;
  const hosp = HOSPITALS.find(h=>h.id===hid);

  document.getElementById('hosp-select-card').style.display = 'none';
  document.getElementById('hosp-routes-card').style.display = 'block';
  document.getElementById('driver-hud-card').style.display = 'block';

  // Hospital destination marker
  const hIcon = L.divIcon({
    html:`<div style="background:#8b5cf6;width:34px;height:34px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 0 16px #8b5cf6;">🏥</div>`,
    className:'', iconSize:[34,34], iconAnchor:[17,17]
  });
  L.marker([hosp.lat,hosp.lng],{icon:hIcon}).addTo(aMap).bindPopup(`<b>${hosp.name}</b>`).openPopup();

  // Build route option cards
  const routes = hospPaths[hid] || [];
  const optsCont = document.getElementById('hosp-route-options');
  optsCont.innerHTML = '';

  if (routes.length === 0) {
    optsCont.innerHTML = '<p style="color:var(--muted);font-size:12px;">Loading routes…</p>';
    // Retry in 2s
    setTimeout(() => { if(hospPaths[hid]) selectHospital(hid); }, 2000);
    return;
  }

  routes.forEach((r, i) => {
    const isRec = i===0;
    const color = i===0 ? 'var(--green)' : 'var(--amber)';
    const sigCount = 2 + i + Math.floor(Math.random()*2);
    const el = document.createElement('div');
    el.className = `route-card hosp-route-opt ${i===0?'active':''}`;
    el.onclick = () => selectRoute(i, 'hosp');
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <b style="color:${color};font-size:13px;">Route ${i+1}${i===0?' — Direct':'— Via Town'}</b>
        ${isRec?`<span style="background:var(--green);color:#022c22;font-size:9px;font-weight:900;padding:2px 6px;border-radius:4px;">BEST</span>`:''}
      </div>
      <div class="route-metrics">
        <div><div class="rm-lbl">Time</div><div class="rm-val" style="color:${color};">${fDur(r.dur)}</div></div>
        <div><div class="rm-lbl">Dist</div><div class="rm-val">${fDist(r.dist)}</div></div>
        <div><div class="rm-lbl">Signals</div><div class="rm-val" style="color:var(--blue);">${sigCount}</div></div>
        <div><div class="rm-lbl">Vehicles</div><div class="rm-val">${18+i*22}</div></div>
      </div>`;
    optsCont.appendChild(el);
  });

  drawHospRoutes();
}

function drawHospRoutes() {
  hospLines.forEach(l => { try { aMap.removeLayer(l); } catch(e){} });
  hospLines = [];
  clearTLMarkers();

  const routes = hospPaths[selectedHospId];
  if (!routes) return;

  routes.forEach((r, i) => {
    const isSel = i === selectedHospRoute;
    const c = i===0 ? '#10b981' : '#f59e0b';
    const l = L.polyline(r.coords, { color:c, weight:isSel?6:3, opacity:isSel?.9:.35, dashArray:isSel?null:'7,6' }).addTo(aMap);
    hospLines.push(l);
  });

  // Place random traffic lights on selected hospital route
  const sel = routes[selectedHospRoute];
  const sigCount = 2 + selectedHospRoute + Math.floor(Math.random()*2);
  const sigs = randomSignalsOnPath(sel.coords, sigCount);
  drawTLMarkers(sigs);

  const bounds = L.latLngBounds(routes[selectedHospRoute].coords);
  aMap.fitBounds(bounds, {padding:[44,44]});

  // Update HUD dist/eta
  document.getElementById('a-dist').innerText = fDist(sel.dist);
  document.getElementById('hud-dist').innerText = fDist(sel.dist);
  document.getElementById('a-eta').innerText = fDur(sel.dur);
  document.getElementById('hud-eta').innerText = fDur(sel.dur);
}

/* ═══════════════════════════════════════════════
   HOSPITAL ARRIVAL
═══════════════════════════════════════════════ */
function onHospArrival() {
  const hosp = HOSPITALS.find(h=>h.id===selectedHospId);
  speak(`Arrived at ${hosp ? hosp.name : 'hospital'}. Patient handover complete.`);
  document.getElementById('tb-status-text').innerText = `Arrived at Hospital ✅`;
  document.getElementById('hud-signal').innerHTML = '✅ Arrived';
  document.getElementById('a-speed').innerText = '0';
  clearTLMarkers();

  // Show simple done notice
  document.getElementById('hosp-routes-card').innerHTML = `
    <div style="text-align:center;padding:20px;">
      <div style="font-size:48px;margin-bottom:10px;">🏥</div>
      <h3 style="color:#34d399;font-weight:900;margin-bottom:8px;">Patient Delivered!</h3>
      <p style="font-size:12px;color:var(--muted);">Patient has been handed over at<br><b style="color:#fff;">${hosp?hosp.name:'Hospital'}</b></p>
      <a href="index.html" class="btn btn-green" style="margin-top:16px;display:inline-flex;">← New Emergency</a>
    </div>`;
}

/* ═══════════════════════════════════════════════
   CHATBOT
═══════════════════════════════════════════════ */
const AI = {
  bleeding:`<b>Severe Bleeding:</b><br>1. Press a clean cloth FIRMLY — do not lift to check.<br>2. Add more cloth if soaked.<br>3. Raise limb above heart level if no fracture.<br>4. Keep patient lying down and warm.`,
  unconscious:`<b>Unconscious Person:</b><br>1. Check breathing (5 seconds — watch chest rise).<br>2. If breathing: Recovery Position (on side).<br>3. If NOT breathing: start CPR — 30 chest compressions, 2 rescue breaths.<br>4. Never give water to unconscious person.`,
  fracture:`<b>Broken Bone:</b><br>1. Do NOT move or straighten the limb.<br>2. Support with rolled clothing.<br>3. If skin broken, cover with clean cloth.<br>4. Do not push bones back.`,
  crash:`<b>Car Crash:</b><br>1. Keep other traffic back — warn approaching vehicles.<br>2. Switch off vehicle ignition if safe.<br>3. Do NOT move victims unless vehicle is on fire (spinal risk).<br>4. Reassure: "Help is almost here."`
};

function addMsg(html, who) {
  const log = document.getElementById('chat-log');
  const d = document.createElement('div');
  d.className = `chat-msg ${who}`;
  d.innerHTML = html;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}

(function initChat() {
  addMsg(`Hello! I am the <b>Lifeline First-Aid Assistant</b>.<br>The ambulance is on its way. Ask me anything about first aid.`, 'bot');
})();

function askAI(topic) {
  const labels={bleeding:'Bleeding',unconscious:'Unconscious person',fracture:'Broken bone',crash:'Car crash'};
  addMsg(labels[topic]+' — what should I do?','user');
  setTimeout(()=>addMsg(AI[topic]||'Keep patient calm and still.','bot'),380);
}

function sendChat() {
  const inp = document.getElementById('chat-in');
  const q = inp.value.trim();
  if(!q) return;
  inp.value='';
  addMsg(q,'user');
  const ql=q.toLowerCase();
  let ans='Ambulance is almost there. Keep the patient calm, still, and warm.';
  if(ql.includes('bleed')) ans=AI.bleeding;
  else if(ql.includes('unconsci')||ql.includes('breath')||ql.includes('cpr')) ans=AI.unconscious;
  else if(ql.includes('fractur')||ql.includes('bone')||ql.includes('broken')) ans=AI.fracture;
  else if(ql.includes('crash')||ql.includes('smoke')||ql.includes('fire')||ql.includes('car')) ans=AI.crash;
  setTimeout(()=>addMsg(ans,'bot'),380);
}

/* ═══════════════════════════════════════════════
   EXTRA DESC → DRIVER
═══════════════════════════════════════════════ */
function sendExtraDesc() {
  const val = document.getElementById('extra-desc').value.trim();
  if(!val) return;
  document.getElementById('desc-sent').style.display='block';
  setTimeout(()=>document.getElementById('desc-sent').style.display='none',4000);
  document.getElementById('amb-victim-desc-panel').style.display='block';
  document.getElementById('amb-victim-desc-text').innerText=val;
}

/* ═══════════════════════════════════════════════
   CALL MODAL
═══════════════════════════════════════════════ */
let callTimeout = null;
function openCallModal(role) {
  const m = document.getElementById('call-modal');
  m.style.display = 'flex';
  const isVictim = role==='victim';
  document.getElementById('call-avatar').innerText = isVictim ? '📞' : '📲';
  document.getElementById('call-title').innerText  = isVictim ? 'Calling Ambulance Driver…' : 'Calling Victim / Caller…';
  document.getElementById('call-subtitle').innerText = isVictim ? 'Officer R. Sharma — AMB-01' : 'Suresh Reddy — +91 98480 23145';
  document.getElementById('call-log').innerText = 'Connecting…';
  speak(isVictim ? 'Calling ambulance driver.' : 'Calling victim.');

  callTimeout = setTimeout(() => {
    document.getElementById('call-log').innerText = isVictim
      ? "Driver: 'Hello, Officer Sharma here. We are on the NH-44 with full signal clearance. Stay calm, we are under 2 minutes away.'"
      : "Caller: 'The person is breathing but the leg is bleeding badly — near the petrol pump.'\nDriver: 'Keep pressing the cloth. We are 1 minute away, all lights are green.'";
    speak(isVictim
      ? 'Officer Sharma here. We are 2 minutes away, signal corridor is active.'
      : 'Caller connected. Keep pressing cloth on wound. We are 1 minute away, all lights are green.');
  }, 2000);
}

function closeCallModal() {
  clearTimeout(callTimeout);
  if('speechSynthesis' in window) speechSynthesis.cancel();
  document.getElementById('call-modal').style.display='none';
}

/* ═══════════════════════════════════════════════
   UTILS
═══════════════════════════════════════════════ */
function haversine(lat1,lon1,lat2,lon2) {
  const R=6371e3,dL=(lat2-lat1)*Math.PI/180,dl=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function fDist(m) { return (m/1000).toFixed(1)+' km'; }
function fDur(s)  {
  const m=Math.floor(s/60),ss=Math.round(s%60);
  return ss?`${m}.${Math.round(ss/6)} min`:`${m} min`;
}

function speak(text) {
  if(!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=0.95;
  speechSynthesis.speak(u);
}

/* ── Init ── */
document.getElementById('amb-inc-text').innerText = emDesc;
document.getElementById('v-location-text').innerText = `${victimLat.toFixed(5)}°N, ${victimLng.toFixed(5)}°E`;
loadSceneRoutes();
