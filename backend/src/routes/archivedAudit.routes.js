const express = require('express');
const router = express.Router();
const archivedAuditController = require('../controllers/archivedAudit.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Create a new archived audit entry
router.post('/', authenticate, archivedAuditController.create);

// List archived audit logs
router.get('/', authenticate, archivedAuditController.list);

// Get a specific archived audit log by ID
router.get('/:id', authenticate, archivedAuditController.getById);

module.exports = router;
