const User = require('../models/User');
const { hashPassword } = require('../utils/hash.utils');

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const result = await User.findAll({ page: parseInt(page), limit: parseInt(limit), search, role });

    return res.json({
      success: true,
      data: result.data.map(u => ({
        id: u.id,
        username: u.email,
        email: u.email,
        mobile: u.phone,
        role: u.role,
        organizationId: u.organization_id,
        organizationName: u.organization_name,
        companyName: u.organization_name || '',
        userMode: 'asset',
        isActive: u.is_active,
        lastLogin: u.last_login,
        createdAt: u.created_at,
      })),
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.email,
        email: user.email,
        mobile: user.phone,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        companyName: user.organization_name || '',
        userMode: 'asset',
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, mobile, password, role, organization_id, company_name, user_mode } = req.body;

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      mobile,
      password_hash: passwordHash,
      role,
      organization_id,
      company_name,
      user_mode,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        username: user.email,
        email: user.email,
        mobile: user.phone,
        role: user.role,
        organizationId: user.organization_id,
      },
    });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create user' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { username, email, mobile, company_name, user_mode, is_active } = req.body;

    if (username && username !== user.username) {
      const existing = await User.findByUsername(username);
      if (existing) return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const updated = await User.update(req.params.id, { username, email, mobile, company_name, user_mode, is_active });

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updated.id,
        username: updated.email,
        email: updated.email,
        mobile: updated.phone,
        role: updated.role,
        organizationId: updated.organization_id,
        isActive: updated.is_active,
      },
    });
  } catch (err) {
    console.error('Update user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await User.delete(req.params.id);
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

const addUserToGroups = async (req, res) => {
  try {
    const Group = require('../models/Group');
    const { user_ids } = req.body;
    const groupId = req.params.id;

    const results = [];
    for (const userId of user_ids) {
      const result = await Group.addUser(userId, groupId);
      results.push({ userId, ...result });
    }

    return res.json({
      success: true,
      message: `Added ${user_ids.length} user(s) to group`,
      data: results,
    });
  } catch (err) {
    console.error('Add users to group error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add users to group' });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, addUserToGroups };