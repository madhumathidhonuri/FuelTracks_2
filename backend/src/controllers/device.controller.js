const Device = require('../models/Device');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Group = require('../models/Group');
const Organization = require('../models/Organization');
const Licence = require('../models/Licence');
const { hashPassword, generateRandomPassword } = require('../utils/hash.utils');
const { sendWelcomeEmail } = require('../services/email.service');
const { sendWelcomeSMS } = require('../services/sms.service');

const getDevices = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status, plan } = req.query;
    const result = await Device.findAll({
      page: parseInt(page), limit: parseInt(limit), search, status, plan,
    });
    return res.json({ success: true, data: result.data, total: result.total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch devices' });
  }
};

const getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    return res.json({ success: true, data: device });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch device' });
  }
};

const checkImei = async (req, res) => {
  try {
    const device = await Device.findByImei(req.params.imei);
    return res.json({ success: true, available: !device, device: device || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'IMEI check failed' });
  }
};

const onboardDevice = async (req, res) => {
  try {
    const { plan, quantity, userType, newUser, existingUser, devices } = req.body;

    const planDurations = { starter: 30, basic: 90, advance: 180, premium: 365 };
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + (planDurations[plan] || 90));

    let user = null;
    let organizationId = null;

    if (userType === 'new') {
      const existingUsername = await User.findByUsername(newUser.username);
      if (existingUsername) return res.status(400).json({ success: false, message: 'Username already exists' });
      const existingEmail = await User.findByEmail(newUser.email);
      if (existingEmail) return res.status(400).json({ success: false, message: 'Email already exists' });

      const passwordHash = await hashPassword(newUser.password);
      user = await User.create({
        username: newUser.username,
        email: newUser.email,
        mobile: newUser.mobile,
        password_hash: passwordHash,
        role: 'user',
        organization_id: null,
        company_name: newUser.company_name || newUser.username,
        user_mode: 'asset',
      });

      const org = await Organization.create({ name: newUser.username + "'s Organization", email: newUser.email, mobile: newUser.mobile });
      organizationId = org.id;

      await User.update(user.id, { organization_id: organizationId });

      await Licence.create({ organization_id: organizationId, tier: plan, total_count: quantity, used_count: 0, expire_date: expireDate });

      if (process.env.SMTP_USER) {
        sendWelcomeEmail(user, newUser.password).catch(e => console.error('Email error:', e.message));
        sendWelcomeSMS(newUser.mobile, newUser.username, newUser.password).catch(e => console.error('SMS error:', e.message));
      }
    } else {
      user = await User.findByUsername(existingUser.username);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      organizationId = user.organization_id;

      if (organizationId) {
        let available = await Licence.getAvailableCount(organizationId, plan);
        if (available < quantity) {
          const existingLicence = await Licence.findByOrganizationAndTier(organizationId, plan);
          if (!existingLicence) {
            const planDurations = { starter: 30, basic: 90, advance: 180, premium: 365, premium_plus: 365 };
            const expireDate = new Date();
            expireDate.setDate(expireDate.getDate() + (planDurations[plan] || 90));
            await Licence.create({
              organization_id: organizationId,
              tier: plan,
              total_count: 50,
              used_count: 0,
              expire_date: expireDate
            });
          } else {
            await Licence.update(existingLicence.id, {
              total_count: existingLicence.total_count + Math.max(10, quantity)
            });
          }
        }
      }
    }

    let devicesCreated = 0;
    let vehiclesCreated = 0;

    for (const dev of devices) {
      const existingDevice = await Device.findByImei(dev.imei);
      if (existingDevice) continue;

      const device = await Device.create({
        imei: dev.imei,
        device_name: dev.deviceName,
        model: 'GPS Tracker',
        plan,
        status: 'active',
        organization_id: organizationId,
        assigned_user_id: user.id,
        onboard_date: new Date(),
        licence_expire_date: expireDate,
      });

      const vehicle = await Vehicle.create({
        vehicle_name: dev.vehicle?.vehicleName || dev.deviceName,
        vehicle_identifier: dev.imei,
        registration_number: dev.vehicle?.registrationNumber || '',
        device_id: device.id,
        organization_id: organizationId,
        onboard_date: new Date(),
        licence_expire_date: expireDate,
        gps_sim_no: dev.vehicle?.gpsSimNo || '',
        odometer: dev.vehicle?.odoDistance ? parseFloat(dev.vehicle.odoDistance) : 0,
        service_engineer: dev.vehicle?.serviceEngineer || '',
        salesman: dev.vehicle?.salesman || '',
        ticket_id: dev.vehicle?.ticketId || '',
        sensor_no: dev.vehicle?.sensorNo || '',
        status: 'active'
      });

      if (dev.vehicle?.groupId) {
        const groupResult = await Group.addVehicle(dev.vehicle.groupId, vehicle.id);
        if (groupResult.error) console.warn('Group link warning:', groupResult.error);
      }

      devicesCreated++;
      vehiclesCreated++;
    }

    if (userType === 'existing') {
      await Licence.incrementUsed(organizationId, plan, quantity);
    }

    return res.status(201).json({
      success: true,
      message: 'Onboarding complete',
      data: { user: { id: user.id, username: user.email, email: user.email }, devicesCreated, vehiclesCreated },
    });
  } catch (err) {
    console.error('Onboard device error:', err);
    return res.status(500).json({ success: false, message: 'Onboarding failed: ' + err.message });
  }
};

