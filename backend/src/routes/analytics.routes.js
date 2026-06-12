const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/movement', analyticsController.getMovement);
router.get('/overspeed', analyticsController.getOverspeed);
router.get('/parked', analyticsController.getParked);
router.get('/idle', analyticsController.getIdle);
router.get('/ignition', analyticsController.getIgnition);
router.get('/trip-summary', analyticsController.getTripSummary);
router.get('/stoppage', analyticsController.getStoppage);
router.get('/route-deviation', analyticsController.getRouteDeviation);

module.exports = router;