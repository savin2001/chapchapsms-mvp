const express = require('express');
const router = express.Router();
const { saveMessage, getAllMessages } = require('../db/storage');
const { sendViaAT } = require('../services/smsProvider');

router.post('/', async (req, res) => {
  console.log('[POST:/api/messages] Incoming request body:', req.body);

  const messages = Array.isArray(req.body) ? req.body : [req.body];
  const results = [];

  for (const msg of messages) {
    const {
      to,
      message,
      senderId = '72824',
      campaignId = null,
      scheduleTime = null,
      messageType = 'transactional',
      metadata = {},
    } = msg;

    if (!to || !message) {
      console.warn('[POST:/api/messages] Missing "to" or "message" fields:', msg);
      results.push({ to, error: 'Missing "to" or "message"' });
      continue;
    }

    const sendResult = await sendViaAT({ to, from: senderId, message });

    const recipientData = sendResult.response?.recipients?.[0] || {};

    const saved = {
      to,
      from: senderId,
      message,
      messageId: recipientData.messageId || '',
      internalMessageId: `CHAPCHAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      status: sendResult.success ? 'sent' : 'failed',
      deliveryStatus: sendResult.success ? 'queued' : 'rejected',
      provider: 'Africa’s Talking',
      channel: 'api',
      timestamp: new Date().toISOString(),
      cost: recipientData.cost || null,
      statusCode: recipientData.statusCode || null,
      rawResponse: sendResult.response || null,
      campaignId,
      scheduleTime,
      retryCount: 0,
      lastTriedAt: new Date().toISOString(),
      messageType,
      metadata
    };

    console.log('[POST:/api/messages] Result:', JSON.stringify(sendResult, null, 2));
    await saveMessage(saved);
    results.push(saved);
  }

  console.log('[POST:/api/messages] Final response payload:', JSON.stringify(results, null, 2));
  res.status(207).json(results);
});

router.post('/bulk', async (req, res) => {
  console.log('[POST:/api/messages/bulk] Incoming bulk request...');

  const messages = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Request body must be a non-empty array of messages' });
  }

  const { campaignId, scheduledAt } = req.query;
  const now = new Date().toISOString();
  const results = [];

  for (const msg of messages) {
    const { to, message, from = '72824' } = msg;

    if (!to || !message) {
      results.push({ to, error: 'Missing "to" or "message" field' });
      continue;
    }

    const internalMessageId = `CHAP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Scheduling logic (for now we only support immediate or scheduled log without actual delay)
    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    const shouldSendNow = !isScheduled;

    let sendResult = {};
    if (shouldSendNow) {
      sendResult = await sendViaAT({ to, from, message });
    }

    const rawRecipient = sendResult.response?.SMSMessageData?.Recipients?.[0] || {};

    const saved = {
      internalMessageId,
      to,
      from,
      message,
      campaignId: campaignId || null,
      scheduledAt: scheduledAt || null,
      sentAt: shouldSendNow ? now : null,
      status: shouldSendNow
        ? (sendResult.success ? 'sent' : 'failed')
        : 'scheduled',
      deliveryStatus: shouldSendNow
        ? (sendResult.success ? 'queued' : 'rejected')
        : 'pending',
      provider: 'Africa’s Talking',
      channel: 'api',
      timestamp: now,
      cost: rawRecipient.cost || null,
      statusCode: rawRecipient.statusCode || null,
      messageId: rawRecipient.messageId || '',
      rawResponse: sendResult.response || null
    };

    await saveMessage(saved);
    results.push(saved);
  }

  res.status(207).json(results);
});


router.get('/', async (req, res) => {
  console.log('[GET:/api/messages] Fetching all messages...');
  try {
    const messages = await getAllMessages();
    console.log(`[GET:/api/messages] Retrieved ${messages.length} messages`);
    res.json(messages);
  } catch (error) {
    console.error('[GET:/api/messages] Error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
