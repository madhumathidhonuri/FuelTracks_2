const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Trip = {
  async create(data) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO trips (id, vehicle_id, organization_id, start_time, end_time, start_latitude, start_longitude, end_latitude, end_longitude, start_address, end_address, distance, duration, max_speed, avg_speed, idle_time, stop_count, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now())
       RETURNING *`,
      [id, data.vehicle_id, data.organization_id, data.start_time, data.end_time, data.start_latitude,
       data.start_longitude, data.end_latitude, data.end_longitude, data.start_address, data.end_address,
       data.distance || 0, data.duration || 0, data.max_speed || 0, data.avg_speed || 0,
       data.idle_time || 0, data.stop_count || 0]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query(
      `SELECT t.*, v.vehicle_name, v.registration_number, o.name as organization_name
       FROM trips t LEFT JOIN vehicles v ON t.vehicle_id = v.id LEFT JOIN organizations o ON t.organization_id = o.id
       WHERE t.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByVehicle(vehicleId, options = {}) {
    const { from, to, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    let where = 'WHERE t.vehicle_id = $1';
    const params = [vehicleId];
    let paramCount = 1;

    if (from) {
      paramCount++;
      where += ` AND t.start_time >= $${paramCount}`;
      params.push(from);
    }
    if (to) {
      paramCount++;
      where += ` AND t.start_time <= $${paramCount}`;
      params.push(to);
    }

    const result = await query(
      `SELECT t.* FROM trips t ${where} ORDER BY t.start_time DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM trips t ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async update(id, updates) {
    const allowed = ['end_time', 'end_latitude', 'end_longitude', 'end_address', 'distance', 'duration', 'max_speed', 'avg_speed', 'idle_time', 'stop_count'];
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
    values.push(id);
    const result = await query(`UPDATE trips SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, values);
    return result.rows[0] || null;
  },

  async getActiveTrip(vehicleId) {
    const result = await query(
      `SELECT * FROM trips WHERE vehicle_id = $1 AND end_time IS NULL ORDER BY start_time DESC LIMIT 1`,
      [vehicleId]
    );
    return result.rows[0] || null;
  },

  async endTrip(id, endData) {
    const result = await query(
      `UPDATE trips SET end_time = $1, end_latitude = $2, end_longitude = $3, end_address = $4, distance = $5, duration = $6, max_speed = $7, avg_speed = $8, idle_time = $9, stop_count = $10 WHERE id = $11 RETURNING *`,
      [endData.end_time, endData.end_latitude, endData.end_longitude, endData.end_address,
       endData.distance || 0, endData.duration || 0, endData.max_speed || 0, endData.avg_speed || 0,
       endData.idle_time || 0, endData.stop_count || 0, id]
    );
    return result.rows[0] || null;
  },

  async getSummary(vehicleId, from, to) {
    const result = await query(
      `SELECT COUNT(*) as total_trips, SUM(distance) as total_distance, SUM(duration) as total_duration,
       SUM(idle_time) as total_idle, SUM(stop_count) as total_stops,
       MAX(max_speed) as max_speed_recorded, AVG(avg_speed) as avg_speed_recorded
       FROM trips WHERE vehicle_id = $1 AND start_time >= $2 AND start_time <= $3`,
      [vehicleId, from, to]
    );
    return result.rows[0];
  },
};

module.exports = Trip;