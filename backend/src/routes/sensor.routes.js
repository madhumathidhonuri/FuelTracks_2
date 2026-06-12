const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/idle-wastage', sensorController.getIdleWastage);
router.get('/engine-on', sensorController.getEngineOn);
router.get('/protocol', sensorController.getProtocol);
router.get('/device-data', sensorController.getDeviceData);
router.post('/export', sensorController.exportSensors);

module.exports = router;