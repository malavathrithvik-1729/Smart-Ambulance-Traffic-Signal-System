/**
 * Team Lifeline V2 - Emergency Extraction Service
 * Extracts structured triage fields from call transcripts using rule-based pattern matching.
 * Conservative, safety-first: flags uncertain fields and does NOT perform medical diagnosis.
 */

// Known demonstration geographical coordinates for Kamareddy, Telangana
const KNOWN_LANDMARKS = [
  {
    name: 'Kamareddy Clock Tower',
    aliases: ['clock tower', 'ghanta ghar', 'tower center'],
    lat: 18.3242,
    lng: 78.3394
  },
  {
    name: 'NH44 Highway Junction',
    aliases: ['nh44', 'nh 44', 'highway', 'bypass', 'hyderabad road'],
    lat: 18.3300,
    lng: 78.3450
  },
  {
    name: 'Kamareddy Railway Station',
    aliases: ['railway station', 'station road', 'train station'],
    lat: 18.3180,
    lng: 78.3360
  },
  {
    name: 'SPR High School, Kamareddy',
    aliases: ['spr high school', 'spr school', 'school ground'],
    lat: 18.3225,
    lng: 78.3375
  },
  {
    name: 'Municipal Park',
    aliases: ['municipal park', 'city park', 'gandhi park'],
    lat: 18.3260,
    lng: 78.3410
  },
  {
    name: 'Government Area Hospital',
    aliases: ['area hospital', 'govt hospital', 'civil hospital'],
    lat: 18.3210,
    lng: 78.3340
  }
];

class EmergencyExtractionService {
  /**
   * Analyse transcript text and extract structured dispatch fields.
   */
  extract(rawText, callerContact = '') {
    const text = String(rawText || '').trim();
    const lower = text.toLowerCase();

    // 1. Identify Location & Landmarks
    let detectedLocation = 'Kamareddy Town';
    let detectedLat = 18.3242;
    let detectedLng = 78.3394;
    let detectedLandmark = '';
    let locationConfirmed = false;

    for (const landmark of KNOWN_LANDMARKS) {
      for (const alias of landmark.aliases) {
        if (lower.includes(alias)) {
          detectedLocation = landmark.name;
          detectedLat = landmark.lat;
          detectedLng = landmark.lng;
          detectedLandmark = landmark.name;
          locationConfirmed = true;
          break;
        }
      }
      if (locationConfirmed) break;
    }

    // 2. Identify Incident Type & Severity
    let incidentType = 'road_accident';
    let severity = 'moderate';
    let reportedCondition = 'Emergency distress reported';
    let safetyInfo = 'Maintain clear perimeter';

    if (lower.includes('crash') || lower.includes('accident') || lower.includes('collision') || lower.includes('hit')) {
      incidentType = 'road_accident';
      severity = 'critical';
      reportedCondition = 'Vehicle collision trauma reported';
      safetyInfo = 'Watch for traffic hazards & fuel spill';
    } else if (lower.includes('heart') || lower.includes('chest pain') || lower.includes('cardiac') || lower.includes('breath')) {
      incidentType = 'cardiac';
      severity = 'critical';
      reportedCondition = 'Severe chest pain / breathing difficulty';
      safetyInfo = 'Keep patient seated, ensure ventilation';
    } else if (lower.includes('bleed') || lower.includes('blood') || lower.includes('cut')) {
      incidentType = 'bleeding';
      severity = 'critical';
      reportedCondition = 'Active trauma hemorrhage reported';
      safetyInfo = 'Direct pressure required';
    } else if (lower.includes('unconscious') || lower.includes('passed out') || lower.includes('fainted')) {
      incidentType = 'unconscious';
      severity = 'critical';
      reportedCondition = 'Unresponsive patient';
      safetyInfo = 'Check airway, recovery position if breathing';
    } else if (lower.includes('burn') || lower.includes('fire')) {
      incidentType = 'burns';
      severity = 'critical';
      reportedCondition = 'Thermal burns';
      safetyInfo = 'Extinguish flames, cool with clean water';
    } else if (lower.includes('fall') || lower.includes('fracture') || lower.includes('broken')) {
      incidentType = 'fall_injury';
      severity = 'moderate';
      reportedCondition = 'Suspected musculoskeletal fracture / fall trauma';
      safetyInfo = 'Do not move injured limbs';
    }

    // 3. Extract Victim Count
    let victimCount = 1;
    const countMatches = lower.match(/(\d+)\s*(people|person|victims?|patients?|injured)/i);
    if (countMatches && countMatches[1]) {
      victimCount = parseInt(countMatches[1], 10);
    } else if (lower.includes('two') || lower.includes('both')) {
      victimCount = 2;
    } else if (lower.includes('three')) {
      victimCount = 3;
    } else if (lower.includes('multiple') || lower.includes('crowd')) {
      victimCount = 4;
    }

    // 4. Identify Unconfirmed & Missing Fields
    const unconfirmedFields = [];
    if (!locationConfirmed) {
      unconfirmedFields.push('exact_street_coordinates');
    }
    if (!lower.includes('conscious') && !lower.includes('unconscious') && !lower.includes('breathing')) {
      unconfirmedFields.push('consciousness_status');
    }
    if (!callerContact) {
      unconfirmedFields.push('caller_phone_number');
    }

    // 5. Driver Summary
    const driverSummary = `${severity.toUpperCase()}: ${incidentType.replace('_', ' ').toUpperCase()} at ${detectedLocation}. ${victimCount} victim(s). ${reportedCondition}.`;

    // 6. Extraction Confidence
    let confidence = 0.7;
    if (locationConfirmed) confidence += 0.2;
    if (unconfirmedFields.length === 0) confidence += 0.1;

    return {
      incidentDescription: text || 'Emergency incident reported via phone call intake.',
      incidentType,
      severity,
      incidentLocation: detectedLocation,
      latitude: detectedLat,
      longitude: detectedLng,
      landmarks: detectedLandmark,
      callerContact: callerContact || '',
      victimCount,
      reportedCondition,
      safetyInfo,
      unconfirmedFields,
      driverSummary,
      extractionConfidence: Math.min(1.0, confidence),
      locationConfirmed
    };
  }
}

module.exports = new EmergencyExtractionService();
