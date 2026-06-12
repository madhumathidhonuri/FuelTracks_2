const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const { validate, schemas } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin, requireAuth } = require('../middleware/role.middleware');

router.use(authenticate);

router.get('/', vehicleController.getVehicles);
router.get('/status/all', vehicleController.getVehicleStatusAll);
router.get('/search', vehicleController.searchVehicles);
router.get('/:id', vehicleController.getVehicleById);
router.post('/', requireAuth, validate(schemas.createVehicle), vehicleController.createVehicle);
router.put('/:id', requireAuth, vehicleController.updateVehicle);
router.delete('/:id', requireAdmin, vehicleController.deleteVehicle);

module.exports = router;