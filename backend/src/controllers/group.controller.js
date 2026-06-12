const Group = require('../models/Group');

const getGroups = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    if (req.user.role === 'admin') {
      const result = await Group.findAll({ page: parseInt(page), limit: parseInt(limit), search });
      return res.json({ success: true, data: result.data, total: result.total });
    } else {
      const groups = await Group.findByOrganization(req.user.organizationId);
      return res.json({ success: true, data: groups });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch groups' });
  }
};

const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const vehicles = await Group.getVehicles(req.params.id);
    return res.json({ success: true, data: { ...group, vehicles } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch group' });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, vehicle_ids = [] } = req.body;
    const group = await Group.create({ name, organization_id: req.user.organizationId, created_by: req.user.id });

    for (const vehicleId of vehicle_ids) {
      await Group.addVehicle(group.id, vehicleId);
    }

    return res.status(201).json({ success: true, message: 'Group created', data: group });
  } catch (err) {
    console.error('Create group error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create group' });
  }
};

const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    const updated = await Group.update(req.params.id, req.body);
    return res.json({ success: true, message: 'Group updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update group' });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    await Group.delete(req.params.id);
    return res.json({ success: true, message: 'Group deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete group' });
  }
};

const addVehicles = async (req, res) => {
  try {
    const { vehicle_ids } = req.body;
    const results = [];
    for (const vehicleId of vehicle_ids) {
      const result = await Group.addVehicle(req.params.id, vehicleId);
      results.push({ vehicleId, ...result });
    }
    return res.json({ success: true, message: `Added ${vehicle_ids.length} vehicle(s)`, data: results });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add vehicles' });
  }
};

const removeVehicles = async (req, res) => {
  try {
    const { vehicle_ids } = req.body;
    for (const vehicleId of vehicle_ids) {
      await Group.removeVehicle(req.params.id, vehicleId);
    }
    return res.json({ success: true, message: `Removed ${vehicle_ids.length} vehicle(s)` });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to remove vehicles' });
  }
};

module.exports = { getGroups, getGroupById, createGroup, updateGroup, deleteGroup, addVehicles, removeVehicles };