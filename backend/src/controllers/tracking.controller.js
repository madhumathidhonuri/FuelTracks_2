const Location = require('../models/Location');
const Vehicle = require('../models/Vehicle');

const getLiveTracking = async (req, res) => {
  try {
    const orgId = req.user.role === 'admin' ? (req.query.organizationId || req.user.organizationId) : req.user.organizationId;
    const positions = await Location.getFleetPositions(orgId);
    return res.json({ success: true, data: positions });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch live tracking' });
  }
};

const getLiveTrackingByVehicle = async (req, res) => {
  try {
    const location = await Location.findLatestByVehicle(req.params.vehicleId);
    if (!location) return res.status(404).json({ success: false, message: 'No location data found' });
    return res.json({ success: true, data: location });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vehicle location' });
  }
};

const getFleetStatus = async (req, res) => {
  try {
    const summary = await Vehicle.getStatusSummary(req.user.organizationId);
    return res.json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch fleet status' });
  }
};

module.exports = { getLiveTracking, getLiveTrackingByVehicle, getFleetStatus };