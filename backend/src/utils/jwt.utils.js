const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (err) {
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret);
  } catch (err) {
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
};

const getTokenExpiry = (token) => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return new Date(decoded.exp * 1000);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiry,
};