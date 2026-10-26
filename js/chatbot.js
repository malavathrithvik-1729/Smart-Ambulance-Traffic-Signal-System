/**
 * Team Lifeline — Centralized First-Aid AI Knowledge Base & Chatbot Engine (V2)
 * Single Source of Truth for Emergency Bystander First-Aid Guidance
 * Developed for SPR High School, Kamareddy — Smart Ambulance Traffic Signal System
 *
 * SAFETY NOTICE:
 * All instructions are conservative, standard bystander stabilization guidelines.
 * This assistant DOES NOT diagnose or replace professional medical care.
 * The primary ambulance dispatch remains active and unaffected by chat usage.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const mod = factory();
    root.FIRST_AID_KNOWLEDGE = mod.FIRST_AID_KNOWLEDGE;
    root.FIRST_AID_DISCLAIMER = mod.FIRST_AID_DISCLAIMER;
    root.findFirstAidTopic = mod.findFirstAidTopic;
    root.FirstAidChatbot = mod.FirstAidChatbot;
  }
})(typeof window !== 'undefined' ? window : this, function () {

  const FIRST_AID_DISCLAIMER = "⚠️ **EMERGENCY MEDICAL NOTICE**: This guidance is strictly for immediate bystander stabilization while the ambulance is en route. It does NOT replace medical evaluation. In India, call 108 (Ambulance) or 112 (Emergency).";

  const FIRST_AID_KNOWLEDGE = {
    bleeding: {
      key: "bleeding",
      label: "Bleeding",
      title: "🩸 Severe Bleeding Control",
      summary: "Apply continuous firm pressure. Elevate if uninjured.",
      steps: [
        "1. **APPLY DIRECT PRESSURE**: Take a clean cloth, sterile gauze, or clothing and press FIRMLY directly onto the wound.",
        "2. **DO NOT REMOVE CLOTH**: Maintain continuous pressure without lifting the cloth to check. If blood soaks through, add another cloth on top and press harder.",
        "3. **ELEVATE THE LIMB**: If an arm or leg is bleeding and does NOT appear broken, gently raise it above heart level while continuing to press.",
        "4. **PREVENT SHOCK**: Keep the patient lying down flat, calm, and covered with a jacket or blanket to keep them warm.",
        "5. **CAUTION**: Do NOT attempt improvised tourniquets unless trained and direct pressure completely fails."
      ],
      warning: "Do not probe inside deep wounds. Maintain continuous pressure until paramedics take over."
    },

    unconscious: {
      key: "unconscious",
      label: "Unconscious / Unresponsive",
      title: "🫀 Unconscious / Unresponsive Person",
      summary: "Assess breathing immediately. Clear airway and protect the spine.",
      steps: [
        "1. **CHECK BREATHING**: Look closely at the chest for rise and fall, and listen for breathing for 5 full seconds.",
        "2. **IF BREATHING NORMALLY**: Carefully roll the person onto their side into the **Recovery Position** to keep the airway open and prevent choking.",
        "3. **IF NOT BREATHING**: Immediately begin **Hands-Only CPR** (pump center of chest at 100–120 beats per minute).",
        "4. **STRICT SPINAL CAUTION**: If trauma or high-speed collision occurred, do NOT twist the neck or move the spine unless actively in a burning vehicle.",
        "5. **NEVER GIVE LIQUIDS**: Never pour water or put medicines in the mouth of an unconscious casualty."
      ],
      warning: "Never give water or food to someone who is semi-conscious or unresponsive."
    },

    cpr: {
      key: "cpr",
      label: "Hands-Only CPR",
      title: "⚡ Hands-Only CPR Instructions",
      summary: "Push hard and fast in the center of the chest (100–120 bpm).",
      steps: [
        "1. **POSITION**: Kneel directly beside the patient's chest. Place the heel of one hand in the center of the chest; place your other hand on top and interlock fingers.",
        "2. **BODY STANCE**: Lock elbows straight and position your shoulders directly above your hands.",
        "3. **RATE & DEPTH**: Push hard and fast — compress down 2 inches (5 cm) at 100–120 compressions per minute (to the beat of 'Stayin' Alive').",
        "4. **ALLOW RECOIL**: Allow the chest to fully return to normal height between each pump.",
        "5. **CONTINUE**: Do not stop until the paramedic team arrives and physically takes over."
      ],
      warning: "Effective compressions require firm, consistent pressure. Switch with another bystander if exhausted."
    },

    fracture: {
      key: "fracture",
      label: "Broken Bone / Fracture",
      title: "🦴 Suspected Broken Bone / Fracture",
      summary: "Immobilize the limb as found. Do not attempt to realign.",
      steps: [
        "1. **DO NOT MOVE OR STRAIGHTEN**: Keep the injured bone in the exact position you found it.",
        "2. **IMMOBILIZE**: Support the injured limb with rolled blankets, jackets, or pillows placed on either side.",
        "3. **OPEN FRACTURES**: If bone breaks through skin, DO NOT push it back. Cover gently with a clean cloth.",
        "4. **COLD PACK**: Apply ice wrapped in a towel to reduce swelling (never apply raw ice directly to bare skin).",
        "5. **MONITOR CIRCULATION**: Check that fingers or toes beyond the injury remain warm and have sensation."
      ],
      warning: "Never attempt to 'set' or straighten a visibly broken limb at the roadside."
    },

    car_crash: {
      key: "car_crash",
      label: "Car Crash / Fire Safety",
      title: "🚗 Vehicle Crash & Fire Safety",
      summary: "Ensure scene safety first. Protect cervical spine; do not pull victims out.",
      steps: [
        "1. **SCENE SAFETY**: Warn oncoming motorists to slow down. Keep onlookers at a safe distance from the roadway.",
        "2. **SWITCH OFF IGNITION**: If reachable safely without entering a crushed vehicle, turn the vehicle keys off to cut the fuel pump.",
        "3. **DO NOT EXTRACT VICTIMS**: Unless the car is actively burning or submerging in water, **LEAVE CASUALTIES INSIDE**. Pulling victims out can sever the spinal cord.",
        "4. **REASSURE & MONITOR**: Talk continuously to trapped victims. Let them know the ambulance is approaching with priority green corridor clearance."
      ],
      warning: "Traffic hazards kill roadside helpers. Always face oncoming traffic when assisting."
    },

    burns: {
      key: "burns",
      label: "Burns & Scalds",
      title: "🔥 Burn Injury First Aid",
      summary: "Cool with clean running water for 10–20 mins. Cover loosely.",
      steps: [
        "1. **COOL IMMEDIATELY**: Hold the burn under cool, clean running tap water for 10 to 20 minutes (do NOT use freezing ice or ice water).",
        "2. **REMOVE JEWELRY**: Gently remove rings, belts, or tight items before swelling occurs.",
        "3. **DO NOT PEEL STUCK CLOTHES**: Leave clothing that is melted or stuck to the skin.",
        "4. **DO NOT POP BLISTERS**: Keep blister skin intact to prevent severe infection.",
        "5. **NO HOME REMEDIES**: Avoid butter, oil, toothpaste, or turmeric. Cover loosely with a clean dry cloth or cling film."
      ],
      warning: "Chemical burns require 20 minutes of continuous water flushing. Keep patient warm."
    },

    choking: {
      key: "choking",
      label: "Choking Emergency",
      title: "🫁 Choking Emergency First Aid",
      summary: "5 firm back blows between shoulder blades followed by 5 abdominal thrusts.",
      steps: [
        "1. **ENCOURAGE COUGHING**: If the person can speak, cough loudly, or breathe, urge them to keep coughing.",
        "2. **5 BACK BLOWS**: Lean them forward and deliver 5 firm blows between shoulder blades with the heel of your hand.",
        "3. **5 ABDOMINAL THRUSTS (Heimlich)**: Stand behind them, make a fist above their navel, grasp with other hand, and pull sharply inward and upward.",
        "4. **REPEAT**: Alternate 5 back blows and 5 abdominal thrusts until the airway clears or help arrives.",
        "5. **IF UNRESPONSIVE**: Lower them carefully to the ground and begin chest compressions."
      ],
      warning: "Do not perform blind finger sweeps in the mouth unless an object is clearly visible and loose."
    }
  };

  /**
   * Matches freeform query text against first-aid knowledge categories
   */
  function findFirstAidTopic(queryText) {
    if (!queryText || typeof queryText !== 'string') {
      return null;
    }
    const lower = queryText.toLowerCase();

    if (lower.includes("bleed") || lower.includes("blood") || lower.includes("cut") || lower.includes("wound") || lower.includes("hemorrhag")) {
      return FIRST_AID_KNOWLEDGE.bleeding;
    }
    if (lower.includes("cpr") || lower.includes("chest compress") || lower.includes("cardiac") || lower.includes("heart attack") || lower.includes("pulse")) {
      return FIRST_AID_KNOWLEDGE.cpr;
    }
    if (lower.includes("unconscious") || lower.includes("faint") || lower.includes("not breath") || lower.includes("passed out") || lower.includes("coma") || lower.includes("unresponsive")) {
      return FIRST_AID_KNOWLEDGE.unconscious;
    }
    if (lower.includes("fractur") || lower.includes("broken") || lower.includes("bone") || lower.includes("dislocat") || lower.includes("sprain")) {
      return FIRST_AID_KNOWLEDGE.fracture;
    }
    if (lower.includes("crash") || lower.includes("car") || lower.includes("truck") || lower.includes("trapped") || lower.includes("collision") || lower.includes("smoke")) {
      return FIRST_AID_KNOWLEDGE.car_crash;
    }
    if (lower.includes("burn") || lower.includes("fire") || lower.includes("scald") || lower.includes("hot water") || lower.includes("flame")) {
      return FIRST_AID_KNOWLEDGE.burns;
    }
    if (lower.includes("chok") || lower.includes("throat") || lower.includes("swallow") || lower.includes("airway")) {
      return FIRST_AID_KNOWLEDGE.choking;
    }

    return null;
  }

  /**
   * UI Component for rendering chatbot messages
   */
  class FirstAidChatbot {
    constructor(containerId, options) {
      this.containerId = containerId;
      this.options = options || {};
      this.container = typeof document !== 'undefined' ? document.getElementById(containerId) : null;
      this.initialized = false;
    }

    init() {
      if (!this.container) {
        if (typeof document !== 'undefined') {
          this.container = document.getElementById(this.containerId);
        }
      }
      if (!this.container || this.initialized) return;
      this.initialized = true;

      this.addBotMessage(
        `Hello! I am the <b>Team Lifeline First-Aid Assistant</b>.<br>` +
        `Ambulance AMB-01 has been dispatched with priority green corridor.<br><br>` +
        `Tap any emergency category below or ask a specific first-aid question.`
      );
    }

    addUserMessage(text) {
      if (!text || !text.trim()) return;
      this.renderMessage(text.trim(), "user");
    }

    addBotMessage(html) {
      if (!html) return;
      this.renderMessage(html, "bot");
    }

    renderTopic(topicKey) {
      const item = FIRST_AID_KNOWLEDGE[topicKey];
      if (!item) return;

      const html = `<b>${item.title}</b><br>` +
        `<span style="color:#93c5fd;font-size:11px;">${item.summary}</span><br><br>` +
        item.steps.join("<br><br>") +
        `<br><br><span style="color:#fca5a5;font-size:10.5px;">⚠️ ${item.warning}</span>`;

      this.addBotMessage(html);
    }

    handleUserQuery(queryText) {
      const text = (queryText || '').trim();
      if (!text) return;

      this.addUserMessage(text);

      const matched = findFirstAidTopic(text);
      setTimeout(() => {
        if (matched) {
          this.renderTopic(matched.key);
        } else {
          this.addBotMessage(
            `<b>Emergency Guidance:</b><br>` +
            `1. Keep the patient calm, lying down, and warm.<br>` +
            `2. Ensure their airway is open and breathing is unimpeded.<br>` +
            `3. Do NOT move the patient if neck or spinal injury is suspected.<br>` +
            `4. Ambulance is en route. Select one of the quick buttons below for step-by-step guidance.`
          );
        }
      }, 300);
    }

    renderMessage(content, sender) {
      if (!this.container) return;

      const bubble = document.createElement("div");
      bubble.className = `chat-msg ${sender}`;

      // Convert common markdown patterns safely
      let formatted = content
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/### (.*)/g, '<div style="font-weight:bold;margin-bottom:4px;color:#38bdf8;">$1</div>');

      bubble.innerHTML = formatted;
      this.container.appendChild(bubble);
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  return {
    FIRST_AID_DISCLAIMER,
    FIRST_AID_KNOWLEDGE,
    findFirstAidTopic,
    FirstAidChatbot
  };
});
