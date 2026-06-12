const Organization = require('../models/Organization');

const getOrganizations = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', isActive } = req.query;
    const result = await Organization.findAll({
      page: parseInt(page), limit: parseInt(limit), search,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });

    return res.json({
      success: true,
      data: result.data.map(o => ({ ...o, id: o.id })),
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get organizations error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch organizations' });
  }
};

const getOrganizationById = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    return res.json({ success: true, data: org });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch organization' });
  }
};

const createOrganization = async (req, res) => {
  try {
    const org = await Organization.create(req.body);
    return res.status(201).json({ success: true, message: 'Organization created', data: org });
  } catch (err) {
    console.error('Create organization error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create organization' });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const existing = await Organization.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Organization not found' });

    const updated = await Organization.update(req.params.id, req.body);
    return res.json({ success: true, message: 'Organization updated', data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update organization' });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });
    await Organization.delete(req.params.id);
    return res.json({ success: true, message: 'Organization deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete organization' });
  }
};

module.exports = { getOrganizations, getOrganizationById, createOrganization, updateOrganization, deleteOrganization };