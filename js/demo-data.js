/**
 * Smart Ambulance Traffic Signal System - Demo Data & Scenarios
 * Developed by Team Lifeline
 */

const DEMO_DATA = {
  systemInfo: {
    name: "SMART AMBULANCE TRAFFIC SIGNAL SYSTEM",
    team: "Team Lifeline",
    version: "2.4-PROTOTYPE",
    vehicleId: "AMB-LIFELINE-01",
    driverName: "Officer R. Sharma",
    paramedicName: "Paramedic S. Varma",
    baseStation: "Kamareddy Central Emergency Depot"
  },

  // Emergency Scenarios for Demonstration
  scenarios: [
    {
      id: "scenario-1",
      title: "NH-44 Bypass Multi-Vehicle Collision",
      severity: "CRITICAL",
      callTime: "11:42 AM",
      caller: {
        name: "Suresh Reddy",
        phone: "+91 98480 23145",
        relationship: "Passing Motorist",
        language: "Telugu / English"
      },
      rawCallerText: "Accident happened on national highway bypass road near Indian Oil petrol bunk and flyover pillar 42. A car hit a mini truck. Two people trapped inside the car, one person thrown out on the road bleeding heavily. Car engine is smoking. Please send ambulance immediately! There is already heavy traffic forming behind the truck.",
      aiAnalysis: {
        incidentType: "High-Speed Multi-Vehicle Collision",
        peopleInvolved: 3,
        conditions: [
          { person: "Person 1 (Driver)", status: "Trapped, conscious, chest pain & severe bleeding", triage: "RED (Immediate)" },
          { person: "Person 2 (Passenger)", status: "Trapped, unresponsive, suspected head trauma", triage: "RED (Immediate)" },
          { person: "Person 3 (Ejected)", status: "On roadside, conscious, compound leg fracture & severe laceration", triage: "YELLOW (Urgent)" }
        ],
        hazards: ["Vehicle engine smoking (Fire hazard)", "High-speed highway traffic congestion developing", "Spinal injury risk from impact"],
        identifiedLandmarks: ["Indian Oil Petrol Bunk", "Flyover Pillar 42", "Kamareddy NH-44 Bypass Junction"],
        aiSummary: "CRITICAL INCIDENT: 3 casualties (2 trapped, 1 ejected). Multiple high-severity trauma cases requiring hydraulic extrication standby and advanced trauma life support. Nearest accessible point is via NH-44 North Ramp."
      },
      firstAidSMS: {
        recipient: "+91 98480 23145",
        text: "[EMERGENCY FIRST AID - Team Lifeline]: Ambulance AMB-01 is en route (ETA ~6 min).\n1. SAFETY FIRST: Keep other vehicles back; do not smoke near smoking engine.\n2. BLEEDING: Press clean cloth firmly on bleeding wounds of the roadside person.\n3. DO NOT MOVE trapped victims inside the car unless fire starts (suspected spinal trauma).\n4. KEEP AIRWAYS OPEN: If person is breathing, do not twist their neck.\nWe will reach shortly. Stay on the line if possible.",
        sentTimestamp: "11:43:05 AM"
      },
      location: {
        name: "NH-44 Highway Bypass, Near Pillar 42 & Indian Oil Pump",
        lat: 18.3312,
        lng: 78.3445,
        uncertaintyRadiusMeters: 45,
        confidenceScore: "96%",
        landmarks: [
          { name: "Indian Oil Petrol Station", dist: "120m North", lat: 18.3320, lng: 78.3440 },
          { name: "Kamareddy Bypass Flyover (Pillar 42)", dist: "35m South", lat: 18.3308, lng: 78.3448 },
          { name: "Toll Plaza Access Road", dist: "450m East", lat: 18.3295, lng: 78.3480 }
        ]
      },
      startPosition: {
        name: "Kamareddy Central Ambulance Depot",
        lat: 18.3180,
        lng: 78.3350
      },
      routes: [
        {
          id: "route-alpha",
          name: "Route Alpha (NH-44 Express Corridor)",
          recommended: true,
          badge: "AI RECOMMENDED",
          distanceKm: 4.2,
          normalEtaMin: 11.5,
          emergencyEtaMin: 5.8,
          trafficStatus: "Fluid with Smart Corridor",
          congestionScore: 22,
          signalsCount: 3,
          description: "Direct highway flyover corridor with automated RF signal clearing at Station Road, Market Junction, and Bypass Cross.",
          color: "#10b981", // Emerald green
          coordinates: [
            [18.3180, 78.3350],
            [18.3205, 78.3370],
            [18.3235, 78.3392],
            [18.3265, 78.3415],
            [18.3290, 78.3432],
            [18.3312, 78.3445]
          ],
          signals: [
            { id: "SIG-01", name: "Station Road Junction", lat: 18.3205, lng: 78.3370, distM: 400, defaultState: "RED", priorityState: "GREEN_WAVE" },
            { id: "SIG-02", name: "Old Bus Stand Cross", lat: 18.3245, lng: 78.3400, distM: 1100, defaultState: "RED", priorityState: "GREEN_WAVE" },
            { id: "SIG-03", name: "Bypass Flyover Interchange", lat: 18.3290, lng: 78.3432, distM: 2600, defaultState: "RED", priorityState: "GREEN_WAVE" }
          ]
        },
        {
          id: "route-beta",
          name: "Route Beta (Subash Road Arterial)",
          recommended: false,
          badge: "ALTERNATIVE 1",
          distanceKm: 4.8,
          normalEtaMin: 14.0,
          emergencyEtaMin: 8.2,
          trafficStatus: "Moderate Traffic / Market Queues",
          congestionScore: 54,
          signalsCount: 5,
          description: "Via Subash Road and Town Center. 2 additional manual traffic signals and pedestrian density.",
          color: "#f59e0b", // Amber
          coordinates: [
            [18.3180, 78.3350],
            [18.3195, 78.3325],
            [18.3225, 78.3320],
            [18.3255, 78.3340],
            [18.3285, 78.3385],
            [18.3305, 78.3420],
            [18.3312, 78.3445]
          ],
          signals: [
            { id: "SIG-B1", name: "Gandhi Chowk Junction", lat: 18.3195, lng: 78.3325, distM: 550, defaultState: "RED", priorityState: "GREEN_WAVE" },
            { id: "SIG-B2", name: "Subash Road Center", lat: 18.3235, lng: 78.3330, distM: 1400, defaultState: "RED", priorityState: "GREEN_WAVE" },
            { id: "SIG-B3", name: "North Market Cross", lat: 18.3285, lng: 78.3385, distM: 2700, defaultState: "RED", priorityState: "GREEN_WAVE" }
          ]
        },
        {
          id: "route-gamma",
          name: "Route Gamma (Outer Ring Link)",
          recommended: false,
          badge: "ALTERNATIVE 2",
          distanceKm: 6.1,
          normalEtaMin: 16.5,
          emergencyEtaMin: 10.4,
          trafficStatus: "High Distance / Railway Crossing Risk",
          congestionScore: 68,
          signalsCount: 4,
          description: "Avoids town core completely via East Link, but encounters level-crossing risk and longer distance.",
          color: "#3b82f6", // Blue
          coordinates: [
            [18.3180, 78.3350],
            [18.3165, 78.3410],
            [18.3200, 78.3460],
            [18.3250, 78.3485],
            [18.3295, 78.3465],
            [18.3312, 78.3445]
          ],
          signals: [
            { id: "SIG-G1", name: "Railway Gate Crossing", lat: 18.3200, lng: 78.3460, distM: 1600, defaultState: "RED", priorityState: "GREEN_WAVE" },
            { id: "SIG-G2", name: "East Outer Cross", lat: 18.3270, lng: 78.3475, distM: 3200, defaultState: "RED", priorityState: "GREEN_WAVE" }
          ]
        }
      ]
    },
    {
      id: "scenario-2",
      title: "Clock Tower Market Pedestrian Incident",
      severity: "URGENT",
      callTime: "11:50 AM",
      caller: {
        name: "Laxmi Devi",
        phone: "+91 94401 77821",
        relationship: "Shopkeeper",
        language: "Telugu"
      },
      rawCallerText: "Near Clock Tower market, right in front of Balaji Sweet House. A two-wheeler skidded and knocked down an elderly pedestrian and a child. The elderly person is not opening eyes and bleeding from head. Child has hand injury and crying. Huge crowd gathered on the narrow road.",
      aiAnalysis: {
        incidentType: "Pedestrian Collision in Dense Commercial Zone",
        peopleInvolved: 2,
        conditions: [
          { person: "Person 1 (Elderly Pedestrian)", status: "Unconscious, active cranial laceration", triage: "RED (Immediate)" },
          { person: "Person 2 (Child)", status: "Conscious, wrist fracture & superficial abrasions", triage: "YELLOW (Urgent)" }
        ],
        hazards: ["High pedestrian congestion", "Narrow bazaar street", "Commercial vehicle loading bottlenecks"],
        identifiedLandmarks: ["Clock Tower Circle", "Balaji Sweet House", "Main Market Arch"],
        aiSummary: "URGENT INCIDENT: 2 casualties (1 unconscious geriatric head trauma, 1 pediatric fracture). Severe market crowd congestion requires loud siren and speaker clearance alert."
      },
      firstAidSMS: {
        recipient: "+91 94401 77821",
        text: "[EMERGENCY FIRST AID - Team Lifeline]: Ambulance AMB-01 is en route.\n1. HEAD INJURY: Gently elevate head slightly with a folded cloth, DO NOT pour water in mouth.\n2. CROWD CONTROL: Ask bystanders to step back 10 feet to give fresh air.\n3. BLEEDING: Gently press clean handkerchief to head cut.\n4. CHILD: Keep child calm, support injured arm with cloth sling.\nHelp is arriving in 5 minutes.",
        sentTimestamp: "11:51:10 AM"
      },
      location: {
        name: "Clock Tower Market Circle, Opp. Balaji Sweets",
        lat: 18.3250,
        lng: 78.3380,
        uncertaintyRadiusMeters: 25,
        confidenceScore: "98%",
        landmarks: [
          { name: "Clock Tower Heritage Pillar", dist: "20m West", lat: 18.3251, lng: 78.3377 },
          { name: "Balaji Sweet House", dist: "10m East", lat: 18.3249, lng: 78.3382 }
        ]
      },
      startPosition: {
        name: "Kamareddy Central Ambulance Depot",
        lat: 18.3180,
        lng: 78.3350
      },
      routes: [
        {
          id: "route-alpha",
          name: "Route Alpha (Station Road Direct Link)",
          recommended: true,
          badge: "AI RECOMMENDED",
          distanceKm: 2.1,
          normalEtaMin: 7.0,
          emergencyEtaMin: 3.4,
          trafficStatus: "Moderate Traffic / Cleared with RF Corridor",
          congestionScore: 35,
          signalsCount: 2,
          description: "Quickest straight route via Station Road with automated RF traffic signal preemption.",
          color: "#10b981",
          coordinates: [
            [18.3180, 78.3350],
            [18.3205, 78.3365],
            [18.3230, 78.3375],
            [18.3250, 78.3380]
          ],
          signals: [
            { id: "SIG-01", name: "Station Road Junction", lat: 18.3205, lng: 78.3365, distM: 380, defaultState: "RED", priorityState: "GREEN_WAVE" },
            { id: "SIG-02", name: "Market Entry Arch Signal", lat: 18.3235, lng: 78.3376, distM: 850, defaultState: "RED", priorityState: "GREEN_WAVE" }
          ]
        },
        {
          id: "route-beta",
          name: "Route Beta (Temple Lane Bypass)",
          recommended: false,
          badge: "ALTERNATIVE 1",
          distanceKm: 2.9,
          normalEtaMin: 9.5,
          emergencyEtaMin: 5.1,
          trafficStatus: "Moderate",
          congestionScore: 48,
          signalsCount: 3,
          description: "Circumnavigates the dense bazaar entrance via Temple lane.",
          color: "#f59e0b",
          coordinates: [
            [18.3180, 78.3350],
            [18.3190, 78.3395],
            [18.3225, 78.3410],
            [18.3250, 78.3380]
          ],
          signals: [
            { id: "SIG-B1", name: "Temple Road Junction", lat: 18.3210, lng: 78.3405, distM: 700, defaultState: "RED", priorityState: "GREEN_WAVE" }
          ]
        }
      ]
    }
  ],

  // Hospital Database for Phase 2: Hospital Journey
  hospitals: [
    {
      id: "HOSP-01",
      name: "Government Area Hospital, Kamareddy",
      type: "District General & Trauma Center",
      lat: 18.3280,
      lng: 78.3310,
      distanceFromIncidentKm: 2.8,
      emergencyEtaMin: 4.5,
      emergencyCorridorReady: true,
      signalsCount: 2,
      capabilities: {
        icuBedsAvailable: 6,
        ventilators: 4,
        traumaOT: "READY (2 Units)",
        bloodBank: "O+, O-, B+, A+ Stocked",
        burnsUnit: false,
        cathLab: false,
        ctScan24x7: true
      },
      doctorOnDuty: "Dr. K. Srinivas (General Surgeon) & Trauma Team Alpha",
      matchScore: 94,
      matchReason: "Closest equipped hospital for multi-trauma stabilization, available ICU beds, immediate OT readiness.",
      recommended: true
    },
    {
      id: "HOSP-02",
      name: "Lifeline Superspeciality Hospital",
      type: "Tertiary Care & Advanced Neurosurgery",
      lat: 18.3360,
      lng: 78.3510,
      distanceFromIncidentKm: 4.1,
      emergencyEtaMin: 6.2,
      emergencyCorridorReady: true,
      signalsCount: 3,
      capabilities: {
        icuBedsAvailable: 12,
        ventilators: 8,
        traumaOT: "READY (3 Units)",
        bloodBank: "Full stocks all groups",
        burnsUnit: true,
        cathLab: true,
        ctScan24x7: true
      },
      doctorOnDuty: "Dr. Ananya Rao (Neurosurgeon) & Critical Care Team",
      matchScore: 91,
      matchReason: "Ideal for severe head injuries requiring neurosurgical intervention, burn care, and advanced catheterization.",
      recommended: false
    },
    {
      id: "HOSP-03",
      name: "Sanjeevani Community Health Center",
      type: "Primary Emergency Stabilization",
      lat: 18.3140,
      lng: 78.3260,
      distanceFromIncidentKm: 3.5,
      emergencyEtaMin: 5.8,
      emergencyCorridorReady: true,
      signalsCount: 2,
      capabilities: {
        icuBedsAvailable: 1,
        ventilators: 1,
        traumaOT: "Basic Surgical Suite",
        bloodBank: "Limited",
        burnsUnit: false,
        cathLab: false,
        ctScan24x7: false
      },
      doctorOnDuty: "Dr. M. Naveen (Medical Officer)",
      matchScore: 68,
      matchReason: "Limited surgical capability for severe multi-casualty trauma; suitable only for minor injuries.",
      recommended: false
    }
  ],

  // 17-Step Guided Demonstration Sequence
  demoSteps: [
    {
      step: 1,
      title: "1. Emergency Call Received",
      desc: "Emergency dispatcher receives an incoming distress call reporting a severe multi-vehicle collision near NH-44 bypass.",
      actionHint: "Inspect caller raw details in the left panel."
    },
    {
      step: 2,
      title: "2. Collect Emergency Information",
      desc: "System ingests raw caller notes, caller phone, landmark cues, number of injured, and hazard warnings.",
      actionHint: "Original caller notes displayed with complete transparency."
    },
    {
      step: 3,
      title: "3. AI Summarizes Information & First Aid SMS",
      desc: "AI organizes raw data into categorized triage conditions without hallucinating unverified medical claims. System immediately sends verified SMS first aid guidance to caller.",
      actionHint: "View the AI Emergency Summary card and check the SMS status."
    },
    {
      step: 4,
      title: "4. Identify Accurate Location & Uncertainty",
      desc: "System triangulates landmark cues (Pillar 42, Indian Oil pump) + cellular GPS to fix coordinates with an explicit 45m uncertainty radius.",
      actionHint: "Notice the circular uncertainty boundary on the interactive map."
    },
    {
      step: 5,
      title: "5. Generate 2–3 Possible Routes",
      desc: "Algorithms compute 3 distinct paths: Route Alpha (Expressway), Route Beta (Market Arterial), Route Gamma (Ring Road).",
      actionHint: "Routes rendered in Green, Amber, and Blue on map."
    },
    {
      step: 6,
      title: "6. Analyze Traffic & Travel Time",
      desc: "AI evaluates current congestion, historical patterns, number of traffic signals, and estimated emergency transit times.",
      actionHint: "Compare route scores and ETA metrics in Route Comparison."
    },
    {
      step: 7,
      title: "7. Automatically Select Suitable Route",
      desc: "System selects Route Alpha (NH-44 Express Corridor, 5.8 min ETA) as the optimal emergency path.",
      actionHint: "Selected route glows prominently on the HUD and map."
    },
    {
      step: 8,
      title: "8. Create Dynamic Emergency Corridor",
      desc: "A dynamic 50-meter safety corridor envelope is established along Route Alpha, locking upcoming infrastructure into priority standby.",
      actionHint: "Pulsing green corridor polygon active on the map."
    },
    {
      step: 9,
      title: "9. Alert Traffic Signals (RF / V2X)",
      desc: "RF 433 MHz transmission packets broadcast ambulance telemetry to roadside receivers, prepping controllers for preemptive green wave.",
      actionHint: "Look at the Upcoming Signals panel and RF Tx status."
    },
    {
      step: 10,
      title: "10. Alert Connected Vehicles & Mobiles",
      desc: "V2X broadcast issues 'AMBULANCE APPROACHING — PLEASE GIVE WAY SAFELY' alert to 34 nearby connected vehicles in the corridor.",
      actionHint: "Vehicle & Mobile Alert indicator counts active receivers."
    },
    {
      step: 11,
      title: "11. Trigger Alert Speaker Audio",
      desc: "Physical prototype junction alert speaker broadcasts synthesized audible warning: 'Emergency ambulance approaching. Please give way safely.'",
      actionHint: "Listen to the browser speaker speech audio output!"
    },
    {
      step: 12,
      title: "12. Ambulance Travels Along Corridor",
      desc: "Ambulance begins navigation. Live GPS moves along route, signals transition to Green Wave on approach and return to normal after passing.",
      actionHint: "Watch ambulance icon advance and ETA decrement."
    },
    {
      step: 13,
      title: "13. Detect Traffic Blockage Ahead",
      desc: "Sensors detect a sudden stalled truck blocking NH-44 Express interchange! Traffic speed drops to 0 km/h.",
      actionHint: "Simulated obstacle appears on map with high congestion warning."
    },
    {
      step: 14,
      title: "14. Recalculate Route Dynamically",
      desc: "System triggers immediate re-routing: 'ROUTE UPDATED — Reason: Heavy congestion detected ahead. Switched to Route Beta.'",
      actionHint: "Audio alert chimes and HUD switches to new optimal corridor."
    },
    {
      step: 15,
      title: "15. Reach Emergency Location",
      desc: "Ambulance arrives safely at the accident scene. Driver transitions status to 'Scene Reached / Patient Assessment'.",
      actionHint: "Left panel transforms into Patient Triage & Assessment tool."
    },
    {
      step: 16,
      title: "16. Assess Patient & Select Suitable Hospital",
      desc: "Emergency team inputs patient medical requirements (Trauma OT + ICU). AI recommends Govt Area Hospital Kamareddy (4.5 min away).",
      actionHint: "Review hospital capability matrix and confirm destination."
    },
    {
      step: 17,
      title: "17. Activate Hospital Corridor & Arrive",
      desc: "System generates second emergency corridor from accident scene to hospital. Signals pre-cleared. Handover completed successfully!",
      actionHint: "Cycle complete! Demonstrates end-to-end journey coordination."
    }
  ]
};

// Export to window for global access
window.DEMO_DATA = DEMO_DATA;
