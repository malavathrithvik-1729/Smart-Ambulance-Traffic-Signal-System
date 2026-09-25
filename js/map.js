/**
 * Smart Ambulance Traffic Signal System - Interactive Map Engine (Leaflet.js)
 * Developed by Team Lifeline
 */

class EmergencyMapEngine {
  constructor(mapContainerId) {
    this.containerId = mapContainerId;
    this.map = null;
    this.routesLayers = {};
    this.corridorLayer = null;
    this.signalMarkers = {};
    this.ambulanceMarker = null;
    this.incidentMarker = null;
    this.uncertaintyCircle = null;
    this.obstacleMarker = null;
    this.hospitalMarker = null;
    this.landmarkMarkers = [];
    this.vehicleMarkers = [];
    this.activeRouteId = "route-alpha";
    this.isOfflineMode = false;
  }

  init(centerLat = 18.3250, centerLng = 78.3400, zoom = 14) {
    if (!window.L) {
      console.warn("Leaflet library not loaded. Falling back to offline tactical canvas.");
      this.initOfflineCanvas();
      return;
    }

    try {
      this.map = L.map(this.containerId, {
        zoomControl: false,
        attributionControl: false
      }).setView([centerLat, centerLng], zoom);

      // Add Zoom control to top-right
      L.control.zoom({ position: "topright" }).addTo(this.map);

      // High-Contrast Dark Tactical Map Tiles (CartoDB Dark Matter)
      const darkTiles = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd"
      });

      darkTiles.on("tileerror", () => {
        if (!this.isOfflineMode) {
          console.warn("CartoDB tiles unavailable. Using OpenStreetMap standard tiles.");
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(this.map);
        }
      });

