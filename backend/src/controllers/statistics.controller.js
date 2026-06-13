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

    const { rows: usersRow } = await query(`SELECT COUNT(*) FROM users WHERE role NOT IN ('superadmin', 'admin')`);
    const { rows: groupsRow } = await query('SELECT COUNT(*) FROM groups');
    const { rows: vehiclesRow } = await query('SELECT COUNT(*) FROM vehicles');

    // Query license counts by tier
    const { rows: licenceTiersRow } = await query(`
      SELECT 
        COALESCE(tier, plan_type, 'basic') as tier,
        SUM(total_count) as total,
        SUM(used_count) as used
      FROM licences
      GROUP BY COALESCE(tier, plan_type, 'basic')
    `);

    // Define standard tiers and their display names & DB mappings
    const tierConfig = {
      starter_plus: { name: 'Starter Plus', dbKeys: ['starter_plus', 'starter plus', 'starter-plus'] },
      starter: { name: 'Starter', dbKeys: ['starter'] },
      basic: { name: 'Basic', dbKeys: ['basic'] },
      advance: { name: 'Advance', dbKeys: ['advance', 'advanced'] },
      premium: { name: 'Premium', dbKeys: ['premium'] },
      premium_plus: { name: 'Premium Plus', dbKeys: ['premium_plus', 'premium plus', 'premium-plus'] }
    };

    // Initialize statistics object
    const licenceTiers = {
      starter_plus: { tier: 'starter_plus', displayName: 'Starter Plus', total: 0, used: 0, available: 0 },
      starter: { tier: 'starter', displayName: 'Starter', total: 0, used: 0, available: 0 },
      basic: { tier: 'basic', displayName: 'Basic', total: 0, used: 0, available: 0 },
      advance: { tier: 'advance', displayName: 'Advance', total: 0, used: 0, available: 0 },
      premium: { tier: 'premium', displayName: 'Premium', total: 0, used: 0, available: 0 },
      premium_plus: { tier: 'premium_plus', displayName: 'Premium Plus', total: 0, used: 0, available: 0 }
    };

    // Aggregate database results
    licenceTiersRow.forEach(row => {
      const dbTier = (row.tier || '').toLowerCase().trim();
      
      // Find which category it falls into
      let matchedKey = null;
      for (const [key, config] of Object.entries(tierConfig)) {
        if (config.dbKeys.includes(dbTier)) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey) {
        licenceTiers[matchedKey].total += parseInt(row.total || 0);
        licenceTiers[matchedKey].used += parseInt(row.used || 0);
      } else {
        licenceTiers.basic.total += parseInt(row.total || 0);
        licenceTiers.basic.used += parseInt(row.used || 0);
      }
    });

    // Calculate available count for each tier and total count
    let totalLicences = { tier: 'total', displayName: 'Total Licences', total: 0, used: 0, available: 0 };

    const licenceTiersList = Object.values(licenceTiers).map(t => {
      t.available = Math.max(0, t.total - t.used);
      totalLicences.total += t.total;
      totalLicences.used += t.used;
      return t;
    });

    totalLicences.available = Math.max(0, totalLicences.total - totalLicences.used);

    // Query expired licenses
    const { rows: expiredLicences } = await query(`
      SELECT l.id, COALESCE(l.tier, l.plan_type, 'basic') as tier, l.total_count, l.used_count, l.expire_date,
             o.name as organization_name, o.email as organization_email,
             o.phone as organization_phone, o.mobile as organization_mobile,
             o.address as organization_address, o.city as organization_city,
             o.state as organization_state
      FROM licences l
      JOIN organizations o ON l.organization_id = o.id
      WHERE l.expire_date IS NOT NULL AND l.expire_date < NOW()
      ORDER BY l.expire_date DESC
      LIMIT 20
    `);

    // Query licenses expiring in the next 30 days
    const { rows: expiringLicences } = await query(`
      SELECT l.id, COALESCE(l.tier, l.plan_type, 'basic') as tier, l.total_count, l.used_count, l.expire_date,
             o.name as organization_name, o.email as organization_email,
             o.phone as organization_phone, o.mobile as organization_mobile,
             o.address as organization_address, o.city as organization_city,
             o.state as organization_state
      FROM licences l
      JOIN organizations o ON l.organization_id = o.id
      WHERE l.expire_date IS NOT NULL AND l.expire_date >= NOW() AND l.expire_date <= NOW() + INTERVAL '30 days'
      ORDER BY l.expire_date ASC
      LIMIT 20
    `);

    return res.json({
      success: true,
      data: {
        usersCount: parseInt(usersRow[0].count),
        groupsCount: parseInt(groupsRow[0].count),
        vehiclesCount: parseInt(vehiclesRow[0].count),
        licenceTiers: [...licenceTiersList, totalLicences],
        expiredLicences: expiredLicences.map(l => ({
          id: l.id,
          tier: l.tier,
          totalCount: parseInt(l.total_count || 0),
          usedCount: parseInt(l.used_count || 0),
          expireDate: l.expire_date,
          organizationName: l.organization_name,
          organizationEmail: l.organization_email,
          organizationPhone: l.organization_phone || l.organization_mobile || null,
          organizationAddress: l.organization_address || null,
          organizationCity: l.organization_city || null,
          organizationState: l.organization_state || null
        })),
        expiringLicences: expiringLicences.map(l => ({
          id: l.id,
          tier: l.tier,
          totalCount: parseInt(l.total_count || 0),
          usedCount: parseInt(l.used_count || 0),
          expireDate: l.expire_date,
          organizationName: l.organization_name,
          organizationEmail: l.organization_email,
          organizationPhone: l.organization_phone || l.organization_mobile || null,
          organizationAddress: l.organization_address || null,
          organizationCity: l.organization_city || null,
          organizationState: l.organization_state || null
        }))
      }
    });
  } catch (err) {
    console.error('Failed to get admin overview stats:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin overview statistics' });
  }
};

module.exports = { getDistance, getDriverPerformance, getVehiclePerformance, getAdminOverview };