const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organization.controller');
const { validate, schemas } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin, requireOwnerOrAdmin } = require('../middleware/role.middleware');

router.use(authenticate, requireAdmin);

router.get('/', orgController.getOrganizations);
router.get('/:id', orgController.getOrganizationById);
router.post('/', validate(schemas.createOrganization), orgController.createOrganization);
router.put('/:id', validate(schemas.createOrganization), orgController.updateOrganization);
router.delete('/:id', orgController.deleteOrganization);

module.exports = router;