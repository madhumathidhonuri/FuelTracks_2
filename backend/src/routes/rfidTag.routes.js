const express = require('express');
const router = express.Router();
const rfidTagController = require('../controllers/rfidTag.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Create a new batch of RFID tags
router.post('/', authenticate, rfidTagController.create);

// List all batches of RFID tags
router.get('/', authenticate, rfidTagController.list);

module.exports = router;
