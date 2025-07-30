const express = require('express');
const router = express.Router();
const { sendSMS } = require('../services/smsService');
const { saveMessage } = require('../db/storage');

router.post('/', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message"' });
  }

  try {
    const result = await sendSMS(to, message);
    await saveMessage({ to, message, status: result.status });
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send SMS', details: error.message });
  }
});

module.exports = router;
