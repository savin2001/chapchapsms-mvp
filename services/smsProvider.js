const africastalking = require('africastalking');
require('dotenv').config();

const AT = africastalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME,
});

const sms = AT.SMS;

const statusDescriptions = {
  100: 'Processed',
  101: 'Sent',
  102: 'Queued',
  401: 'RiskHold',
  402: 'InvalidSenderId',
  403: 'InvalidPhoneNumber',
  404: 'UnsupportedNumberType',
  405: 'InsufficientBalance',
  406: 'UserInBlacklist',
  407: 'CouldNotRoute',
  500: 'InternalServerError',
  501: 'GatewayError',
  502: 'RejectedByGateway',
};

async function sendViaAT({ to, message, from = '72824' }) {
  try {
    const result = await sms.send({ to, message, from });

    const recipients = result.SMSMessageData?.Recipients || [];
    const enrichedRecipients = recipients.map((r) => ({
      number: r.number,
      statusCode: r.statusCode,
      status: r.status,
      description: statusDescriptions[r.statusCode] || 'Unknown',
      cost: r.cost,
      messageId: r.messageId,
    }));

    return {
      success: true,
      response: {
        message: result.SMSMessageData?.Message || 'No summary',
        recipients: enrichedRecipients,
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function sendBulkViaAT({ to, message, from }) {
  return sendViaAT({ to, message, from });
}

module.exports = {
  sendViaAT,
  sendBulkViaAT
};
