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
  const {
    to,
    from = '72824',
    message,
    campaignId = null,
    scheduleTime = null,
    messageType = 'transactional',
    metadata = {}
  } = req.body;

  const recipientList = Array.isArray(to) ? to : [to];
  const internalMessageId = `CHAP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const results = [];

  const sendResult = await sendViaAT({ to: recipientList, from, message });

  const recipients = sendResult.response?.recipients || [];
  for (const r of recipients) {
    const statusOk = r.statusCode === 100 || r.statusCode === 101 || r.statusCode === 102;
    const payload = {
      to: r.number,
      from,
      message,
      messageId: r.messageId !== 'None' ? r.messageId : '',
      internalMessageId,
      status: statusOk ? 'sent' : 'failed',
      deliveryStatus: statusOk ? 'queued' : 'rejected',
      provider: 'Africa’s Talking',
      channel: 'api',
      timestamp: new Date().toISOString(),
      cost: r.cost || null,
      statusCode: r.statusCode || null,
      rawResponse: sendResult.response,
      campaignId,
      scheduleTime,
      retryCount: 0,
      lastTriedAt: null,
      messageType,
      metadata
    };
    await saveMessage(payload);
    results.push(payload);
  }

  const successCount = results.filter(r => r.status === 'sent').length;
  const failedCount = results.length - successCount;

  res.status(207).json({
    internalMessageId,
    totalCount: results.length,
    successCount,
    failedCount,
    messages: results
  });
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
