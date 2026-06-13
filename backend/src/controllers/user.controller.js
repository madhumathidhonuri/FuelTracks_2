const User = require('../models/User');
const { hashPassword } = require('../utils/hash.utils');
const jwt = require('../utils/jwt.utils');

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '' } = req.query;
    const result = await User.findAll({ page: parseInt(page), limit: parseInt(limit), search, role });

    return res.json({
      success: true,
      data: result.data.map(u => ({
        id: u.id,
        username: u.username || u.email,
        email: u.email,
        mobile: u.phone,
        role: u.role,
        organizationId: u.organization_id,
        organizationName: u.organization_name,
        companyName: u.company_name || u.organization_name || '',
        userMode: u.user_mode || 'virtual',
        isActive: u.is_active,
        lastLogin: u.last_login,
        createdAt: u.created_at,
        alternateEmail: u.alternate_email || '',
        zoho: u.zoho || '',
        enableDebugs: u.enable_debugs || 'Disable',
        selectedGroups: u.selected_groups || [],
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
        username: user.username || user.email,
        email: user.email,
        mobile: user.phone,
        role: user.role,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
        companyName: user.company_name || user.organization_name || '',
        userMode: user.user_mode || 'virtual',
        isActive: user.is_active,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        alternateEmail: user.alternate_email || '',
        zoho: user.zoho || '',
        enableDebugs: user.enable_debugs || 'Disable',
        selectedGroups: user.selected_groups || [],
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

const createUser = async (req, res) => {
  try {
    const { username, email, mobile, password, role, organization_id, company_name, user_mode, alternate_email, zoho, enable_debugs, selected_groups } = req.body;

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
      alternate_email,
      zoho,
      enable_debugs,
      selected_groups,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        username: user.username || user.email,
        email: user.email,
        mobile: user.phone,
        role: user.role,
        organizationId: user.organization_id,
        alternateEmail: user.alternate_email,
        zoho: user.zoho,
        enableDebugs: user.enable_debugs,
        userMode: user.user_mode,
        selectedGroups: user.selected_groups,
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

    const { username, email, mobile, company_name, user_mode, is_active, alternate_email, zoho, enable_debugs, selected_groups, role } = req.body;

    if (username && username !== user.username) {
      const existing = await User.findByUsername(username);
      if (existing) return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const updated = await User.update(req.params.id, { username, email, mobile, company_name, user_mode, is_active, alternate_email, zoho, enable_debugs, selected_groups, role });

    return res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updated.id,
        username: updated.username || updated.email,
        email: updated.email,
        mobile: updated.phone,
        role: updated.role,
        organizationId: updated.organization_id,
        isActive: updated.is_active,
        alternateEmail: updated.alternate_email,
        zoho: updated.zoho,
        enableDebugs: updated.enable_debugs,
        userMode: updated.user_mode,
        selectedGroups: updated.selected_groups,
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

const switchLogin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(400).json({ success: false, message: 'User is inactive' });
    }

    const accessToken = jwt.generateAccessToken(user);
    const refreshToken = jwt.generateRefreshToken(user);

    await User.updateLastLogin(user.id);

    return res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username || user.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || user.email,
          email: user.email,
          role: user.role,
          organizationId: user.organization_id,
        },
      },
    });
  } catch (err) {
    console.error('Switch login error:', err);
    return res.status(500).json({ success: false, message: 'Failed to switch login' });
  }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser, addUserToGroups, switchLogin };