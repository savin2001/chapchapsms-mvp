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
    status: msg.status || 'failed',                        // e.g., 'sent', 'failed'
    deliveryStatus: msg.deliveryStatus || 'unknown',      // e.g., 'queued', 'rejected'
    provider: msg.provider || "Africa’s Talking",
    channel: msg.channel || 'api',
    timestamp: msg.timestamp || new Date().toISOString(),
    cost: msg.cost || null,                                // e.g., 'KES 1.00'
    statusCode: msg.statusCode || null,                    // e.g., 101, 402, etc.
    rawResponse: msg.rawResponse || null                   // Full AT response
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
