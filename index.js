const express = require('express');
const bodyParser = require('body-parser');
const smsRoutes = require('./routes/sms');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/send-sms', smsRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to ChapChapSMS API');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
