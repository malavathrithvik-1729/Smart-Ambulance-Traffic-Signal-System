/**
 * Smart Ambulance Traffic Signal System - Application Logic & State Controller
 * Developed by Team Lifeline (SPR High School, Kamareddy)
 */

class SmartAmbulanceApp {
  constructor() {
    this.mapEngine = null;
    this.currentScenarioIndex = 0;
    this.currentScenario = null;
    this.selectedRoute = null;
    this.currentStepIndex = 0;
    this.isSimulatingJourney = false;
    this.simulationInterval = null;
    this.autoPlayInterval = null;
    this.journeyPhase = 1; // 1: To Accident Location, 2: To Hospital
    this.audioEnabled = true;
    this.audioCtx = null;
    
    // Telemetry state
    this.telemetry = {
      speedKmH: 0,
      distRemainingKm: 4.2,
      etaMinutes: 5.8,
      progressPercent: 0,
      currentCoordIndex: 0
    };

    // Hardware simulation packets
    this.serialLogs = [];
  }

  init() {
    console.log("Initializing Smart Ambulance Dashboard for Team Lifeline...");

    // 1. Initialize Map
    this.mapEngine = new EmergencyMapEngine("map");
    this.mapEngine.init();

    // 2. Load Initial Scenario
    this.loadScenario(0);

    // 3. Setup Event Listeners
    this.setupEventListeners();

    // 4. Start Hardware Simulation Clock
    this.startHardwareTelemetryStream();

    // 5. Update Time Display
    this.startTimeUpdater();
  }

  loadScenario(index) {
    this.currentScenarioIndex = index;
    this.currentScenario = DEMO_DATA.scenarios[index];
    this.selectedRoute = this.currentScenario.routes.find(r => r.recommended) || this.currentScenario.routes[0];
    this.journeyPhase = 1;
    this.telemetry.distRemainingKm = this.selectedRoute.distanceKm;
    this.telemetry.etaMinutes = this.selectedRoute.emergencyEtaMin;
    this.telemetry.progressPercent = 0;
    this.telemetry.currentCoordIndex = 0;

    // Render Scenario on Map
    this.mapEngine.renderScenario(this.currentScenario);

    // Update UI Panels
    this.renderLeftPanel();
    this.renderRightPanel();
    this.updateHUDTelemetry();
    this.renderScenarioSelector();

    // Update Top Status
    document.getElementById("emergency-status-text").innerText = "EMERGENCY ACTIVE — EN ROUTE";
    document.getElementById("emergency-pill").classList.remove("hospital-mode");
    document.getElementById("pulse-dot").classList.remove("hospital");

    // Hide Recalculation banner
    document.getElementById("recalculation-banner").classList.remove("active");
  }

