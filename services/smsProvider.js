// services/smsProvider.js
const africastalking = require('africastalking');

// ✅ Replace with your credentials
const AT = africastalking({
  apiKey: 'atsk_8a71ec864ce8b61edad3bd5fd6f4fdf0909a7571d1571e485a56b4fb6ef8be78d5f529ab',
  username: 'sandbox', // or your live username
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
