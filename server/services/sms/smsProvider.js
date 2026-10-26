/**
 * Team Lifeline V2 - Modular SMS Provider Dispatcher
 * Dispatches via Twilio SMS API when configured, or delegates to MockSmsProvider.
 */

const config = require('../../config');
const MockSmsProvider = require('./mockSms');

class SmsService {
  constructor() {
    this.providerName = config.sms.provider;
    this.isSimulation = config.simulationMode || this.providerName === 'mock';
  }

  /**
   * Constructs the canonical emergency tracking message.
   */
  formatMessage({ trackingUrl, otp }) {
    return `Team Lifeline demo: Your emergency request has been registered. Open ${trackingUrl} and enter OTP ${otp} to view the ambulance status. If this is a real emergency, continue contacting official emergency services as appropriate.`;
  }

  /**
   * Send an emergency SMS with tracking link and OTP.
   */
  async sendTrackingSms({ to, caseId, trackingToken, otp, customBaseUrl = null }) {
    const baseUrl = customBaseUrl || config.baseUrl;
    const trackingUrl = `${baseUrl}/victim.html?invite=${trackingToken}`;
    const message = this.formatMessage({ trackingUrl, otp });

    // Validate phone number format (basic international check)
    const cleanPhone = String(to || '').trim();
    if (!cleanPhone) {
      return {
        success: false,
        error: 'Recipient phone number is required',
        simulated: this.isSimulation
      };
    }

    // Check if live Twilio provider is configured
    if (!this.isSimulation && this.providerName === 'twilio') {
      return await this.sendTwilioSms({ to: cleanPhone, message, caseId });
    }

    // Otherwise use Mock provider
    const result = await MockSmsProvider.send({
      to: cleanPhone,
      message,
      caseId,
      metadata: { trackingUrl, otp }
    });

    return {
      ...result,
      trackingUrl,
      otp, // Included internally for simulation UI only
      message
    };
  }

  /**
   * Real Twilio REST API integration using Node native fetch
   */
  async sendTwilioSms({ to, message, caseId }) {
    const { accountSid, authToken, phoneNumber } = config.telephony;

    if (!accountSid || !authToken || !phoneNumber) {
      console.warn('[SMS] Twilio credentials incomplete. Falling back to simulation mode.');
      return await MockSmsProvider.send({ to, message, caseId });
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const body = new URLSearchParams({
        To: to,
        From: phoneNumber,
        Body: message
      });

      const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Twilio HTTP error ${response.status}`);
      }

      return {
        success: true,
        simulated: false,
        provider: 'twilio',
        messageId: data.sid,
        status: data.status,
        to,
        message
      };
    } catch (err) {
      console.error('[SMS ERROR] Twilio dispatch failed:', err.message);
      // Fallback to mock log so demo doesn't crash
      const fallbackResult = await MockSmsProvider.send({
        to,
        message,
        caseId,
        metadata: { error: err.message }
      });
      return {
        ...fallbackResult,
        warning: `Twilio delivery failed (${err.message}); simulated fallback recorded.`
      };
    }
  }

  getRecentSimulatedMessages(limit = 10) {
    return MockSmsProvider.getRecentMessages(limit);
  }
}

module.exports = new SmsService();
