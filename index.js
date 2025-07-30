const express = require('express');
const smsRoutes = require('./routes/sms');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to ChapChapSMS API');
});

app.use('/api/messages', smsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
