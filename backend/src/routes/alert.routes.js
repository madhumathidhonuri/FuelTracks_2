const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', alertController.getAlerts);
router.get('/unread', alertController.getUnread);
router.put('/:id/read', alertController.markRead);
router.put('/read-all', alertController.markAllRead);
router.delete('/:id', alertController.deleteAlert);

module.exports = router;