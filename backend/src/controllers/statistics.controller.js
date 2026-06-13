const Location = require('../models/Location');
const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const { calculateDistance } = require('../utils/geo.utils');
const { query } = require('../config/db');

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

const getAdminOverview = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin only' });
    }

    const { rows: orgsRow } = await query('SELECT COUNT(*) FROM organizations');
    const { rows: vehiclesRow } = await query('SELECT COUNT(*) FROM vehicles');
    const { rows: usersRow } = await query('SELECT COUNT(*) FROM users');
    const { rows: devicesRow } = await query("SELECT COUNT(*) FROM devices WHERE status = 'active'");

    // Query 3 recent organizations with counts
    const { rows: recentOrgs } = await query(`
      SELECT o.id, o.name,
        (SELECT COUNT(*) FROM vehicles v WHERE v.organization_id = o.id) as vehicles,
        (SELECT COUNT(*) FROM users u WHERE u.organization_id = o.id) as users,
        (SELECT COALESCE(tier, plan_type, 'starter') FROM licences l WHERE l.organization_id = o.id ORDER BY l.created_at DESC LIMIT 1) as plan
      FROM organizations o
      ORDER BY o.created_at DESC
      LIMIT 3
    `);

    // Group organizations created in the last 6 months
    const { rows: growthOrgs } = await query(`
      SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as orgs
      FROM organizations
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    const { rows: growthVehicles } = await query(`
      SELECT TO_CHAR(created_at, 'Mon') as month, COUNT(*) as vehicles
      FROM vehicles
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    // Merge growth chart data
    const chartDataMap = {};
    const monthsOrder = [];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = d.toLocaleString('en-US', { month: 'short' });
      chartDataMap[mLabel] = { month: mLabel, orgs: 0, vehicles: 0 };
      monthsOrder.push(mLabel);
    }

    growthOrgs.forEach(row => {
      if (chartDataMap[row.month]) {
        chartDataMap[row.month].orgs = parseInt(row.orgs);
      }
    });

    growthVehicles.forEach(row => {
      if (chartDataMap[row.month]) {
        chartDataMap[row.month].vehicles = parseInt(row.vehicles);
      }
    });

    const chartData = monthsOrder.map(m => chartDataMap[m]);

    return res.json({
      success: true,
      data: {
        organizationsCount: parseInt(orgsRow[0].count),
        vehiclesCount: parseInt(vehiclesRow[0].count),
        usersCount: parseInt(usersRow[0].count),
        devicesCount: parseInt(devicesRow[0].count),
        recentOrganizations: recentOrgs.map(o => ({
          name: o.name,
          vehicles: parseInt(o.vehicles),
          users: parseInt(o.users),
          plan: o.plan || 'starter'
        })),
        chartData
      }
    });
  } catch (err) {
    console.error('Failed to get admin overview stats:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin overview statistics' });
  }
};

module.exports = { getDistance, getDriverPerformance, getVehiclePerformance, getAdminOverview };