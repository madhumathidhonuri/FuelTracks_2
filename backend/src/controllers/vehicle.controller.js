const Vehicle = require('../models/Vehicle');

const getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status, organizationId } = req.query;

    if (req.user.role === 'admin') {
      const result = await Vehicle.findAll({ page: parseInt(page), limit: parseInt(limit), search, organizationId });
      return res.json({ success: true, data: result.data, total: result.total, page: parseInt(page), limit: parseInt(limit) });
    } else {
      const result = await Vehicle.findByOrganization(req.user.organizationId, { page: parseInt(page), limit: parseInt(limit), search, status });
      return res.json({ success: true, data: result.data, total: result.total, page: parseInt(page), limit: parseInt(limit) });
    }
  } catch (err) {
    console.error('Get vehicles error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    return res.json({ success: true, data: vehicle });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vehicle' });
  }
};

const getVehicleStatusAll = async (req, res) => {
  try {
    const orgId = req.user.role === 'admin' ? (req.query.organizationId || req.user.organizationId) : req.user.organizationId;
    const summary = await Vehicle.getStatusSummary(orgId);
    return res.json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vehicle status' });
  }
};

const createVehicle = async (req, res) => {
  try {
    const orgId = req.body.organization_id || req.user.organizationId;
    if (!orgId) {
      return res.status(400).json({ success: false, message: 'Organization is not set. Please select or set an organization for this vehicle.' });
    }
    const vehicle = await Vehicle.create({ ...req.body, organization_id: orgId });
    return res.status(201).json({ success: true, message: 'Vehicle created', data: vehicle });
  } catch (err) {
    console.error('Create vehicle error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create vehicle: ' + err.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const updated = await Vehicle.update(req.params.id, req.body);
    return res.json({ success: true, message: 'Vehicle updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update vehicle' });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    await Vehicle.delete(req.params.id);
    return res.json({ success: true, message: 'Vehicle deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete vehicle' });
  }
};

const searchVehicles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, data: [] });

    const orgId = req.user.role === 'admin' ? req.query.organizationId : req.user.organizationId;
    const result = await Vehicle.findByOrganization(orgId, { search: q, limit: 20 });

    return res.json({ success: true, data: result.data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Search failed' });
  }
};

module.exports = { getVehicles, getVehicleById, getVehicleStatusAll, createVehicle, updateVehicle, deleteVehicle, searchVehicles };