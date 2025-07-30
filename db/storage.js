const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.join(__dirname, 'messages.json');
const adapter = new JSONFile(file);

// ✅ Add defaultData in the constructor
const db = new Low(adapter, { messages: [] });

async function initDB() {
  await db.read();
  db.data ||= { messages: [] }; // fallback again in case it's undefined
  await db.write();
}

async function saveMessage(msg) {
  await initDB();
  db.data.messages.push({ ...msg, timestamp: new Date().toISOString() });
  await db.write();
}

module.exports = { saveMessage };