      darkTiles.addTo(this.map);
    } catch (err) {
      console.error("Map initialization error:", err);
      this.initOfflineCanvas();
    }
  }

  initOfflineCanvas() {
    this.isOfflineMode = true;
    const container = document.getElementById(this.containerId);
    if (container) {
      container.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#090d18;color:#38bdf8;font-family:monospace;text-align:center;padding:20px;">
          <div style="font-size:16px;font-weight:bold;margin-bottom:8px;">[TACTICAL OFFLINE GRID ACTIVE]</div>
          <div style="font-size:12px;color:#94a3b8;max-width:400px;">Simulating Kamareddy Corridor Grid Coordinates: 18.3312° N, 78.3445° E. Live telemetry operational.</div>
        </div>
      `;
    }
  }

  renderScenario(scenario) {
    if (this.isOfflineMode || !this.map) return;

    this.clearAll();

    // 1. Render Incident Location with uncertainty circle
    const loc = scenario.location;
    this.renderIncidentLocation(loc.lat, loc.lng, loc.name, loc.uncertaintyRadiusMeters, loc.confidenceScore);

    // 2. Render Nearby Landmarks
    if (loc.landmarks) {
      loc.landmarks.forEach(lm => {
        this.renderLandmark(lm.lat, lm.lng, lm.name, lm.dist);
      });
    }

    // 3. Render Ambulance Start Location
    const start = scenario.startPosition;
    this.renderAmbulance(start.lat, start.lng, 45);

    // 4. Render All Alternative Routes
    scenario.routes.forEach(route => {
      this.renderRoutePolyline(route);
    });

    // 5. Render Signals along routes
    scenario.routes.forEach(route => {
      if (route.signals) {
        route.signals.forEach(sig => {
          this.renderSignal(sig);
        });
      }
    });

    // 6. Highlight Selected Route and generate Dynamic Emergency Corridor
    const selectedRoute = scenario.routes.find(r => r.recommended) || scenario.routes[0];
    this.selectRoute(selectedRoute.id, scenario.routes);

    // 7. Render Connected Vehicles in corridor
    this.renderConnectedVehicles(selectedRoute.coordinates);

    // Fit map bounds to encompass start, incident, and routes
    const allCoords = selectedRoute.coordinates.concat([[start.lat, start.lng], [loc.lat, loc.lng]]);
    this.map.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50] });
  }

  renderIncidentLocation(lat, lng, name, uncertaintyRadius, confidence) {
    // Uncertainty Circle
    this.uncertaintyCircle = L.circle([lat, lng], {
      radius: uncertaintyRadius || 50,
      color: "#ef4444",
      fillColor: "#ef4444",
      fillOpacity: 0.15,
      weight: 1.5,
      dashArray: "4, 6"
    }).addTo(this.map);

    // Incident Marker with pulsating red beacon
    const incidentHtml = `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:40px;height:40px;">
        <div style="position:absolute;width:34px;height:34px;border-radius:50%;background:rgba(239,68,68,0.3);animation:pulse-ring 1.5s infinite;"></div>
        <div style="width:20px;height:20px;border-radius:50%;background:#ef4444;border:2px solid #fff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px #ef4444;">
          <span style="color:#fff;font-size:11px;font-weight:900;">!</span>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: incidentHtml,
      className: "incident-custom-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    this.incidentMarker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
    this.incidentMarker.bindPopup(`
      <div style="font-size:12px;padding:4px;">
        <div style="font-weight:bold;color:#ef4444;text-transform:uppercase;margin-bottom:4px;">🚨 Incident Location</div>
        <div>${name}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Uncertainty Radius: <b>±${uncertaintyRadius}m</b> (Confidence: ${confidence})</div>
      </div>
    `);
  }

  renderLandmark(lat, lng, name, dist) {
    const icon = L.divIcon({
      html: `
        <div style="background:#1e293b;border:1px solid #64748b;color:#cbd5e1;padding:2px 6px;border-radius:4px;font-size:9.5px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.5);">
          📍 ${name} <span style="color:#94a3b8;">(${dist})</span>
        </div>
      `,
      className: "landmark-custom-icon",
      iconAnchor: [30, 10]
    });

    const marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
    this.landmarkMarkers.push(marker);
  }

  renderAmbulance(lat, lng, heading = 0) {
    if (this.ambulanceMarker) {
      this.ambulanceMarker.setLatLng([lat, lng]);
      return;
    }

    const ambHtml = `
      <div class="amb-custom-marker" style="position:relative;width:44px;height:44px;">
        <div class="amb-pulse-ring"></div>
        <div style="width:28px;height:28px;border-radius:50%;background:#0f172a;border:2px solid #10b981;display:flex;align-items:center;justify-content:center;box-shadow:0 0 15px #10b981;transform:rotate(${heading}deg);">
          <span style="font-size:15px;">🚑</span>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: ambHtml,
      className: "amb-icon",
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.ambulanceMarker = L.marker([lat, lng], { icon: icon, zIndexOffset: 1000 }).addTo(this.map);
    this.ambulanceMarker.bindPopup(`
      <div style="font-size:12px;">
        <div style="font-weight:bold;color:#10b981;">🚑 AMBULANCE LIFELINE-01</div>
        <div style="color:#94a3b8;font-size:10px;">Emergency RF Tx: 433.92 MHz ACTIVE</div>
      </div>
    `);
  }

  renderRoutePolyline(route) {
    const isSelected = route.recommended || route.id === this.activeRouteId;

    const polyline = L.polyline(route.coordinates, {
      color: route.color,
      weight: isSelected ? 6 : 3,
      opacity: isSelected ? 0.9 : 0.4,
      dashArray: isSelected ? null : "6, 6",
      lineCap: "round",
      lineJoin: "round"
    }).addTo(this.map);

    polyline.bindTooltip(`${route.name} (${route.distanceKm} km, ~${route.emergencyEtaMin} min)`, {
      sticky: true,
      className: "route-tooltip"
    });

    this.routesLayers[route.id] = { polyline, data: route };
  }

  selectRoute(routeId, allRoutes) {
    this.activeRouteId = routeId;

    // 1. Update polyline visual styles
    Object.keys(this.routesLayers).forEach(id => {
      const item = this.routesLayers[id];
      if (id === routeId) {
        item.polyline.setStyle({
          color: item.data.color,
          weight: 6,
          opacity: 0.95,
          dashArray: null
        });
        item.polyline.bringToFront();
      } else {
        item.polyline.setStyle({
          color: item.data.color,
          weight: 3,
          opacity: 0.35,
          dashArray: "6, 6"
        });
      }
    });

    // 2. Render Dynamic Emergency Corridor buffer around selected route
    const selected = allRoutes.find(r => r.id === routeId);
    if (selected) {
      this.renderCorridorBuffer(selected.coordinates);
    }
  }

  renderCorridorBuffer(coords) {
    if (this.corridorLayer) {
      this.map.removeLayer(this.corridorLayer);
    }

    // Generate simulated corridor buffer polygon around route points
    const bufferPointsLeft = [];
    const bufferPointsRight = [];
    const offset = 0.0012; // ~100m corridor width

    coords.forEach(pt => {
      bufferPointsLeft.push([pt[0] + offset, pt[1] - offset * 0.7]);
      bufferPointsRight.unshift([pt[0] - offset, pt[1] + offset * 0.7]);
    });

    const corridorPolygonCoords = bufferPointsLeft.concat(bufferPointsRight);

    this.corridorLayer = L.polygon(corridorPolygonCoords, {
      color: "#10b981",
      weight: 1,
      fillColor: "#10b981",
      fillOpacity: 0.08,
      dashArray: "3, 6"
    }).addTo(this.map);

    this.corridorLayer.bringToBack();
  }

  renderSignal(signal) {
    const isGreen = signal.priorityState === "GREEN_WAVE" && signal.currentActive === true;

    const signalHtml = `
      <div style="background:#090e18;border:1px solid #334155;border-radius:12px;padding:3px 5px;display:flex;flex-direction:column;gap:3px;align-items:center;box-shadow:0 2px 8px rgba(0,0,0,0.8);">
        <div style="width:7px;height:7px;border-radius:50%;background:#ef4444;opacity:${isGreen ? 0.2 : 0.9};box-shadow:${isGreen ? 'none' : '0 0 6px #ef4444'};"></div>
        <div style="width:7px;height:7px;border-radius:50%;background:#f59e0b;opacity:0.2;"></div>
        <div style="width:7px;height:7px;border-radius:50%;background:#10b981;opacity:${isGreen ? 1 : 0.2};box-shadow:${isGreen ? '0 0 8px #10b981' : 'none'};"></div>
      </div>
    `;

    const icon = L.divIcon({
      html: signalHtml,
      className: `signal-icon-${signal.id}`,
      iconSize: [20, 36],
      iconAnchor: [10, 18]
    });

    if (this.signalMarkers[signal.id]) {
      this.signalMarkers[signal.id].setIcon(icon);
    } else {
      const marker = L.marker([signal.lat, signal.lng], { icon: icon }).addTo(this.map);
      marker.bindPopup(`
        <div style="font-size:11px;">
          <div style="font-weight:bold;color:#f1f5f9;">🚦 ${signal.name}</div>
          <div>Status: <b style="color:${isGreen ? '#10b981' : '#ef4444'}">${isGreen ? 'GREEN WAVE CORRIDOR' : 'NORMAL CYCLE'}</b></div>
          <div style="font-size:9.5px;color:#94a3b8;margin-top:3px;">RF Receiver 433MHz: Standby & Active</div>
        </div>
      `);
      this.signalMarkers[signal.id] = marker;
    }
  }

  updateSignalPriority(signalId, isPriorityGreen) {
    if (this.isOfflineMode) return;
    const signalHtml = `
      <div style="background:#090e18;border:1px solid ${isPriorityGreen ? '#10b981' : '#334155'};border-radius:12px;padding:3px 5px;display:flex;flex-direction:column;gap:3px;align-items:center;box-shadow:${isPriorityGreen ? '0 0 12px rgba(16,185,129,0.5)' : '0 2px 8px rgba(0,0,0,0.8)'};">
        <div style="width:7px;height:7px;border-radius:50%;background:#ef4444;opacity:${isPriorityGreen ? 0.2 : 0.9};"></div>
        <div style="width:7px;height:7px;border-radius:50%;background:#f59e0b;opacity:0.2;"></div>
        <div style="width:7px;height:7px;border-radius:50%;background:#10b981;opacity:${isPriorityGreen ? 1 : 0.2};box-shadow:${isPriorityGreen ? '0 0 10px #10b981' : 'none'};"></div>
      </div>
    `;

    const icon = L.divIcon({
      html: signalHtml,
      className: `signal-icon-${signalId}`,
      iconSize: [20, 36],
      iconAnchor: [10, 18]
    });

    if (this.signalMarkers[signalId]) {
      this.signalMarkers[signalId].setIcon(icon);
    }
  }

  renderConnectedVehicles(routeCoords) {
    this.vehicleMarkers.forEach(m => this.map.removeLayer(m));
    this.vehicleMarkers = [];

    // Place 5 simulated vehicles near the route corridor
    const offsets = [
      [0.0006, 0.0007],
      [-0.0008, 0.0005],
      [0.0005, -0.0008],
      [-0.0007, -0.0006],
      [0.0009, 0.0004]
    ];

    for (let i = 0; i < offsets.length; i++) {
      const basePt = routeCoords[Math.min(i + 1, routeCoords.length - 1)];
      const vLat = basePt[0] + offsets[i][0];
      const vLng = basePt[1] + offsets[i][1];

      const vIcon = L.divIcon({
        html: `
          <div style="background:#1e293b;border:1px solid #f59e0b;color:#fbbf24;padding:1px 4px;border-radius:3px;font-size:8.5px;white-space:nowrap;box-shadow:0 0 6px rgba(245,158,11,0.4);">
            🚗 V2X Yielding
          </div>
        `,
        iconAnchor: [20, 8]
      });

      const vMarker = L.marker([vLat, vLng], { icon: vIcon }).addTo(this.map);
      this.vehicleMarkers.push(vMarker);
    }
  }

  showObstacle(lat, lng, description) {
    if (this.obstacleMarker) {
      this.map.removeLayer(this.obstacleMarker);
    }

    const obsHtml = `
      <div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;background:#ef4444;border:2px solid #fff;border-radius:50%;color:#fff;font-size:14px;box-shadow:0 0 15px #ef4444;animation:pulse-ring 1s infinite;">
        ⛔
      </div>
    `;

    const icon = L.divIcon({
      html: obsHtml,
      className: "obstacle-icon",
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    this.obstacleMarker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
    this.obstacleMarker.bindPopup(`
      <div style="font-size:11px;">
        <div style="font-weight:bold;color:#ef4444;">⛔ ROADWAY OBSTACLE DETECTED</div>
        <div>${description}</div>
      </div>
    `).openPopup();
  }

  clearObstacle() {
    if (this.obstacleMarker) {
      this.map.removeLayer(this.obstacleMarker);
      this.obstacleMarker = null;
    }
  }

  renderHospitalDestination(hospital, accidentCoords) {
    if (this.hospitalMarker) {
      this.map.removeLayer(this.hospitalMarker);
    }

    const hospHtml = `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:#8b5cf6;color:#fff;border:2px solid #fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px #8b5cf6;">
          🏥
        </div>
        <div style="background:#1e1b4b;border:1px solid #8b5cf6;color:#c084fc;padding:2px 6px;border-radius:4px;font-size:9.5px;font-weight:bold;white-space:nowrap;margin-top:2px;">
          ${hospital.name}
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: hospHtml,
      className: "hosp-icon",
      iconSize: [40, 50],
      iconAnchor: [20, 25]
    });

    this.hospitalMarker = L.marker([hospital.lat, hospital.lng], { icon: icon }).addTo(this.map);

    // Generate Route Polyline from accident to hospital
    const hospitalRouteCoords = [
      accidentCoords,
      [(accidentCoords[0] + hospital.lat) / 2 + 0.002, (accidentCoords[1] + hospital.lng) / 2 - 0.001],
      [hospital.lat, hospital.lng]
    ];

    const hospPolyline = L.polyline(hospitalRouteCoords, {
      color: "#a855f7",
      weight: 6,
      opacity: 0.95
    }).addTo(this.map);

    this.routesLayers["hospital-route"] = { polyline: hospPolyline, data: hospital };
    this.renderCorridorBuffer(hospitalRouteCoords);

    this.map.fitBounds(L.latLngBounds([accidentCoords, [hospital.lat, hospital.lng]]), { padding: [60, 60] });
  }

  updateAmbulancePosition(lat, lng, heading = 0) {
    if (!this.ambulanceMarker || this.isOfflineMode) return;
    this.ambulanceMarker.setLatLng([lat, lng]);
  }

  clearAll() {
    if (this.isOfflineMode || !this.map) return;
    Object.values(this.routesLayers).forEach(item => this.map.removeLayer(item.polyline));
    this.routesLayers = {};
    if (this.corridorLayer) this.map.removeLayer(this.corridorLayer);
    Object.values(this.signalMarkers).forEach(m => this.map.removeLayer(m));
    this.signalMarkers = {};
    if (this.incidentMarker) this.map.removeLayer(this.incidentMarker);
    if (this.uncertaintyCircle) this.map.removeLayer(this.uncertaintyCircle);
    if (this.ambulanceMarker) this.map.removeLayer(this.ambulanceMarker);
    if (this.obstacleMarker) this.map.removeLayer(this.obstacleMarker);
    if (this.hospitalMarker) this.map.removeLayer(this.hospitalMarker);
    this.landmarkMarkers.forEach(m => this.map.removeLayer(m));
    this.landmarkMarkers = [];
    this.vehicleMarkers.forEach(m => this.map.removeLayer(m));
    this.vehicleMarkers = [];
  }
}

window.EmergencyMapEngine = EmergencyMapEngine;
