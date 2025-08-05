const express = require('express');
const cors = require('cors');
const smsRoutes = require('./routes/sms');
require('dotenv').config();

const app = express();

// Enable CORS
app.use(cors({
  origin: 'https://chapchapsms-mvp.netlify.app/', // Replace with your frontend URL in production
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to ChapChapSMS API');
});

app.use('/api/messages', smsRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
