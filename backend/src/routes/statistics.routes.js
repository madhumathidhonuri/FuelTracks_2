const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/distance', statisticsController.getDistance);
router.get('/driver-performance', statisticsController.getDriverPerformance);
router.get('/vehicle-performance', statisticsController.getVehiclePerformance);

module.exports = router;