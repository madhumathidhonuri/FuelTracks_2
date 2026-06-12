const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const { validate, schemas } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroupById);
router.post('/', validate(schemas.createGroup), groupController.createGroup);
router.put('/:id', validate(schemas.updateGroup), groupController.updateGroup);
router.delete('/:id', groupController.deleteGroup);
router.post('/:id/vehicles', validate(schemas.addVehiclesToGroup), groupController.addVehicles);
router.delete('/:id/vehicles', groupController.removeVehicles);

module.exports = router;