const User = require('../models/User');
const jwt = require('../utils/jwt.utils');
const { comparePassword } = require('../utils/hash.utils');
const { sendWelcomeEmail } = require('../services/email.service');
const { sendWelcomeSMS } = require('../services/sms.service');
const { generateRandomPassword, hashPassword } = require('../utils/hash.utils');

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = email || username;
    console.log('--- LOGIN DEBUG ---', { body: req.body, resolvedIdentifier: loginIdentifier });

    const user = await User.findByEmail(loginIdentifier);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Contact support.' });
    }

    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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
          username: user.email,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
          email: user.email,
          role: user.role,
          organizationId: user.organization_id,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verifyRefreshToken(token);

    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'User not found or inactive' });
    }

    const newAccessToken = jwt.generateAccessToken(user);
    const newRefreshToken = jwt.generateRefreshToken(user);

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    return res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
};

const logout = async (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        organizationId: user.organization_id,
        companyName: user.company_name,
        userMode: user.user_mode,
        lastLogin: user.last_login,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { email, mobile, company_name } = req.body;
    const updated = await User.update(req.user.id, { email, mobile, company_name });

    if (!updated) return res.status(400).json({ success: false, message: 'No changes made' });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        mobile: updated.mobile,
        role: updated.role,
        organizationId: updated.organization_id,
        companyName: updated.company_name,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Profile update failed' });
  }
};

module.exports = { login, refreshToken, logout, getProfile, updateProfile };