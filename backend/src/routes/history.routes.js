const express = require('express');
const router = express.Router();
const historyController = require('../controllers/history.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/route/:vehicleId', historyController.getRoute);
router.get('/stops/:vehicleId', historyController.getStops);
router.get('/trips/:vehicleId', historyController.getTrips);

module.exports = router;