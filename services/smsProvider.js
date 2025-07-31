// services/smsProvider.js
const africastalking = require('africastalking');

// ✅ Replace with your credentials
const AT = africastalking({
    apiKey: process.env.AT_API_KEY,
    username: process.env.AT_USERNAME,
});

const sms = AT.SMS;

async function sendViaAT({ to, message, from = 'AFRICASTKNG' }) {
  try {
    const result = await sms.send({ to, message, from });
    console.log('SMS sent:', result);
    return { success: true, response: result };
  } catch (err) {
    console.error('Failed to send SMS via Africa’s Talking:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendViaAT };
