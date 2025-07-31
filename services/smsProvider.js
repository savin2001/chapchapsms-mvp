// services/smsProvider.js
const africastalking = require('africastalking');
require('dotenv').config();

const AT = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = AT.SMS;

async function sendViaAT({ to, message, from = '72824' }) {
  console.log('[AT:sendViaAT] Attempting to send SMS:', { to, from, message });

  try {
    const result = await sms.send({ to, message, from });
    console.log('[AT:sendViaAT] SMS API response:', JSON.stringify(result, null, 2));
    return { success: true, response: result };
  } catch (err) {
    console.error('[AT:sendViaAT] Error:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendViaAT };
