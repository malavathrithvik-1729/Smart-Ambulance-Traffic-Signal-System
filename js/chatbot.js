/**
 * First-Aid AI Chatbot Engine
 * Developed by Team Lifeline for Patient Emergency Portal
 */

const FIRST_AID_KNOWLEDGE = {
  bleeding: {
    title: "🩸 Severe Bleeding Control",
    steps: [
      "1. APPLY DIRECT PRESSURE: Take a clean cloth, towel, or sterile gauze and press FIRMLY directly over the wound.",
      "2. MAINTAIN PRESSURE: Do not lift the cloth to check. If blood soaks through, add another cloth on top and keep pressing.",
      "3. ELEVATE: If an arm or leg is bleeding and not broken, gently raise it above heart level while continuing to press.",
      "4. CALM THE VICTIM: Keep the person lying down and covered with a jacket to prevent shock.",
      "Ambulance is en route. Do not apply a tourniquet unless trained and bleeding cannot be stopped by direct pressure."
    ]
  },
  unconscious: {
    title: "🫀 Unconscious / Unresponsive Person",
    steps: [
      "1. CHECK BREATHING: Look at their chest for rise and fall, and listen for breathing for 5 seconds.",
      "2. IF BREATHING: Carefully place them on their side in the RECOVERY POSITION to keep the airway open and prevent choking.",
      "3. IF NOT BREATHING: Place hands in the center of the chest and push hard and fast (100–120 beats per minute, to the beat of 'Stayin' Alive').",
      "4. DO NOT GIVE WATER: Never attempt to give water, food, or medicines to an unconscious person.",
      "5. DO NOT SHAKE: If there was a crash, keep their neck still in case of spinal injury."
    ]
  },
  cpr: {
    title: "⚡ Hands-Only CPR Instructions",
    steps: [
      "1. POSITION: Kneel beside the person. Place the heel of one hand in the center of the chest, place your other hand on top and interlock fingers.",
      "2. COMPRESS: Keep your arms straight and push hard and fast. Push down at least 2 inches (5 cm).",
      "3. RATE: Pump at 100 to 120 compressions per minute without stopping.",
      "4. DO NOT STOP: Continue until the ambulance paramedics arrive or the person starts breathing normally."
    ]
  },
  fracture: {
    title: "🦴 Suspected Broken Bone / Fracture",
    steps: [
      "1. DO NOT MOVE: Keep the injured limb in the exact position you found it.",
      "2. DO NOT TRY TO STRAIGHTEN: Never try to push bone back or straighten a crooked limb.",
      "3. SUPPORT: Place rolled jackets, blankets, or cushions around the limb to prevent it from moving.",
      "4. ICE/COOL: If you have an ice pack, wrap it in a cloth and hold it against the swelling (do not put ice directly on skin).",
      "5. STOP BLEEDING: If skin is broken, gently press clean gauze around the wound."
    ]
  },
  car_crash: {
    title: "🚗 Vehicle Crash & Fire Safety",
    steps: [
      "1. SCENE SAFETY: Watch out for oncoming traffic. Warn other drivers to slow down.",
      "2. TURN OFF IGNITION: If reachable safely, switch off vehicle keys to stop fuel pump.",
      "3. DO NOT MOVE VICTIMS: Unless the vehicle is actively on fire or submerged, DO NOT pull victims out! Moving them can cause permanent paralysis if their spine or neck is injured.",
      "4. REASSURE: Talk to trapped passengers, tell them the ambulance is arriving in minutes."
    ]
  },
  burns: {
    title: "🔥 Burn Injury First Aid",
    steps: [
      "1. COOL IMMEDIATELY: Run cool (not ice-cold) tap water gently over the burn for at least 10–20 minutes.",
      "2. REMOVE CONSTRICTIONS: Gently remove tight clothing, rings, or watches before swelling starts.",
      "3. DO NOT POP BLISTERS: Never break blister skin.",
      "4. NO HOME REMEDIES: Do NOT apply toothpaste, butter, oil, or turmeric—these cause infection.",
      "5. COVER LOOSELY: Cover with a clean, dry, non-stick cloth or plastic cling wrap."
    ]
  },
  choking: {
    title: "🫁 Choking Emergency",
    steps: [
      "1. ENCOURAGE COUGHING: If person can speak or cough loudly, let them cough.",
      "2. 5 BACK BLOWS: If cannot breathe, lean person forward and deliver 5 firm blows between shoulder blades with heel of hand.",
      "3. 5 ABDOMINAL THRUSTS (Heimlich): Stand behind person, wrap arms around waist, make a fist above navel, pull inward and upward.",
      "4. REPEAT: 5 back blows then 5 abdominal thrusts until object clears."
    ]
  }
};

