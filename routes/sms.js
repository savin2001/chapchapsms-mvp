const express = require('express');
const router = express.Router();
const smsController = require('../controllers/smsController');

router.post('/', smsController.sendSingleMessage);
router.post('/bulk', smsController.sendBulkMessages);

router.get('/', smsController.fetchAllMessages);
router.get('/bulk', smsController.fetchBulkMessages);

router.get('/:id', smsController.getSingleMessageById); 
router.get('/bulk/:bulkId', smsController.getBulkMessageById); 
router.get('/bulk/:bulkId/messages', smsController.getMessagesByBulkId); 

module.exports = router;
