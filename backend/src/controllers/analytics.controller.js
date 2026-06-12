const Location = require('../models/Location');
const Trip = require('../models/Trip');
const Alert = require('../models/Alert');

const getMovement = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to required' });

    const locations = vehicleId
      ? await Location.findByVehicleAndDateRange(vehicleId, from, to)
      : await Location.findByDeviceAndDateRange(null, from, to);

    const moving = locations.filter(l => l.ignition && l.speed > 0).length;
    const idle = locations.filter(l => l.ignition && l.speed === 0).length;
    const stopped = locations.filter(l => !l.ignition).length;

    return res.json({ success: true, data: { moving, idle, stopped, total: locations.length } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch movement data' });
  }
};

const getOverspeed = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    const alerts = await Alert.getByType(null, 'overspeed', from || new Date(Date.now() - 86400000 * 7).toISOString(), to || new Date().toISOString());
    const filtered = vehicleId ? alerts.filter(a => a.vehicle_id === vehicleId) : alerts;
    return res.json({ success: true, data: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch overspeed data' });
  }
};

const getParked = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    const alerts = await Alert.getByType(null, 'parking', from || new Date(Date.now() - 86400000 * 7).toISOString(), to || new Date().toISOString());
    const filtered = vehicleId ? alerts.filter(a => a.vehicle_id === vehicleId) : alerts;
    return res.json({ success: true, data: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch parked data' });
  }
};

const getIdle = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    const alerts = await Alert.getByType(null, 'idle', from || new Date(Date.now() - 86400000 * 7).toISOString(), to || new Date().toISOString());
    const filtered = vehicleId ? alerts.filter(a => a.vehicle_id === vehicleId) : alerts;
    return res.json({ success: true, data: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch idle data' });
  }
};

const getIgnition = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to required' });

    const locations = vehicleId
      ? await Location.findByVehicleAndDateRange(vehicleId, from, to)
      : [];

    const onCount = locations.filter(l => l.ignition).length;
    const offCount = locations.filter(l => !l.ignition).length;

    return res.json({ success: true, data: { ignitionOn: onCount, ignitionOff: offCount, total: locations.length } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch ignition data' });
  }
};

const getTripSummary = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to required' });

    const summary = await Trip.getSummary(vehicleId, from, to);
    return res.json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch trip summary' });
  }
};

const getStoppage = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!vehicleId || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, from, to required' });

    const locations = await Location.findByVehicleAndDateRange(vehicleId, from, to);
    const stops = [];
    let stopStart = null;

    for (const loc of locations) {
      if (!loc.ignition && loc.speed === 0) {
        if (!stopStart) stopStart = loc;
      } else {
        if (stopStart) {
          const duration = (new Date(loc.server_time) - new Date(stopStart.server_time)) / 1000;
          stops.push({ start: stopStart.server_time, end: loc.server_time, duration: Math.round(duration) });
          stopStart = null;
        }
      }
    }

    return res.json({ success: true, data: stops });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch stoppage data' });
  }
};

const getRouteDeviation = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    const alerts = await Alert.getByType(null, 'geofence', from || new Date(Date.now() - 86400000 * 7).toISOString(), to || new Date().toISOString());
    const filtered = vehicleId ? alerts.filter(a => a.vehicle_id === vehicleId) : alerts;
    return res.json({ success: true, data: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch route deviation data' });
  }
};

module.exports = { getMovement, getOverspeed, getParked, getIdle, getIgnition, getTripSummary, getStoppage, getRouteDeviation };