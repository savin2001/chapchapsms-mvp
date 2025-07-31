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
    from: msg.from || 'AFRICASTKNG',
    message: msg.message || '',
    messageId: msg.messageId || '', // passed in
    status: msg.status || 'sent',
    deliveryStatus: msg.deliveryStatus || 'queued',
    channel: msg.channel || 'api',
    timestamp: msg.timestamp || new Date().toISOString()
  };

  db.data.messages.push(standardized);
  await db.write();
}

async function getAllMessages() {
  await db.read();
  return db.data.messages || [];
}

module.exports = { saveMessage, getAllMessages };
