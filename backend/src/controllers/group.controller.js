const Group = require('../models/Group');

const getGroups = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    let groups = [];
    let total = 0;

    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const result = await Group.findAll({ page: parseInt(page), limit: parseInt(limit), search });
      groups = result.data;
      total = result.total;
    } else {
      groups = await Group.findByOrganization(req.user.organizationId);
      total = groups.length;
    }

    // Fetch vehicles for each group to list them stacked on the frontend
    const enrichedGroups = [];
    for (const group of groups) {
      const vehicles = await Group.getVehicles(group.id);
      enrichedGroups.push({
        ...group,
        vehicles: vehicles.map(v => ({
          id: v.id,
          registrationNumber: v.registration_number,
          vehicleName: v.vehicle_name,
        }))
      });
    }

    return res.json({ success: true, data: enrichedGroups, total });
  } catch (err) {
    console.error('getGroups error:', err);
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
    
    // Find organization_id from the first vehicle if organizationId is not set on user
    let organizationId = req.user.organizationId;
    if (!organizationId && vehicle_ids.length > 0) {
      const Vehicle = require('../models/Vehicle');
      const firstVehicle = await Vehicle.findById(vehicle_ids[0]);
      if (firstVehicle) {
        organizationId = firstVehicle.organization_id;
      }
    }

    const group = await Group.create({ name, organization_id: organizationId || null, created_by: req.user.id });

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