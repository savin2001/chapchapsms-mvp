const {
    saveMessage,
    saveBulkMessages,
    getAllMessages,
    getBulkMessages
  } = require('../db/storage');
  const { sendViaAT } = require('../services/smsProvider');
  
  exports.sendSingleMessage = async (req, res) => {
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
        provider = 'africastalking'
      } = msg;
  
      if (!to || !message) {
        results.push({ to, error: 'Missing "to" or "message"' });
        continue;
      }
  
      const sendResult = await sendViaAT({ to, message, from: senderId });
  
      const recipientData = sendResult.response?.recipients?.[0] || {};
  
      const saved = {
        to,
        from: senderId,
        message,
        messageId: recipientData.messageId || '',
        internalMessageId: `CHAPCHAP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status: sendResult.success ? 'sent' : 'failed',
        deliveryStatus: sendResult.success ? 'queued' : 'rejected',
        provider,
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
  
      await saveMessage(saved);
      results.push(saved);
    }
  
    res.status(207).json(results);
  };
  
  exports.sendBulkMessages = async (req, res) => {
    const {
      to,
      from = '72824',
      message,
      campaignId = `CAMPAIGN-${new Date().toISOString().slice(0, 10)}`,
      scheduleTime = null,
      messageType = 'transactional',
      metadata = {},
      provider = 'africastalking'
    } = req.body;
  
    const recipientList = Array.isArray(to) ? to : [to];
    const sendResult = await sendViaAT({ to: recipientList, from, message });
  
    const summary = await saveBulkMessages(
      { from, message, campaignId, scheduleTime, messageType, metadata, provider },
      sendResult.response
    );
  
    res.status(207).json(summary);
  };
  
  exports.fetchAllMessages = async (_req, res) => {
    try {
      const messages = await getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error('[GET:/api/messages] Error:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  };
  
  exports.fetchBulkMessages = async (_req, res) => {
    try {
      const bulk = await getBulkMessages();
      res.json(bulk);
    } catch (error) {
      console.error('[GET:/api/messages/bulk] Error:', error);
      res.status(500).json({ error: 'Failed to fetch bulk messages' });
    }
  };
  