const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Group = {
  async create({ name, organization_id, created_by }) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO groups (id, name, organization_id, created_by, created_at, updated_at)
       VALUES ($1,$2,$3,$4,now(),now()) RETURNING *`,
      [id, name, organization_id, created_by]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT g.*, u.username as created_by_username,
       (SELECT COUNT(*) FROM vehicle_groups vg WHERE vg.group_id = g.id) as vehicle_count
       FROM groups g LEFT JOIN users u ON g.created_by = u.id WHERE g.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByOrganization(organizationId) {
    const result = await query(
      `SELECT g.*, u.username as created_by_username,
       (SELECT COUNT(*) FROM vehicle_groups vg WHERE vg.group_id = g.id) as vehicle_count
       FROM groups g LEFT JOIN users u ON g.created_by = u.id
       WHERE g.organization_id = $1 ORDER BY g.created_at DESC`,
      [organizationId]
    );
    return result.rows;
  },

  async findAll(options = {}) {
    const { page = 1, limit = 20, search = '' } = options;
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';
    let paramCount = 0;

    if (search) {
      paramCount++;
      where += ` AND g.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    const result = await query(
      `SELECT g.*, o.name as organization_name, u.username as created_by_username,
       (SELECT COUNT(*) FROM vehicle_groups vg WHERE vg.group_id = g.id) as vehicle_count
       FROM groups g LEFT JOIN organizations o ON g.organization_id = o.id LEFT JOIN users u ON g.created_by = u.id
       WHERE 1=1 ${where} ORDER BY g.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM groups g WHERE 1=1 ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async update(id, updates) {
    const result = await query(
      `UPDATE groups SET name = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [updates.name, id]
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    await query('DELETE FROM vehicle_groups WHERE group_id = $1', [id]);
    await query('DELETE FROM user_groups WHERE group_id = $1', [id]);
    const result = await query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async addVehicle(groupId, vehicleId) {
    const id = uuidv4();
    try {
      const result = await query(
        `INSERT INTO vehicle_groups (id, vehicle_id, group_id, added_at) VALUES ($1,$2,$3,now()) RETURNING *`,
        [id, vehicleId, groupId]
      );
      return { data: result.rows[0], error: null };
    } catch (err) {
      if (err.code === '23505') return { data: null, error: 'Vehicle already in group' };
      throw err;
    }
  },

  async removeVehicle(groupId, vehicleId) {
    const result = await query(
      'DELETE FROM vehicle_groups WHERE group_id = $1 AND vehicle_id = $2 RETURNING *',
      [groupId, vehicleId]
    );
    return result.rows[0] || null;
  },

  async getVehicles(groupId) {
    const result = await query(
      `SELECT v.* FROM vehicles v JOIN vehicle_groups vg ON v.id = vg.vehicle_id WHERE vg.group_id = $1`,
      [groupId]
    );
    return result.rows;
  },

  async addUser(userId, groupId) {
    const id = uuidv4();
    try {
      const result = await query(
        `INSERT INTO user_groups (id, user_id, group_id, assigned_at) VALUES ($1,$2,$3,now()) RETURNING *`,
        [id, userId, groupId]
      );
      return { data: result.rows[0], error: null };
    } catch (err) {
      if (err.code === '23505') return { data: null, error: 'User already in group' };
      throw err;
    }
  },

  async removeUser(userId, groupId) {
    const result = await query(
      'DELETE FROM user_groups WHERE user_id = $1 AND group_id = $2 RETURNING *',
      [userId, groupId]
    );
    return result.rows[0] || null;
  },

  async getUsers(groupId) {
    const result = await query(
      `SELECT u.* FROM users u JOIN user_groups ug ON u.id = ug.user_id WHERE ug.group_id = $1`,
      [groupId]
    );
    return result.rows;
  },
};

module.exports = Group;