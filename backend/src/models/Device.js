const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Device = {
  async create(data) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO devices (id, imei, device_name, model, plan, status, organization_id, assigned_user_id, onboard_date, licence_expire_date, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now(),now())
       RETURNING *`,
      [id, data.imei, data.device_name, data.model, data.plan, data.status || 'unassigned', data.organization_id, data.assigned_user_id, data.onboard_date, data.licence_expire_date]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query('SELECT d.*, v.vehicle_name, v.registration_number, u.username as assigned_username FROM devices d LEFT JOIN vehicles v ON d.id = v.device_id LEFT JOIN users u ON d.assigned_user_id = u.id WHERE d.id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByImei(imei) {
    const result = await query('SELECT * FROM devices WHERE imei = $1', [imei]);
    return result.rows[0] || null;
  },

  async findAll(options = {}) {
    const { page = 1, limit = 20, search = '', status, plan } = options;
    const offset = (page - 1) * limit;
    const params = [];
    let paramCount = 0;
    let where = '';

    if (search) {
      paramCount++;
      where += ` AND (d.imei ILIKE $${paramCount} OR d.device_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (status) {
      paramCount++;
      where += ` AND d.status = $${paramCount}`;
      params.push(status);
    }
    if (plan) {
      paramCount++;
      where += ` AND d.plan = $${paramCount}`;
      params.push(plan);
    }

    const result = await query(
      `SELECT d.*, o.name as organization_name, u.username as assigned_username, v.vehicle_name, v.registration_number
       FROM devices d LEFT JOIN organizations o ON d.organization_id = o.id LEFT JOIN users u ON d.assigned_user_id = u.id LEFT JOIN vehicles v ON d.id = v.device_id
       WHERE 1=1 ${where} ORDER BY d.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM devices d WHERE 1=1 ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async update(id, updates) {
    const allowed = ['device_name', 'model', 'plan', 'status', 'assigned_user_id', 'organization_id', 'onboard_date', 'licence_expire_date'];
    const sets = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(updates)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = $${i}`);
        values.push(value);
        i++;
      }
    }
    if (sets.length === 0) return null;
    sets.push('updated_at = now()');
    values.push(id);
    const result = await query(`UPDATE devices SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, values);
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await query('DELETE FROM devices WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async assignToUser(deviceId, userId) {
    const result = await query(
      `UPDATE devices SET assigned_user_id = $1, status = 'active', updated_at = now() WHERE id = $2 RETURNING *`,
      [userId, deviceId]
    );
    return result.rows[0];
  },
};

module.exports = Device;