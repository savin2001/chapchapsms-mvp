router.post('/', async (req, res) => {
  console.log('[POST:/api/messages] Incoming request body:', req.body);

  const messages = Array.isArray(req.body) ? req.body : [req.body];
  const results = [];

  for (const msg of messages) {
    const { to, from, message } = msg;
    console.log('[POST:/api/messages] Processing message:', msg);

    if (!to || !from || !message) {
      console.warn('[POST:/api/messages] Missing fields:', msg);
      results.push({ to, error: 'Missing "to", "from", or "message"' });
      continue;
    }

    const sendResult = await sendViaAT({ to, from, message });

    const saved = {
      to,
      from,
      message,
      status: sendResult.success ? 'sent' : 'failed',
      deliveryStatus: 'queued',
      provider: 'Africa’s Talking',
      channel: 'api',
      timestamp: new Date().toISOString(),
    };

    console.log('[POST:/api/messages] Result:', sendResult);
    await saveMessage(saved);
    results.push(saved);
  }

  console.log('[POST:/api/messages] Final response payload:', results);
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
