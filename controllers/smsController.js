const {
  saveMessage,
  saveBulkMessages,
  getAllMessages,
  getBulkMessages
} = require('../db/storage');
const { sendViaAT } = require('../services/smsProvider');

// --- Helper: filtering, sorting, pagination ---
function filterPaginateSort(data, query) {
  let {
    tenantId,
    status,
    dateFrom,
    dateTo,
    sortBy = 'timestamp',
    order = 'desc',
    page = 1,
    limit = 10
  } = query;

  let filtered = [...data];

  if (tenantId) {
    filtered = filtered.filter(m => m.tenantId === tenantId);
  }

  if (status) {
    filtered = filtered.filter(m => (m.status || '').toLowerCase() === status.toLowerCase());
  }

  if (dateFrom) {
    const from = new Date(dateFrom);
    filtered = filtered.filter(m => new Date(m.timestamp) >= from);
  }

  if (dateTo) {
    const to = new Date(dateTo);
    filtered = filtered.filter(m => new Date(m.timestamp) <= to);
  }

  if (query.messageType) {
    filtered = filtered.filter(m => (m.messageType || '').toLowerCase() === query.messageType.toLowerCase());
  }
  
  if (query.campaignId) {
    filtered = filtered.filter(m => m.campaignId === query.campaignId);
  }

  if (sortBy) {
    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (order === 'desc') return aVal < bVal ? 1 : -1;
      return aVal > bVal ? 1 : -1;
    });
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    total,
    page: Number(page),
    limit: Number(limit),
    data: paginated
  };
}

// --- Single message sending ---
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
      provider = 'africastalking',
      tenantId = 'default'
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
      metadata,
      tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveMessage(saved);
    results.push(saved);
  }

  res.status(207).json(results);
};

// --- Bulk message sending ---
exports.sendBulkMessages = async (req, res) => {
  const {
    to,
    from = '72824',
    message,
    campaignId = `CAMPAIGN-${new Date().toISOString().slice(0, 10)}`,
    scheduleTime = null,
    messageType = 'transactional',
    metadata = {},
    provider = 'africastalking',
    tenantId = 'default'
  } = req.body;

  const recipientList = Array.isArray(to) ? to : [to];
  const sendResult = await sendViaAT({ to: recipientList, from, message });

  const summary = await saveBulkMessages(
    { from, message, campaignId, scheduleTime, messageType, metadata, provider },
    sendResult.response
  );

  res.status(207).json(summary);
};

// --- All single messages (GET /api/messages) ---
exports.fetchAllMessages = async (req, res) => {
  try {
    const messages = await getAllMessages();
    const result = filterPaginateSort(messages, req.query);
    res.json(result);
  } catch (error) {
    console.error('[GET:/api/messages] Error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// --- All bulk messages (GET /api/messages/bulk) ---
exports.fetchBulkMessages = async (req, res) => {
  try {
    const bulk = await getBulkMessages();
    const result = filterPaginateSort(bulk, req.query);
    res.json(result);
  } catch (error) {
    console.error('[GET:/api/messages/bulk] Error:', error);
    res.status(500).json({ error: 'Failed to fetch bulk messages' });
  }
};

// --- Single message by ID ---
exports.getSingleMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await getAllMessages();
    const msg = messages.find(m => m.internalMessageId === id || m.messageId === id);

    if (!msg) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json(msg);
  } catch (error) {
    console.error('[GET:/api/messages/:id] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Bulk message summary by ID ---
exports.getBulkMessageById = async (req, res) => {
  try {
    const { bulkId } = req.params;
    const bulks = await getBulkMessages();
    const bulk = bulks.find(b => b.internalMessageId === bulkId);

    if (!bulk) {
      return res.status(404).json({ error: 'Bulk message not found' });
    }

    res.json(bulk);
  } catch (error) {
    console.error('[GET:/api/messages/bulk/:bulkId] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- Messages under a specific bulk ID ---
exports.getMessagesByBulkId = async (req, res) => {
  try {
    const { bulkId } = req.params;
    const allMessages = await getAllMessages();
    const matching = allMessages.filter(m => m.internalMessageId === bulkId);

    if (!matching.length) {
      return res.status(404).json({ error: 'No messages found for this bulkId' });
    }

    const result = filterPaginateSort(matching, req.query);
    res.json(result);
  } catch (error) {
    console.error('[GET:/api/messages/bulk/:bulkId/messages] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
