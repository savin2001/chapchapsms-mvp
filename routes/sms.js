const express = require('express');
const router = express.Router();
const { saveMessage, getAllMessages } = require('../db/storage');
const { v4: uuidv4 } = require('uuid'); // Add this

// POST /api/messages (single or bulk)
router.post('/', async (req, res) => {
  const messages = Array.isArray(req.body) ? req.body : [req.body];

  const invalid = messages.find(
    ({ to, from, message }) => !to || !from || !message
  );
  if (invalid) {
    return res.status(400).json({ error: 'Missing "to", "from", or "message" in at least one message' });
  }

  try {
    const enriched = messages.map((msg) => ({
      to: msg.to,
      from: msg.from,
      message: msg.message,
      messageId: uuidv4(),
      status: 'sent',
      deliveryStatus: 'queued',
      channel: 'api',
      timestamp: new Date().toISOString()
    }));

    for (const m of enriched) {
      await saveMessage(m);
    }

    res.status(201).json({ status: 'Messages saved', count: enriched.length });
  } catch (error) {
    console.error('Error saving messages:', error);
    res.status(500).json({ error: 'Failed to save messages' });
  }
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
