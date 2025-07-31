// services/smsProvider.js
const africastalking = require('africastalking');
require('dotenv').config();

const AT = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = AT.SMS;

async function sendViaAT({ to, message, from }) {
    from = 'AFRICASTKNG'; // override for sandbox test
    console.log('[AT:sendViaAT] Using sandbox senderId:', from);
  
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
