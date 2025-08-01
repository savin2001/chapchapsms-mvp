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

function createBaseMessage(msg, recipient, internalMessageId) {
  return {
    to: recipient.number || recipient,
    from: msg.from || '72824',
    message: msg.message || '',
    messageId: recipient.messageId || '',
    internalMessageId,
    status: recipient.statusCode === 101 ? 'sent' : 'failed',
    deliveryStatus: recipient.statusCode === 101 ? 'queued' : 'rejected',
    provider: msg.provider || 'Africa’s Talking',
    channel: 'api',
    timestamp: new Date().toISOString(),
    cost: recipient.cost || '0',
    statusCode: recipient.statusCode || null,
    campaignId: msg.campaignId || null,
    scheduleTime: msg.scheduleTime || null,
    retryCount: 0,
    lastTriedAt: null,
    messageType: msg.messageType || 'transactional',
    metadata: msg.metadata || {}
  };
}

async function saveMessage(msg) {
  await initDB(messagesDB);
  messagesDB.data.messages.push(msg);
  await messagesDB.write();
}

async function getAllMessages() {
  await initDB(messagesDB);
  return messagesDB.data.messages || [];
}

async function saveBulkMessages(bulkPayload, rawResponse) {
  await initDB(bulkDB);

  const internalMessageId = `CHAP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const results = [];

  for (const recipient of rawResponse.recipients) {
    const msg = createBaseMessage(bulkPayload, recipient, internalMessageId);
    results.push(msg);
    await saveMessage({ ...msg, rawResponse: null }); // Save individually with no duplication
  }

  const summary = {
    internalMessageId,
    totalCount: results.length,
    successCount: results.filter(r => r.status === 'sent').length,
    failedCount: results.filter(r => r.status === 'failed').length,
    messages: results,
    campaignId: bulkPayload.campaignId,
    scheduleTime: bulkPayload.scheduleTime,
    messageType: bulkPayload.messageType,
    metadata: bulkPayload.metadata,
    rawResponse // Store once at top-level
  };

  bulkDB.data.bulk.push(summary);
  await bulkDB.write();

  return summary;
}

async function getBulkMessages() {
  await initDB(bulkDB);
  return bulkDB.data.bulk || [];
}

module.exports = {
  saveMessage,
  saveBulkMessages,
  getAllMessages,
  getBulkMessages,
};
