const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Alert = {
  async create(data) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO alerts (id, vehicle_id, organization_id, alert_type, severity, message, latitude, longitude, speed, is_read, email_sent, sms_sent, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
       RETURNING *`,
      [id, data.vehicle_id, data.organization_id, data.alert_type, data.severity || 'medium',
       data.message, data.latitude, data.longitude, data.speed, data.is_read || false,
       data.email_sent || false, data.sms_sent || false]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT a.*, v.vehicle_name, v.registration_number
       FROM alerts a LEFT JOIN vehicles v ON a.vehicle_id = v.id WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByOrganization(organizationId, options = {}) {
    const { page = 1, limit = 20, isRead, alertType, severity } = options;
    const offset = (page - 1) * limit;
    const params = [organizationId];
    let where = 'WHERE a.organization_id = $1';
    let paramCount = 1;

    if (isRead !== undefined) {
      paramCount++;
      where += ` AND a.is_read = $${paramCount}`;
      params.push(isRead);
    }
    if (alertType) {
      paramCount++;
      where += ` AND a.alert_type = $${paramCount}`;
      params.push(alertType);
    }
    if (severity) {
      paramCount++;
      where += ` AND a.severity = $${paramCount}`;
      params.push(severity);
    }

    const result = await query(
      `SELECT a.*, v.vehicle_name, v.registration_number
       FROM alerts a LEFT JOIN vehicles v ON a.vehicle_id = v.id
       ${where} ORDER BY a.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM alerts a ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async findByVehicle(vehicleId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT * FROM alerts WHERE vehicle_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [vehicleId, limit, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM alerts WHERE vehicle_id = $1', [vehicleId]);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async markRead(id) {
    const result = await query('UPDATE alerts SET is_read = true WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  async markAllRead(organizationId) {
    await query('UPDATE alerts SET is_read = true WHERE organization_id = $1 AND is_read = false', [organizationId]);
  },

  async delete(id) {
    const result = await query('DELETE FROM alerts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async getUnreadCount(organizationId) {
    const result = await query('SELECT COUNT(*) FROM alerts WHERE organization_id = $1 AND is_read = false', [organizationId]);
    return parseInt(result.rows[0].count);
  },

  async getRecent(organizationId, limitCount = 10) {
    const result = await query(
      `SELECT a.*, v.vehicle_name, v.registration_number
       FROM alerts a LEFT JOIN vehicles v ON a.vehicle_id = v.id
       WHERE a.organization_id = $1 ORDER BY a.created_at DESC LIMIT $2`,
      [organizationId, limitCount]
    );
    return result.rows;
  },

  async getByType(organizationId, alertType, from, to) {
    const result = await query(
      `SELECT a.*, v.vehicle_name, v.registration_number
       FROM alerts a LEFT JOIN vehicles v ON a.vehicle_id = v.id
       WHERE a.organization_id = $1 AND a.alert_type = $2 AND a.created_at >= $3 AND a.created_at <= $4
       ORDER BY a.created_at DESC`,
      [organizationId, alertType, from, to]
    );
    return result.rows;
  },
};

module.exports = Alert;