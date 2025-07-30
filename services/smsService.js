async function sendSMS(to, message) {
    // Simulate SMS sending logic here.
    console.log(`Sending SMS to ${to}: ${message}`);
    
    // Replace this with Africa's Talking or Twilio integration later
    return {
      status: 'sent',
      to,
      message,
      provider: 'mock'
    };
  }
  
  module.exports = { sendSMS };
  