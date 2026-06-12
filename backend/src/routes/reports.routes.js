const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/consolidated', reportsController.getConsolidated);
router.get('/overspeed', reportsController.getOverspeed);
router.get('/stoppage', reportsController.getStoppage);
router.get('/trip-history', reportsController.getTripHistory);
router.get('/route-summary', reportsController.getRouteSummary);
router.post('/export', reportsController.exportReport);

module.exports = router;