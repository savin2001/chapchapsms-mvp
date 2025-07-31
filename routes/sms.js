const express = require('express');
const router = express.Router();
const { saveMessage, getAllMessages } = require('../db/storage');
const { v4: uuidv4 } = require('uuid'); 
const { sendViaAT } = require('../services/smsProvider');


// POST /api/messages (single or bulk)
router.post('/', async (req, res) => {
  const messages = Array.isArray(req.body) ? req.body : [req.body];

  const results = [];

  for (const msg of messages) {
    const { to, from, message } = msg;
    if (!to || !from || !message) {
      results.push({ to, error: 'Missing "to", "from", or "message"' });
      continue;
    }

    const sendResult = await sendViaAT({ to, from, message });
    const saved = {
      to,
      from,
      message,
      status: sendResult.success ? 'sent' : 'failed',
      provider: 'Africa’s Talking',
      channel: 'api',
      timestamp: new Date().toISOString(),
    };
    await saveMessage(saved);
    results.push(saved);
  }

  res.status(207).json(results); // 207: Multi-Status
});


// GET /api/messages
router.get('/', async (req, res) => {
  try {
    const messages = await getAllMessages();
    res.json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