class FirstAidChatbot {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.messages = [];
  }

  init() {
    this.addBotMessage(
      "Hello! I am the **Lifeline Emergency First-Aid Assistant**.\nAmbulance AMB-01 is en route to you.\n\nHow can I help you right now? Select an emergency quick topic below or type your question."
    );
  }

  handleUserQuery(queryText) {
    const text = queryText.trim();
    if (!text) return;

    this.addUserMessage(text);

    // Search knowledge base
    const lower = text.toLowerCase();
    setTimeout(() => {
      let response = null;

      if (lower.includes("bleed") || lower.includes("blood") || lower.includes("cut")) {
        response = FIRST_AID_KNOWLEDGE.bleeding;
      } else if (lower.includes("cpr") || lower.includes("heart") || lower.includes("chest compress")) {
        response = FIRST_AID_KNOWLEDGE.cpr;
      } else if (lower.includes("unconscious") || lower.includes("faint") || lower.includes("not breath") || lower.includes("passed out") || lower.includes("eyes")) {
        response = FIRST_AID_KNOWLEDGE.unconscious;
      } else if (lower.includes("fracture") || lower.includes("broken") || lower.includes("bone") || lower.includes("leg") || lower.includes("arm")) {
        response = FIRST_AID_KNOWLEDGE.fracture;
      } else if (lower.includes("car") || lower.includes("smoke") || lower.includes("trapped") || lower.includes("crash") || lower.includes("truck")) {
        response = FIRST_AID_KNOWLEDGE.car_crash;
      } else if (lower.includes("burn") || lower.includes("fire")) {
        response = FIRST_AID_KNOWLEDGE.burns;
      } else if (lower.includes("chok") || lower.includes("throat")) {
        response = FIRST_AID_KNOWLEDGE.choking;
      } else {
        // General reassuring answer
        response = {
          title: "ℹ️ Emergency Guidance",
          steps: [
            "1. STAY CALM: The ambulance is approaching and traffic lights are being turned green for rapid transit.",
            "2. DO NOT MOVE THE PATIENT if severe neck or back pain is suspected.",
            "3. KEEP AIRWAY CLEAR: Ensure person is breathing and loosen tight clothing around neck.",
            "4. KEEP WARM: Cover the patient with a blanket or cloth to prevent shock.",
            "Please click one of the quick emergency buttons above if there is active bleeding, unconsciousness, or a broken bone."
          ]
        };
      }

      const formatted = `### ${response.title}\n\n${response.steps.join("\n\n")}`;
      this.addBotMessage(formatted);
    }, 400);
  }

  addUserMessage(text) {
    this.renderMessage(text, "user");
  }

  addBotMessage(text) {
    this.renderMessage(text, "bot");
  }

  renderMessage(text, sender) {
    if (!this.container) return;

    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-bubble ${sender}`;

    // Simple markdown conversion
    let formattedText = text
      .replace(/### (.*)/g, '<div class="chat-heading">$1</div>')
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/\n\n/g, '<div style="margin: 6px 0;"></div>')
      .replace(/\n/g, '<br>');

    msgDiv.innerHTML = formattedText;
    this.container.appendChild(msgDiv);
    this.container.scrollTop = this.container.scrollHeight;
  }
}

window.FirstAidChatbot = FirstAidChatbot;
window.FIRST_AID_KNOWLEDGE = FIRST_AID_KNOWLEDGE;
