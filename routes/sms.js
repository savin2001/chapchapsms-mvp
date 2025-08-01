const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');

router.post('/', smsController.sendSingleMessage);
router.post('/bulk', smsController.sendBulkMessages);
router.get('/', smsController.fetchAllMessages);

module.exports = router;
