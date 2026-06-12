const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/live', trackingController.getLiveTracking);
router.get('/live/:vehicleId', trackingController.getLiveTrackingByVehicle);
router.get('/fleet-status', trackingController.getFleetStatus);

module.exports = router;