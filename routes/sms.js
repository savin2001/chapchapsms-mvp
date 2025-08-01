const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');

router.post('/', smsController.sendSingleMessage);
router.post('/bulk', smsController.sendBulkMessages);
router.get('/', smsController.fetchAllMessages);
router.get('/bulk', smsController.fetchBulkMessages);  // New route to view bulk logs

module.exports = router;
