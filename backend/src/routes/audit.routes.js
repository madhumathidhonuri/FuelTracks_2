const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Audit logs list
router.get('/', authenticate, auditController.getAuditLogs);

module.exports = router;