  setupEventListeners() {
    // 1. Scenario Selector Change
    const scenarioSelect = document.getElementById("scenario-select");
    if (scenarioSelect) {
      scenarioSelect.addEventListener("change", (e) => {
        this.loadScenario(parseInt(e.target.value, 10));
      });
    }

    // 2. Audio Toggle
    const audioBtn = document.getElementById("btn-audio-toggle");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        this.audioEnabled = !this.audioEnabled;
        audioBtn.innerHTML = this.audioEnabled 
          ? `<span>🔊</span> Sound ON` 
          : `<span>🔇</span> Sound OFF`;
        audioBtn.classList.toggle("active", this.audioEnabled);
      });
    }

    // 3. Trigger Speaker Announcement Test
    const testSpeakerBtn = document.getElementById("btn-test-speaker");
    if (testSpeakerBtn) {
      testSpeakerBtn.addEventListener("click", () => {
        this.triggerSpeakerAlert("Emergency ambulance approaching. Please give way safely.");
      });
    }

    // 4. Trigger Route Blockage & Recalculate
    const triggerRecalcBtn = document.getElementById("btn-simulate-blockage");
    if (triggerRecalcBtn) {
      triggerRecalcBtn.addEventListener("click", () => {
        this.simulateTrafficBlockage();
      });
    }

    // 5. Journey Simulation Controls (Play/Pause)
    const playJourneyBtn = document.getElementById("btn-play-journey");
    if (playJourneyBtn) {
      playJourneyBtn.addEventListener("click", () => {
        if (this.isSimulatingJourney) {
          this.pauseJourney();
        } else {
          this.startJourney();
        }
      });
    }

    // 6. Reset Journey
    const resetJourneyBtn = document.getElementById("btn-reset-journey");
    if (resetJourneyBtn) {
      resetJourneyBtn.addEventListener("click", () => {
        this.resetJourney();
      });
    }

    // 7. First Aid SMS Modal Button
    const smsBtn = document.getElementById("btn-open-sms");
    if (smsBtn) {
      smsBtn.addEventListener("click", () => {
        this.openSMSModal();
      });
    }

    // 8. Hardware Prototype Monitor Modal Button
    const hwBtn = document.getElementById("btn-open-hardware");
    if (hwBtn) {
      hwBtn.addEventListener("click", () => {
        this.openModal("modal-hardware");
      });
    }

    // 9. Hospital Journey (Phase 2) Trigger Button
    const hospBtn = document.getElementById("btn-open-hospital-triage");
    if (hospBtn) {
      hospBtn.addEventListener("click", () => {
        this.openModal("modal-hospital");
      });
    }

    // 10. Principle & Information Modal
    const principleBtn = document.getElementById("btn-system-principle");
    if (principleBtn) {
      principleBtn.addEventListener("click", () => {
        this.openModal("modal-principle");
      });
    }

    // 11. Modal Close Buttons
    document.querySelectorAll(".modal-close-btn, .modal-backdrop-close").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-overlay");
        if (modal) modal.classList.remove("open");
      });
    });

    // 12. 17-Step Demo Stepper Navigation
    document.getElementById("btn-demo-prev")?.addEventListener("click", () => this.prevDemoStep());
    document.getElementById("btn-demo-next")?.addEventListener("click", () => this.nextDemoStep());
    document.getElementById("btn-demo-autoplay")?.addEventListener("click", () => this.toggleDemoAutoPlay());
  }

  renderScenarioSelector() {
    const sel = document.getElementById("scenario-select");
    if (!sel) return;
    sel.innerHTML = DEMO_DATA.scenarios.map((s, idx) => `
      <option value="${idx}" ${idx === this.currentScenarioIndex ? "selected" : ""}>
        ${s.title}
      </option>
    `).join("");
  }

  renderLeftPanel() {
    const s = this.currentScenario;
    if (!s) return;

    // Caller Info & Transcript
    document.getElementById("caller-name-val").innerText = s.caller.name;
    document.getElementById("caller-phone-val").innerText = s.caller.phone;
    document.getElementById("caller-relation-val").innerText = s.caller.relationship;
    document.getElementById("caller-time-val").innerText = s.callTime;
    document.getElementById("raw-caller-text").innerText = `"${s.rawCallerText}"`;

    // AI Emergency Summary & Conditions
    document.getElementById("ai-incident-type").innerText = s.aiAnalysis.incidentType;
    document.getElementById("ai-victims-count").innerText = `${s.aiAnalysis.peopleInvolved} Victims Identified`;
    document.getElementById("ai-summary-text").innerText = s.aiAnalysis.aiSummary;

    // AI Condition List
    const condContainer = document.getElementById("condition-list-container");
    if (condContainer) {
      condContainer.innerHTML = s.aiAnalysis.conditions.map(c => `
        <div class="condition-item ${c.triage.includes('YELLOW') ? 'yellow' : ''}">
          <div class="condition-name">${c.person}</div>
          <div class="condition-status">${c.status}</div>
        </div>
      `).join("");
    }

    // Landmarks Cloud
    const lmContainer = document.getElementById("landmarks-container");
    if (lmContainer && s.location.landmarks) {
      lmContainer.innerHTML = s.location.landmarks.map(lm => `
        <div class="landmark-pill">
          <span>📌</span> ${lm.name} (${lm.dist})
        </div>
      `).join("");
    }

    // Uncertainty Metrics
    document.getElementById("uncertainty-radius-val").innerText = `±${s.location.uncertaintyRadiusMeters} meters`;
    document.getElementById("confidence-score-val").innerText = `${s.location.confidenceScore} High`;

    // First Aid SMS Snippet
    document.getElementById("sms-target-phone").innerText = s.firstAidSMS.recipient;
    document.getElementById("sms-preview-text").innerText = s.firstAidSMS.text;
  }

  renderRightPanel() {
    const s = this.currentScenario;
    if (!s) return;

    // 1. Render Route Comparison Cards
    const routesContainer = document.getElementById("routes-list-container");
    if (routesContainer) {
      routesContainer.innerHTML = s.routes.map(r => {
        const isSelected = r.id === this.selectedRoute.id;
        return `
          <div class="route-card ${isSelected ? 'selected' : ''}" onclick="window.app.selectRoute('${r.id}')">
            <div class="route-header">
              <div class="route-name" style="color: ${r.color};">${r.name}</div>
              <span class="badge-tag ${r.recommended ? 'badge-verified' : 'badge-ai'}">${r.badge}</span>
            </div>
            <div class="route-metrics-row">
              <span>Dist: <b>${r.distanceKm} km</b></span>
              <span>Signals: <b>${r.signalsCount}</b></span>
              <span class="route-eta-val" style="color: ${r.color};">ETA: ${r.emergencyEtaMin} min</span>
            </div>
            <div style="font-size:10px;color:#94a3b8;margin-top:4px;">
              ${r.trafficStatus}
            </div>
          </div>
        `;
      }).join("");
    }

    // 2. Render Upcoming Signals List
    this.renderUpcomingSignalsList();
  }

  renderUpcomingSignalsList() {
    const sigContainer = document.getElementById("upcoming-signals-container");
    if (!sigContainer || !this.selectedRoute || !this.selectedRoute.signals) return;

    sigContainer.innerHTML = this.selectedRoute.signals.map((sig, idx) => {
      const isApproaching = idx === 0 && this.telemetry.distRemainingKm > 0;
      return `
        <div class="signal-node-card ${isApproaching ? 'green-priority' : ''}" id="sig-card-${sig.id}">
          <div class="signal-node-info">
            <div class="signal-node-name">🚦 ${sig.name}</div>
            <div class="signal-node-distance">
              Dist: ~${Math.max(100, Math.round(sig.distM * (1 - this.telemetry.progressPercent / 100)))}m | 
              ETA: ${Math.max(0.5, (this.telemetry.etaMinutes * (idx + 1) / 3)).toFixed(1)} min
            </div>
          </div>
          <div class="signal-traffic-light">
            <div class="light-bulb red ${!isApproaching ? 'active' : ''}"></div>
            <div class="light-bulb yellow"></div>
            <div class="light-bulb green ${isApproaching ? 'active' : ''}"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  selectRoute(routeId) {
    const route = this.currentScenario.routes.find(r => r.id === routeId);
    if (!route) return;
    this.selectedRoute = route;
    this.telemetry.distRemainingKm = route.distanceKm;
    this.telemetry.etaMinutes = route.emergencyEtaMin;

    this.mapEngine.selectRoute(routeId, this.currentScenario.routes);
    this.renderRightPanel();
    this.updateHUDTelemetry();
    this.logSerial(`[ROUTE_SELECT] Switched active corridor to: ${route.name}`);
  }

  updateHUDTelemetry() {
    document.getElementById("hud-speed-val").innerText = this.telemetry.speedKmH;
    document.getElementById("hud-dist-val").innerText = this.telemetry.distRemainingKm.toFixed(1);
    document.getElementById("hud-eta-val").innerText = this.telemetry.etaMinutes.toFixed(1);
    document.getElementById("hud-route-name").innerText = this.selectedRoute ? this.selectedRoute.name : "Route Alpha";
  }

  startJourney() {
    if (this.isSimulatingJourney) return;
    this.isSimulatingJourney = true;

    const playBtn = document.getElementById("btn-play-journey");
    if (playBtn) playBtn.innerHTML = `<span>⏸</span> Pause`;

    this.telemetry.speedKmH = 65; // Normal emergency cruise speed
    this.updateHUDTelemetry();

    const coords = this.selectedRoute.coordinates;
    const totalSteps = 100;
    let step = Math.floor((this.telemetry.progressPercent / 100) * totalSteps);

    this.simulationInterval = setInterval(() => {
      step++;
      this.telemetry.progressPercent = (step / totalSteps) * 100;
      this.telemetry.distRemainingKm = Math.max(0, this.selectedRoute.distanceKm * (1 - step / totalSteps));
      this.telemetry.etaMinutes = Math.max(0, this.selectedRoute.emergencyEtaMin * (1 - step / totalSteps));

      // Calculate interpolated lat/lng along polyline
      const coordIndex = Math.min(Math.floor((step / totalSteps) * (coords.length - 1)), coords.length - 2);
      const subRatio = ((step / totalSteps) * (coords.length - 1)) - coordIndex;
      const curLat = coords[coordIndex][0] + (coords[coordIndex + 1][0] - coords[coordIndex][0]) * subRatio;
      const curLng = coords[coordIndex][1] + (coords[coordIndex + 1][1] - coords[coordIndex][1]) * subRatio;

      this.mapEngine.updateAmbulancePosition(curLat, curLng, 45);

      // Trigger Signal Priority on approach
      if (this.selectedRoute.signals && this.selectedRoute.signals.length > 0) {
        if (step > 25 && step < 40) {
          this.mapEngine.updateSignalPriority(this.selectedRoute.signals[0].id, true);
        } else if (step >= 40) {
          this.mapEngine.updateSignalPriority(this.selectedRoute.signals[0].id, false);
        }
      }

      this.updateHUDTelemetry();
      this.renderUpcomingSignalsList();

      if (step >= totalSteps) {
        this.pauseJourney();
        this.telemetry.speedKmH = 0;
        this.updateHUDTelemetry();
        this.onArrivalAtScene();
      }
    }, 400);
  }

  pauseJourney() {
    this.isSimulatingJourney = false;
    clearInterval(this.simulationInterval);
    const playBtn = document.getElementById("btn-play-journey");
    if (playBtn) playBtn.innerHTML = `<span>▶</span> Start Journey`;
  }

  resetJourney() {
    this.pauseJourney();
    this.telemetry.speedKmH = 0;
    this.telemetry.progressPercent = 0;
    this.telemetry.distRemainingKm = this.selectedRoute.distanceKm;
    this.telemetry.etaMinutes = this.selectedRoute.emergencyEtaMin;
    const startCoord = this.selectedRoute.coordinates[0];
    this.mapEngine.updateAmbulancePosition(startCoord[0], startCoord[1], 45);
    this.mapEngine.clearObstacle();
    document.getElementById("recalculation-banner").classList.remove("active");
    this.updateHUDTelemetry();
    this.renderUpcomingSignalsList();
  }

  onArrivalAtScene() {
    this.playChime();
    document.getElementById("emergency-status-text").innerText = "ARRIVED AT SCENE — ASSESSING PATIENTS";
    this.triggerSpeakerAlert("Ambulance arrived at scene. Securing emergency area.");
    // Prompt to open Hospital Selection modal
    setTimeout(() => {
      this.openModal("modal-hospital");
    }, 1200);
  }

  simulateTrafficBlockage() {
    // 1. Mark Obstacle on Map
    const obstaclePoint = [18.3265, 78.3415];
    this.mapEngine.showObstacle(obstaclePoint[0], obstaclePoint[1], "Stalled Heavy Freight Truck & Sudden Gridlock");

    // 2. Play warning sound
    this.playWarningBuzzer();

    // 3. Show Recalculation Alert Banner
    const banner = document.getElementById("recalculation-banner");
    banner.classList.add("active");

    // 4. Automatically switch to alternative route (Route Beta)
    setTimeout(() => {
      const altRoute = this.currentScenario.routes.find(r => r.id === "route-beta") || this.currentScenario.routes[1];
      if (altRoute) {
        this.selectRoute(altRoute.id);
        this.triggerSpeakerAlert("Route updated. Heavy congestion detected ahead. Recalculating smart corridor.");
      }
    }, 1500);

    // Auto dismiss banner after 7 seconds
    setTimeout(() => {
      banner.classList.remove("active");
    }, 7000);
  }

  selectHospitalDestination(hospitalId) {
    const hosp = DEMO_DATA.hospitals.find(h => h.id === hospitalId);
    if (!hosp) return;

    this.journeyPhase = 2;
    this.closeModal("modal-hospital");

    // Update Top bar status
    document.getElementById("emergency-status-text").innerText = `PHASE 2: EN ROUTE TO ${hosp.name.toUpperCase()}`;
    document.getElementById("emergency-pill").classList.add("hospital-mode");
    document.getElementById("pulse-dot").classList.add("hospital");

    // Update Telemetry
    this.telemetry.distRemainingKm = hosp.distanceFromIncidentKm;
    this.telemetry.etaMinutes = hosp.emergencyEtaMin;
    this.telemetry.speedKmH = 70;
    this.updateHUDTelemetry();

    // Render Hospital & New Corridor on Map
    const incidentCoords = [this.currentScenario.location.lat, this.currentScenario.location.lng];
    this.mapEngine.renderHospitalDestination(hosp, incidentCoords);

    // Audio announcement
    this.triggerSpeakerAlert(`Emergency corridor reactivated to ${hosp.name}. Priority green wave engaged.`);
    this.logSerial(`[HOSPITAL_CORRIDOR] Activated corridor to: ${hosp.name}`);
  }

  // --------------------------------------------------------------------------
  // Audio & Speech Synthesis
  // --------------------------------------------------------------------------
  triggerSpeakerAlert(textToSpeak) {
    if (!this.audioEnabled) return;

    // Visual sound wave animation
    const waveEl = document.getElementById("speaker-soundwave");
    if (waveEl) {
      waveEl.classList.add("active");
      setTimeout(() => waveEl.classList.remove("active"), 3500);
    }

    // Play Alert Chime
    this.playChime();

    // Web Speech API Voice Synthesis
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop prior speeches
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  playChime() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContext muted or blocked
    }
  }

  playWarningBuzzer() {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(480, this.audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // SMS First Aid Simulation
  // --------------------------------------------------------------------------
  openSMSModal() {
    const s = this.currentScenario;
    if (!s) return;
    document.getElementById("modal-sms-recipient").innerText = s.firstAidSMS.recipient;
    document.getElementById("modal-sms-content").innerText = s.firstAidSMS.text;
    document.getElementById("modal-sms-time").innerText = s.firstAidSMS.sentTimestamp;
    this.openModal("modal-sms");
  }

  dispatchSMSManually() {
    const statusTag = document.getElementById("sms-dispatch-status");
    if (statusTag) {
      statusTag.innerText = "SENDING VIA SMS GATEWAY...";
      statusTag.className = "badge-tag badge-ai";
      setTimeout(() => {
        statusTag.innerText = "DELIVERED TO CALLER PHONE";
        statusTag.className = "badge-tag badge-verified";
        this.playChime();
        this.logSerial(`[SMS_GATEWAY] First-Aid SMS sent to ${this.currentScenario.firstAidSMS.recipient}`);
      }, 900);
    }
  }

  // --------------------------------------------------------------------------
  // 17-Step Guided Exhibition Presentation Stepper
  // --------------------------------------------------------------------------
  updateDemoStep(stepIndex) {
    if (stepIndex < 0) stepIndex = 0;
    if (stepIndex >= DEMO_DATA.demoSteps.length) stepIndex = DEMO_DATA.demoSteps.length - 1;
    this.currentStepIndex = stepIndex;

    const cur = DEMO_DATA.demoSteps[stepIndex];
    document.getElementById("demo-step-num").innerText = `STEP ${cur.step} OF 17`;
    document.getElementById("demo-step-title").innerText = cur.title;
    document.getElementById("demo-step-desc").innerText = `${cur.desc} — Hint: ${cur.actionHint}`;

    // Execute corresponding system action for this step
    this.executeStepAction(cur.step);
  }

  nextDemoStep() {
    this.updateDemoStep(this.currentStepIndex + 1);
  }

  prevDemoStep() {
    this.updateDemoStep(this.currentStepIndex - 1);
  }

  toggleDemoAutoPlay() {
    const btn = document.getElementById("btn-demo-autoplay");
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
      if (btn) btn.innerHTML = `<span>▶</span> Auto Presentation`;
    } else {
      if (btn) btn.innerHTML = `<span>⏹</span> Stop Auto`;
      this.autoPlayInterval = setInterval(() => {
        if (this.currentStepIndex < DEMO_DATA.demoSteps.length - 1) {
          this.nextDemoStep();
        } else {
          this.toggleDemoAutoPlay();
        }
      }, 5000);
    }
  }

  executeStepAction(stepNumber) {
    switch (stepNumber) {
      case 1:
      case 2:
        this.resetJourney();
        break;
      case 3:
        this.dispatchSMSManually();
        break;
      case 4:
        // Flash uncertainty circle
        break;
      case 5:
      case 6:
        this.renderRightPanel();
        break;
      case 7:
        this.selectRoute("route-alpha");
        break;
      case 8:
      case 9:
        this.logSerial(`[RF_CORRIDOR] 433 MHz Carrier Wave Activated on Channel 01`);
        break;
      case 10:
        // Connected vehicles alert
        break;
      case 11:
        this.triggerSpeakerAlert("Emergency ambulance approaching. Please give way safely.");
        break;
      case 12:
        this.startJourney();
        break;
      case 13:
        this.simulateTrafficBlockage();
        break;
      case 14:
        // Recalculated
        break;
      case 15:
        this.onArrivalAtScene();
        break;
      case 16:
        this.openModal("modal-hospital");
        break;
      case 17:
        this.selectHospitalDestination("HOSP-01");
        break;
    }
  }

  // --------------------------------------------------------------------------
  // Hardware Prototype Serial Log Simulation
  // --------------------------------------------------------------------------
  startHardwareTelemetryStream() {
    const consoleEl = document.getElementById("serial-console");
    setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const speed = this.telemetry.speedKmH;
      const rfRssi = -42 - Math.floor(Math.random() * 8);
      const packet = `[${timestamp}] [AMB-RF-TX] FREQ:433.92MHz | RSSI:${rfRssi}dBm | SPEED:${speed}km/h | RELAY_STBY=READY | V2X_NODES:34`;
      this.logSerial(packet);
    }, 2800);
  }

  logSerial(line) {
    const consoleEl = document.getElementById("serial-console");
    if (!consoleEl) return;
    const p = document.createElement("div");
    p.innerText = line;
    consoleEl.appendChild(p);
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  // --------------------------------------------------------------------------
  // Modals & Clocks
  // --------------------------------------------------------------------------
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add("open");
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove("open");
  }

  startTimeUpdater() {
    setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const el = document.getElementById("clock-display");
      if (el) el.innerText = timeStr;
      const hwLast = document.getElementById("hw-last-update");
      if (hwLast) hwLast.innerText = timeStr;
    }, 1000);
  }
}

// Bootstrap on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.app = new SmartAmbulanceApp();
  window.app.init();
});
