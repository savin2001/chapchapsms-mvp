const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.join(__dirname, 'messages.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { messages: [] });

async function initDB() {
  await db.read();
  db.data ||= { messages: [] };
  await db.write();
}

async function saveMessage(msg) {
  await initDB();

  const standardized = {
    to: msg.to || '',
    from: msg.from || '72824',
    message: msg.message || '',
    messageId: msg.messageId || '',
    internalMessageId: msg.internalMessageId || `CHAPCHAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: msg.status || 'failed',
    deliveryStatus: msg.deliveryStatus || 'unknown',
    provider: msg.provider || 'Africa’s Talking',
    channel: msg.channel || 'api',
    timestamp: msg.timestamp || new Date().toISOString(),
    cost: msg.cost || null,
    statusCode: msg.statusCode || null,
    rawResponse: msg.rawResponse || null,
    campaignId: msg.campaignId || null,
    scheduleTime: msg.scheduleTime || null,
    retryCount: msg.retryCount || 0,
    lastTriedAt: msg.lastTriedAt || null,
    messageType: msg.messageType || 'transactional',
    metadata: msg.metadata || {},
  };

  db.data.messages.push(standardized);
  console.log('[DB] Message saved:', standardized);
  await db.write();
}

async function getAllMessages() {
  await db.read();
  return db.data.messages || [];
}

module.exports = { saveMessage, getAllMessages };
