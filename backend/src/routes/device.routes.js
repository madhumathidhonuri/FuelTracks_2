const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const { validate, schemas } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.use(authenticate, requireAdmin);

router.get('/', deviceController.getDevices);
router.get('/:id', deviceController.getDeviceById);
router.get('/check/:imei', deviceController.checkImei);
router.post('/onboard', validate(schemas.onboardDevice), deviceController.onboardDevice);
router.put('/:id', validate(schemas.createDevice), deviceController.updateDevice);
router.delete('/:id', deviceController.deleteDevice);

module.exports = router;