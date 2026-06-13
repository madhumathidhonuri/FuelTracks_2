const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Vehicle = {
  async create(data) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO vehicles (
        id, vehicle_name, vehicle_identifier, registration_number, device_id, organization_id, 
        gps_sim_no, timezone, apn, licence_issued_date, onboard_date, licence_expire_date, status, 
        service_engineer, salesman, ticket_id, sensor_no, odometer, 
        vehicle_type, make, model, year, color, fuel_type, tank_capacity,
        created_at, updated_at
      )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,now(),now())
       RETURNING *`,
      [
        id, data.vehicle_name, data.vehicle_identifier || data.registration_number, data.registration_number, data.device_id, data.organization_id,
        data.gps_sim_no, data.timezone || 'Asia/Kolkata', data.apn, data.licence_issued_date, data.onboard_date, data.licence_expire_date,
        data.status || 'active', data.service_engineer, data.salesman, data.ticket_id, data.sensor_no, data.odometer || 0,
        data.vehicle_type || 'car', data.make || '', data.model || '', data.year || '', data.color || '', data.fuel_type || '', data.tank_capacity || 0
      ]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT v.*, d.imei, d.device_name, d.plan, d.status as device_status, o.name as organization_name
       FROM vehicles v LEFT JOIN devices d ON v.device_id = d.id LEFT JOIN organizations o ON v.organization_id = o.id
       WHERE v.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByDeviceId(deviceId) {
    const result = await query('SELECT * FROM vehicles WHERE device_id = $1', [deviceId]);
    return result.rows[0] || null;
  },

  async findByOrganization(organizationId, options = {}) {
    const { page = 1, limit = 20, search = '', status } = options;
    const offset = (page - 1) * limit;
    const params = [organizationId];
    let where = ' AND v.organization_id = $1';
    let paramCount = 1;

    if (search) {
      paramCount++;
      where += ` AND (v.vehicle_name ILIKE $${paramCount} OR v.registration_number ILIKE $${paramCount} OR v.vehicle_identifier ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (status) {
      paramCount++;
      where += ` AND v.status = $${paramCount}`;
      params.push(status);
    }

    const result = await query(
      `SELECT v.*, d.imei, d.device_name, l.latitude, l.longitude, l.speed, l.ignition, l.server_time as last_comm
       FROM vehicles v LEFT JOIN devices d ON v.device_id = d.id LEFT JOIN locations l ON d.id = l.device_id
       WHERE (l.id IS NULL OR l.id IN (SELECT MAX(id) FROM locations GROUP BY device_id)) ${where}
       ORDER BY v.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM vehicles v WHERE v.organization_id = $1 ${where.replace(/v\./g, '')}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async findAll(options = {}) {
    const { page = 1, limit = 20, search = '', organizationId } = options;
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';
    let paramCount = 0;

    if (search) {
      paramCount++;
      where += ` AND (v.vehicle_name ILIKE $${paramCount} OR v.registration_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (organizationId) {
      paramCount++;
      where += ` AND v.organization_id = $${paramCount}`;
      params.push(organizationId);
    }

    const result = await query(
      `SELECT v.*, d.imei, o.name as organization_name,
       (SELECT l.speed FROM locations l WHERE l.device_id = d.id ORDER BY l.server_time DESC LIMIT 1) as current_speed,
       (SELECT l.ignition FROM locations l WHERE l.device_id = d.id ORDER BY l.server_time DESC LIMIT 1) as ignition,
       (SELECT l.server_time FROM locations l WHERE l.device_id = d.id ORDER BY l.server_time DESC LIMIT 1) as last_comm
       FROM vehicles v LEFT JOIN devices d ON v.device_id = d.id LEFT JOIN organizations o ON v.organization_id = o.id
       WHERE 1=1 ${where} ORDER BY v.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM vehicles v WHERE 1=1 ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async update(id, updates) {
    const allowed = ['vehicle_name', 'vehicle_identifier', 'registration_number', 'device_id', 'gps_sim_no', 'timezone', 'apn', 'licence_issued_date', 'onboard_date', 'licence_expire_date', 'status', 'service_engineer', 'salesman', 'ticket_id', 'sensor_no', 'odometer', 'organization_id'];
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
    const result = await query(`UPDATE vehicles SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, values);
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async getStatusSummary(organizationId) {
    const result = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN l.ignition = true AND l.speed > 0 THEN 1 END) as running,
        COUNT(CASE WHEN l.ignition = true AND l.speed = 0 THEN 1 END) as idle,
        COUNT(CASE WHEN l.ignition = false OR l.server_time < now() - interval '10 minutes' THEN 1 END) as offline
       FROM vehicles v LEFT JOIN devices d ON v.device_id = d.id LEFT JOIN locations l ON d.id = l.device_id
       WHERE v.organization_id = $1 AND v.status = 'active'`,
      [organizationId]
    );
    return result.rows[0];
  },
};

module.exports = Vehicle;