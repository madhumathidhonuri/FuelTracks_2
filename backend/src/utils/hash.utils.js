const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  if (!password) throw new Error('Password is required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
};

const generateRandomPassword = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomPassword,
};