const getAvailableLicences = async (req, res) => {
  try {
    const orgId = req.user.role === 'admin' || req.user.role === 'superadmin' 
      ? (req.query.organizationId || req.user.organizationId) 
      : req.user.organizationId;

    if (!orgId) {
      return res.json({ success: true, data: [], totalAvailable: 0 });
    }

    let licences = await Licence.findByOrganization(orgId);
    
    // Auto-initialize default test licences if none exist for this organization
    if (licences.length === 0) {
      const planDurations = { starter: 30, basic: 90, advance: 180, premium: 365, premium_plus: 365 };
      for (const [tier, duration] of Object.entries(planDurations)) {
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + duration);
        await Licence.create({
          organization_id: orgId,
          tier,
          total_count: 50,
          used_count: 0,
          expire_date: expireDate
        });
      }
      licences = await Licence.findByOrganization(orgId);
    }

    let totalAvailable = 0;
    const data = licences.map(l => {
      const available = Math.max(0, parseInt(l.total_count || 0) - parseInt(l.used_count || 0));
      totalAvailable += available;
      return {
        id: l.id,
        tier: l.tier,
        totalCount: parseInt(l.total_count || 0),
        usedCount: parseInt(l.used_count || 0),
        available: available,
        expireDate: l.expire_date
      };
    });

    return res.json({ success: true, data, totalAvailable });
  } catch (err) {
    console.error('Get available licences error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch available licences' });
  }
};

const getBillingOverview = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', tab = 'all' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    const { query } = require('../config/db');

    // 1. Get licence summary totals (Total & Available) by tier
    const { rows: licenceTiersRow } = await query(`
      SELECT 
        COALESCE(tier, plan_type, 'basic') as tier,
        SUM(total_count) as total,
        SUM(used_count) as used
      FROM licences
      GROUP BY COALESCE(tier, plan_type, 'basic')
    `);

    const totalSummary = { starter: 0, basic: 0, advance: 0, premium: 0, premium_plus: 0 };
    const availableSummary = { starter: 0, basic: 0, advance: 0, premium: 0, premium_plus: 0 };

    const tierConfig = {
      starter_plus: { name: 'Starter Plus', dbKeys: ['starter_plus', 'starter-plus', 'starter plus'] },
      starter: { name: 'Starter', dbKeys: ['starter'] },
      basic: { name: 'Basic', dbKeys: ['basic'] },
      advance: { name: 'Advance', dbKeys: ['advance', 'advanced'] },
      premium: { name: 'Premium', dbKeys: ['premium'] },
      premium_plus: { name: 'Premium Plus', dbKeys: ['premium_plus', 'premium-plus', 'premium plus'] }
    };

    licenceTiersRow.forEach(row => {
      const dbTier = (row.tier || '').toLowerCase().trim();
      let matchedKey = null;
      for (const [key, config] of Object.entries(tierConfig)) {
        if (config.dbKeys.includes(dbTier)) {
          matchedKey = key;
          break;
        }
      }

      if (matchedKey) {
        // Map starter_plus to starter for standard overview box
        const mapKey = matchedKey === 'starter_plus' ? 'starter' : matchedKey;
        if (totalSummary[mapKey] !== undefined) {
          totalSummary[mapKey] += parseInt(row.total || 0);
          availableSummary[mapKey] += Math.max(0, parseInt(row.total || 0) - parseInt(row.used || 0));
        }
      } else {
        totalSummary.basic += parseInt(row.total || 0);
        availableSummary.basic += Math.max(0, parseInt(row.total || 0) - parseInt(row.used || 0));
      }
    });

    // 2. Query individual devices / licences
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (d.imei ILIKE $${paramIndex} OR d.device_name ILIKE $${paramIndex} OR v.registration_number ILIKE $${paramIndex} OR v.vehicle_name ILIKE $${paramIndex} OR o.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (tab === 'renew') {
      whereClause += ` AND d.licence_expire_date <= NOW() + INTERVAL '30 days'`;
    } else if (tab === 'pre-renewed') {
      whereClause += ` AND d.status = 'pre-renewed'`;
    } else if (tab === 'expired') {
      whereClause += ` AND d.licence_expire_date < NOW()`;
    }

    // Paginated query
    const listQuery = `
      SELECT 
        d.id as id,
        d.imei,
        d.device_name,
        d.model as device_model,
        d.plan as plan_type,
        d.status as device_status,
        d.onboard_date,
        d.licence_expire_date,
        v.registration_number,
        v.vehicle_name,
        v.gps_sim_no,
        v.licence_issued_date,
        o.name as organization_name,
        o.id as organization_id,
        u.username as dealer_name
      FROM devices d
      LEFT JOIN vehicles v ON d.id = v.device_id
      LEFT JOIN organizations o ON d.organization_id = o.id
      LEFT JOIN users u ON d.assigned_user_id = u.id
      ${whereClause}
      ORDER BY d.licence_expire_date ASC, d.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM devices d
      LEFT JOIN vehicles v ON d.id = v.device_id
      LEFT JOIN organizations o ON d.organization_id = o.id
      LEFT JOIN users u ON d.assigned_user_id = u.id
      ${whereClause}
    `;

    const listParams = [...params, limitNum, offset];
    const { rows: listResult } = await query(listQuery, listParams);
    const { rows: countResult } = await query(countQuery, params);
    const totalCount = parseInt(countResult[0].count);

    return res.json({
      success: true,
      data: {
        totalSummary,
        availableSummary,
        licences: listResult,
        total: totalCount,
        page: parseInt(page),
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('getBillingOverview error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch billing overview' });
  }
};

const renewDeviceLicence = async (req, res) => {
  try {
    const { deviceIds } = req.body;
    if (!deviceIds || (Array.isArray(deviceIds) && deviceIds.length === 0)) {
      return res.status(400).json({ success: false, message: 'Device ID(s) required' });
    }

    const ids = Array.isArray(deviceIds) ? deviceIds : [deviceIds];
    const planDurations = { starter: 30, basic: 90, advance: 180, premium: 365, premium_plus: 365 };
    const { query } = require('../config/db');

    let successCount = 0;

    for (const deviceId of ids) {
      const { rows: devRow } = await query('SELECT * FROM devices WHERE id = $1', [deviceId]);
      if (devRow.length === 0) continue;
      const device = devRow[0];

      const plan = device.plan || 'basic';
      const duration = planDurations[plan] || 90;
      
      const currentExpire = device.licence_expire_date ? new Date(device.licence_expire_date) : new Date();
      const isExpired = currentExpire < new Date();

      let newExpire = new Date(currentExpire);
      let newStatus = 'active';

      if (isExpired) {
        newExpire = new Date();
        newExpire.setDate(newExpire.getDate() + duration);
      } else {
        newExpire.setDate(newExpire.getDate() + duration);
        newStatus = 'pre-renewed';
      }

      await query(
        `UPDATE devices SET licence_expire_date = $1, status = $2, updated_at = NOW() WHERE id = $3`,
        [newExpire, newStatus, deviceId]
      );

      await query(
        `UPDATE vehicles SET licence_expire_date = $1, status = $2, updated_at = NOW() WHERE device_id = $3`,
        [newExpire, newStatus, deviceId]
      );

      successCount++;
    }

    return res.json({ success: true, message: `Successfully renewed ${successCount} licence(s)` });
  } catch (err) {
    console.error('renewDeviceLicence error:', err);
    return res.status(500).json({ success: false, message: 'Failed to renew licence(s)' });
  }
};

const cancelPreRenewDeviceLicence = async (req, res) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId) return res.status(400).json({ success: false, message: 'Device ID required' });
    const { query } = require('../config/db');

    const { rows: devRow } = await query('SELECT * FROM devices WHERE id = $1', [deviceId]);
    if (devRow.length === 0) return res.status(404).json({ success: false, message: 'Device not found' });
    const device = devRow[0];

    if (device.status !== 'pre-renewed') {
      return res.status(400).json({ success: false, message: 'Device is not in pre-renewed state' });
    }

    const planDurations = { starter: 30, basic: 90, advance: 180, premium: 365, premium_plus: 365 };
    const plan = device.plan || 'basic';
    const duration = planDurations[plan] || 90;

    const currentExpire = new Date(device.licence_expire_date);
    let newExpire = new Date(currentExpire);
    newExpire.setDate(newExpire.getDate() - duration);

    const newStatus = newExpire < new Date() ? 'expired' : 'active';

    await query(
      `UPDATE devices SET licence_expire_date = $1, status = $2, updated_at = NOW() WHERE id = $3`,
      [newExpire, newStatus, deviceId]
    );

    await query(
      `UPDATE vehicles SET licence_expire_date = $1, status = $2, updated_at = NOW() WHERE device_id = $3`,
      [newExpire, newStatus, deviceId]
    );

    return res.json({ success: true, message: 'Successfully cancelled pre-renewal' });
  } catch (err) {
    console.error('cancelPreRenewDeviceLicence error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel pre-renewal' });
  }
};

const updateDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    const updated = await Device.update(req.params.id, req.body);
    return res.json({ success: true, message: 'Device updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update device' });
  }
};

const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });
    await Device.delete(req.params.id);
    return res.json({ success: true, message: 'Device deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete device' });
  }
};

module.exports = { 
  getDevices, 
  getDeviceById, 
  checkImei, 
  onboardDevice, 
  updateDevice, 
  deleteDevice, 
  getAvailableLicences,
  getBillingOverview,
  renewDeviceLicence,
  cancelPreRenewDeviceLicence
};