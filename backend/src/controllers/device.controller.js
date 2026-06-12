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
        role: 'admin',
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

      const available = await Licence.getAvailableCount(organizationId, plan);
      if (available < quantity) {
        return res.status(400).json({ success: false, message: `Not enough licences. Available: ${available}, Required: ${quantity}` });
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

module.exports = { getDevices, getDeviceById, checkImei, onboardDevice, updateDevice, deleteDevice };