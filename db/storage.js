const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const messagesDB = new Low(new JSONFile(path.join(__dirname, 'messages.json')), { messages: [] });
const bulkDB = new Low(new JSONFile(path.join(__dirname, 'bulkMessages.json')), { bulk: [] });

async function initDB(db) {
  await db.read();
  db.data ||= db.data || {};
  await db.write();
}

function createBaseMessage(msg, recipient, internalMessageId, rawResponse) {
  const enriched = {
    to: recipient.number || recipient,
    from: msg.from || '72824',
    message: msg.message || '',
    messageId: recipient.messageId || '',
    internalMessageId,
    status: recipient.statusCode === 101 ? 'sent' : 'failed',
    deliveryStatus: recipient.statusCode === 101 ? 'queued' : 'rejected',
    provider: 'Africa’s Talking',
    channel: 'api',
    timestamp: new Date().toISOString(),
    cost: recipient.cost || '0',
    statusCode: recipient.statusCode || null,
    rawResponse,
    campaignId: msg.campaignId || null,
    scheduleTime: msg.scheduleTime || null,
    retryCount: 0,
    lastTriedAt: null,
    messageType: msg.messageType || 'transactional',
    metadata: msg.metadata || {},
  };
  return enriched;
}

async function saveMessage(msg) {
  await initDB(messagesDB);
  messagesDB.data.messages.push(msg);
  await messagesDB.write();
}

async function saveBulkMessages(bulkPayload, rawResponse) {
  await initDB(bulkDB);

  const internalMessageId = `CHAP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const results = [];

  for (const recipient of rawResponse.recipients) {
    const msg = createBaseMessage(bulkPayload, recipient, internalMessageId, rawResponse);
    results.push(msg);
    await saveMessage(msg); // Store in individual message log as well
  }

  const summary = {
    internalMessageId,
    totalCount: rawResponse.recipients.length,
    successCount: rawResponse.recipients.filter(r => r.statusCode === 101).length,
    failedCount: rawResponse.recipients.filter(r => r.statusCode !== 101).length,
    messages: results
  };

  bulkDB.data.bulk.push(summary);
  await bulkDB.write();

  return summary;
}

module.exports = {
  saveMessage,
  saveBulkMessages
};
