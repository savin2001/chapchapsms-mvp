const africastalking = require('africastalking');
require('dotenv').config();

const AT = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

console.log('[ENV] Username:', process.env.AT_USERNAME);
console.log('[ENV] API Key starts with:', process.env.AT_API_KEY.slice(0, 5));

const sms = AT.SMS;

async function sendViaAT({ to, message, from = 'AFRICASTKNG' }) {
  console.log('[AT:sendViaAT] Preparing to send SMS...');
  console.log(`[AT:sendViaAT] To: ${to}, From: ${from}, Message: "${message}"`);

  try {
    const result = await sms.send({ to, message, from });
    console.log('[AT:sendViaAT] SMS API response:', JSON.stringify(result, null, 2));
    return { success: true, response: result };
  } catch (err) {
    console.error('[AT:sendViaAT] Error sending SMS:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendViaAT };
