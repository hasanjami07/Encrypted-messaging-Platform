const express = require('express');
const router = express.Router();
const scheduledController = require('../controllers/scheduledController');
const { verifyToken } = require('../middleware/auth.middleware');

router.post('/', verifyToken, scheduledController.scheduleMessage);
router.get('/', verifyToken, scheduledController.getScheduledForUser);
router.delete('/:id', verifyToken, scheduledController.deleteScheduled);

module.exports = router;

