/**
 * Shared State Manager between Ambulance Dashboard & Patient Portal
 * Developed by Team Lifeline
 */

const SHARED_EMERGENCY_STATE = {
  caseId: "EM-402",
  incidentTitle: "NH-44 Bypass Multi-Vehicle Collision",
  callerName: "Suresh Reddy",
  callerPhone: "+91 98480 23145",
  incidentLocation: {
    name: "NH-44 Highway Bypass, Near Pillar 42 & Indian Oil Pump",
    lat: 18.3312,
    lng: 78.3445,
    landmarks: "Near Indian Oil Petrol Pump & Flyover Pillar 42"
  },
  ambulance: {
    id: "AMB-LIFELINE-01",
    driverName: "Officer R. Sharma",
    phone: "+91 99081 12340",
    lat: 18.3180,
    lng: 78.3350,
    speedKmH: 0,
    etaMinutes: 5.8,
    distanceKm: 4.2,
    status: "DISPATCHED" // DISPATCHED -> EN_ROUTE -> AT_SCENE -> TRANSPORTING_HOSPITAL -> COMPLETED
  },
  selectedRoute: {
    name: "Route Alpha (NH-44 Express)",
    trafficLightsCount: 3,
    vehiclesInCorridor: 34,
    distanceKm: 4.2,
    estimatedMinutes: 5.8
  },
  routesList: [
    {
      id: "route-alpha",
      name: "Route Alpha (NH-44 Express)",
      recommended: true,
      distanceKm: 4.2,
      travelTimeMin: 5.8,
      trafficSignalsCount: 3,
      vehiclesCount: 34,
      roadCondition: "Fluid / High-Speed Corridor",
      corridorClearance: "Automated RF Green Wave Preemption",
      color: "#10b981",
      coordinates: [
        [18.3180, 78.3350],
        [18.3205, 78.3370],
        [18.3235, 78.3392],
        [18.3265, 78.3415],
        [18.3290, 78.3432],
        [18.3312, 78.3445]
      ]
    },
    {
      id: "route-beta",
      name: "Route Beta (Subash Road Arterial)",
      recommended: false,
      distanceKm: 4.8,
      travelTimeMin: 8.2,
      trafficSignalsCount: 5,
      vehiclesCount: 68,
      roadCondition: "Moderate Traffic / Market Crossings",
      corridorClearance: "Semi-Automated",
      color: "#f59e0b",
      coordinates: [
        [18.3180, 78.3350],
        [18.3195, 78.3325],
        [18.3225, 78.3320],
        [18.3255, 78.3340],
        [18.3285, 78.3385],
        [18.3305, 78.3420],
        [18.3312, 78.3445]
      ]
    },
    {
      id: "route-gamma",
      name: "Route Gamma (Outer Ring Link)",
      recommended: false,
      distanceKm: 6.1,
      travelTimeMin: 10.4,
      trafficSignalsCount: 4,
      vehiclesCount: 22,
      roadCondition: "Long Distance / Level Crossing Risk",
      corridorClearance: "Manual",
      color: "#3b82f6",
      coordinates: [
        [18.3180, 78.3350],
        [18.3165, 78.3410],
        [18.3200, 78.3460],
        [18.3250, 78.3485],
        [18.3295, 78.3465],
        [18.3312, 78.3445]
      ]
    }
  ],
  nearbyHospitals: [
    {
      id: "HOSP-01",
      name: "Government Area Hospital, Kamareddy",
      type: "District General & Trauma Hospital",
      distanceKm: 2.8,
      etaMin: 4.5,
      trafficSignalsCount: 2,
      vehiclesCount: 18,
      icuBeds: 6,
      traumaOT: "READY (2 Units)",
      bloodBank: "O+, A+, B+ Available",
      recommended: true,
      lat: 18.3280,
      lng: 78.3310
    },
    {
      id: "HOSP-02",
      name: "Lifeline Superspeciality Hospital",
      type: "Tertiary Multi-Specialty & Neuro Center",
      distanceKm: 4.1,
      etaMin: 6.2,
      trafficSignalsCount: 3,
      vehiclesCount: 29,
      icuBeds: 12,
      traumaOT: "READY (3 Units)",
      bloodBank: "All Groups Stocked",
      recommended: false,
      lat: 18.3360,
      lng: 78.3510
    },
    {
      id: "HOSP-03",
      name: "Sanjeevani Community Health Center",
      type: "Primary Stabilization Center",
      distanceKm: 3.5,
      etaMin: 5.8,
      trafficSignalsCount: 2,
      vehiclesCount: 12,
      icuBeds: 1,
      traumaOT: "Basic Minor Suite",
      bloodBank: "Limited",
      recommended: false,
      lat: 18.3140,
      lng: 78.3260
    }
  ],
  messages: [
    {
      sender: "AMBULANCE",
      text: "Ambulance AMB-01 dispatched with priority green corridor. ETA ~5.8 mins. Please stay calm.",
      time: "11:42 AM"
    }
  ]
};

// Export to window
window.SHARED_EMERGENCY_STATE = SHARED_EMERGENCY_STATE;
