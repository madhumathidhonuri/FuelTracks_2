const Location = require('../models/Location');
const Trip = require('../models/Trip');

const getIdleWastage = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    const fromDate = from || new Date(Date.now() - 86400000 * 7).toISOString();
    const toDate = to || new Date().toISOString();

    const locations = vehicleId
      ? await Location.findByVehicleAndDateRange(vehicleId, fromDate, toDate)
      : [];

    let totalIdleTime = 0;
    let idleEvents = 0;
    let inIdle = false;
    let idleStart = null;

    for (const loc of locations) {
      if (loc.ignition && loc.speed === 0) {
        if (!inIdle) { inIdle = true; idleStart = loc.server_time; idleEvents++; }
      } else {
        if (inIdle && idleStart) {
          totalIdleTime += (new Date(loc.server_time) - new Date(idleStart)) / 1000;
          inIdle = false;
          idleStart = null;
        }
      }
    }

    const fuelWasted = Math.round(totalIdleTime / 3600 * 2.5 * 100) / 100;
    return res.json({ success: true, data: { totalIdleTime: Math.round(totalIdleTime), idleEvents, fuelWasted } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch idle wastage data' });
  }
};

const getEngineOn = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to required' });

    const trips = vehicleId
      ? (await Trip.findByVehicle(vehicleId, { from, to, page: 1, limit: 100 })).data
      : [];

    let totalEngineOn = 0;
    for (const t of trips) { totalEngineOn += t.duration || 0; }

    return res.json({
      success: true,
      data: {
        totalEngineOn,
        tripCount: trips.length,
        avgDuration: trips.length > 0 ? Math.round(totalEngineOn / trips.length) : 0,
        totalDistance: trips.reduce((s, t) => s + (t.distance || 0), 0),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch engine on data' });
  }
};

const getProtocol = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!vehicleId || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, from, to required' });

    const locations = await Location.findByVehicleAndDateRange(vehicleId, from, to, { limit: 500 });
    return res.json({ success: true, data: locations });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch protocol data' });
  }
};

const getDeviceData = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!vehicleId || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, from, to required' });

    const locations = await Location.findByVehicleAndDateRange(vehicleId, from, to, { limit: 500 });
    const protocolData = locations.map(l => ({
      serverTime: l.server_time,
      deviceTime: l.device_time,
      odometer: l.odometer,
      rawMessage: l.raw_message,
      protocolStatus: l.protocol_status,
      packetType: l.packet_type,
      valid: l.packet_type === 'VALID' || !l.packet_type,
    }));

    return res.json({ success: true, data: protocolData });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch device data' });
  }
};

const exportSensors = async (req, res) => {
  try {
    const { data, format, filename } = req.body;
    if (!data || !format) return res.status(400).json({ success: false, message: 'data and format required' });

    const { exportData, getExportHeaders, getExportFilename } = require('../services/export.service');
    const buffer = await exportData(data, format, { sheetName: filename || 'SensorData' });
    const name = getExportFilename(filename || 'sensor_data', format);

    res.setHeader('Content-Type', getExportHeaders(format));
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Export failed' });
  }
};

module.exports = { getIdleWastage, getEngineOn, getProtocol, getDeviceData, exportSensors };