const Location = require('../models/Location');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const { calculateDistance } = require('../utils/geo.utils');

const getDistance = async (req, res) => {
  try {
    const { from, to, vehicleId } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to required' });

    const orgId = req.user.role === 'admin' ? (req.query.organizationId || req.user.organizationId) : req.user.organizationId;
    const vehicles = await Vehicle.findByOrganization(orgId, { limit: 100 });

    const result = [];

    for (const v of vehicles.data || []) {
      const locations = await Location.findByVehicleAndDateRange(v.id, from, to);
      let totalDistance = 0;

      for (let i = 1; i < locations.length; i++) {
        totalDistance += calculateDistance(
          locations[i - 1].latitude, locations[i - 1].longitude,
          locations[i].latitude, locations[i].longitude
        );
      }

      result.push({
        vehicleId: v.id,
        vehicleName: v.vehicle_name,
        registrationNumber: v.registration_number,
        totalDistance: Math.round(totalDistance * 100) / 100,
        dataPoints: locations.length,
      });
    }

    const fleetTotal = result.reduce((sum, r) => sum + r.totalDistance, 0);
    return res.json({ success: true, data: { vehicles: result, fleetTotal: Math.round(fleetTotal * 100) / 100 } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch distance statistics' });
  }
};

const getDriverPerformance = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from || new Date(Date.now() - 86400000 * 30).toISOString();
    const toDate = to || new Date().toISOString();

    const orgId = req.user.role === 'admin' ? (req.query.organizationId || req.user.organizationId) : req.user.organizationId;
    const vehicles = await Vehicle.findByOrganization(orgId, { limit: 50 });

    const drivers = [];

    for (const v of vehicles.data || []) {
      const summary = await Trip.getSummary(v.id, fromDate, toDate);
      if (summary.total_trips > 0) {
        drivers.push({
          driverName: v.vehicle_name,
          vehicleId: v.id,
          totalTrips: parseInt(summary.total_trips),
          totalDistance: parseFloat(summary.total_distance) || 0,
          avgSpeed: parseFloat(summary.avg_speed_recorded) || 0,
          score: Math.min(100, Math.round((parseFloat(summary.total_distance) || 0) / 10 + parseInt(summary.total_trips) * 2)),
        });
      }
    }

    return res.json({ success: true, data: drivers });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch driver performance' });
  }
};

const getVehiclePerformance = async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = from || new Date(Date.now() - 86400000 * 30).toISOString();
    const toDate = to || new Date().toISOString();

    const orgId = req.user.role === 'admin' ? (req.query.organizationId || req.user.organizationId) : req.user.organizationId;
    const vehicles = await Vehicle.findByOrganization(orgId, { limit: 50 });

    const performance = [];

    for (const v of vehicles.data || []) {
      const summary = await Trip.getSummary(v.id, fromDate, toDate);
      const locations = await Location.findByVehicleAndDateRange(v.id, fromDate, toDate);
      const totalTime = locations.length > 1
        ? (new Date(locations[locations.length - 1].server_time) - new Date(locations[0].server_time)) / 1000
        : 0;
      const uptimeHours = totalTime > 0 ? Math.round((totalTime / 3600) * 10) / 10 : 0;

      performance.push({
        vehicleId: v.id,
        vehicleName: v.vehicle_name,
        distance: parseFloat(summary.total_distance) || 0,
        trips: parseInt(summary.total_trips) || 0,
        uptime: uptimeHours,
      });
    }

    return res.json({ success: true, data: performance });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vehicle performance' });
  }
};

module.exports = { getDistance, getDriverPerformance, getVehiclePerformance };