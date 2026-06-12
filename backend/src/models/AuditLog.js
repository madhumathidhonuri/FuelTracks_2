const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const AuditLog = {
  async create(data) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO audit_logs (id, user_id, user_name, user_ip, action, entity_type, entity_id, old_values, new_values, description, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
       RETURNING *`,
      [id, data.user_id, data.user_name, data.user_ip, data.action, data.entity_type,
       data.entity_id, data.old_values ? JSON.stringify(data.old_values) : null,
       data.new_values ? JSON.stringify(data.new_values) : null, data.description]
    );
    return result.rows[0];
  },

  async findAll(options = {}) {
    const { page = 1, limit = 20, entityType, search, from, to } = options;
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';
    let paramCount = 0;

    if (entityType) {
      paramCount++;
      where += ` AND a.entity_type = $${paramCount}`;
      params.push(entityType);
    }
    if (search) {
      paramCount++;
      where += ` AND (a.user_name ILIKE $${paramCount} OR a.description ILIKE $${paramCount} OR a.action ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (from) {
      paramCount++;
      where += ` AND a.created_at >= $${paramCount}`;
      params.push(from);
    }
    if (to) {
      paramCount++;
      where += ` AND a.created_at <= $${paramCount}`;
      params.push(to);
    }

    const result = await query(
      `SELECT * FROM audit_logs a WHERE 1=1 ${where} ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM audit_logs a WHERE 1=1 ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async findByEntity(entityType, entityId) {
    const result = await query(
      'SELECT * FROM audit_logs WHERE entity_type = $1 AND entity_id = $2 ORDER BY created_at DESC',
      [entityType, entityId]
    );
    return result.rows;
  },

  async findByUser(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    const result = await query(
      'SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM audit_logs WHERE user_id = $1', [userId]);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async logAction(user, action, entityType, entityId, newValues, description) {
    return this.create({
      user_id: user.id,
      user_name: user.username,
      user_ip: user.ip || '0.0.0.0',
      action,
      entity_type: entityType,
      entity_id: entityId,
      new_values: newValues,
      description,
    });
  },

  async getByEntityTypeGroup(entityType, options = {}) {
    const { page = 1, limit = 20, from, to } = options;
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';
    let paramCount = 0;

    if (entityType) {
      paramCount++;
      where += ` AND a.entity_type = $${paramCount}`;
      params.push(entityType);
    }
    if (from) {
      paramCount++;
      where += ` AND a.created_at >= $${paramCount}`;
      params.push(from);
    }
    if (to) {
      paramCount++;
      where += ` AND a.created_at <= $${paramCount}`;
      params.push(to);
    }

    const result = await query(
      `SELECT * FROM audit_logs a WHERE 1=1 ${where} ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM audit_logs a WHERE 1=1 ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },
};

module.exports = AuditLog;