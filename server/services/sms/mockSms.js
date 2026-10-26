/**
 * Team Lifeline V2 - Mock SMS Provider
 * Handles simulation mode when live cellular SMS credentials are unavailable.
 * Safely logs messages and stores them in memory for developer/operator inspection.
 */

const mockSmsInbox = [];

const MockSmsProvider = {
  async send({ to, message, caseId, metadata = {} }) {
    const smsRecord = {
      messageId: `MOCK-SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      to,
      message,
      caseId,
      status: 'simulated_delivered',
      simulated: true,
      timestamp: Date.now(),
      metadata
    };

    mockSmsInbox.unshift(smsRecord);
    if (mockSmsInbox.length > 100) mockSmsInbox.pop();

    console.log('\n======================================================');
    console.log('[SMS SIMULATION MODE - NO REAL CARRIER CHARGES]');
    console.log(`To: ${to}`);
    console.log(`Case: ${caseId}`);
    console.log(`Message: ${message}`);
    console.log('======================================================\n');

    return {
      success: true,
      simulated: true,
      messageId: smsRecord.messageId,
      status: 'simulated_delivered',
      note: 'Simulated SMS recorded in operator dev log.'
    };
  },

  getRecentMessages(limit = 10) {
    return mockSmsInbox.slice(0, limit);
  },

  clear() {
    mockSmsInbox.length = 0;
  }
};

module.exports = MockSmsProvider;
