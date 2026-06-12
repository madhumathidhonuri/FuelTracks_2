const { query } = require('../config/db');

const Location = {
  async create(data) {
    const result = await query(
      `INSERT INTO locations (device_id, vehicle_id, latitude, longitude, speed, odometer, ignition, altitude, heading, satellites, protocol_status, packet_type, raw_message, device_time, server_time, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now(),now())
       RETURNING *`,
      [data.device_id, data.vehicle_id, data.latitude, data.longitude, data.speed || 0, data.odometer || 0,
       data.ignition || false, data.altitude, data.heading, data.satellites, data.protocol_status,
       data.packet_type, data.raw_message, data.device_time]
    );
    return result.rows[0];
  },

  async findLatestByVehicle(vehicleId) {
    const result = await query(
      `SELECT * FROM locations WHERE vehicle_id = $1 ORDER BY server_time DESC LIMIT 1`,
      [vehicleId]
    );
    return result.rows[0] || null;
  },

  async findLatestByDevice(deviceId) {
    const result = await query(
      `SELECT * FROM locations WHERE device_id = $1 ORDER BY server_time DESC LIMIT 1`,
      [deviceId]
    );
    return result.rows[0] || null;
  },

  async findByVehicleAndDateRange(vehicleId, from, to, options = {}) {
    const { limit = 1000, offset = 0 } = options;
    const result = await query(
      `SELECT * FROM locations WHERE vehicle_id = $1 AND server_time >= $2 AND server_time <= $3 ORDER BY server_time ASC LIMIT $4 OFFSET $5`,
      [vehicleId, from, to, limit, offset]
    );
    return result.rows;
  },

  async findByDeviceAndDateRange(deviceId, from, to, options = {}) {
    const { limit = 1000, offset = 0 } = options;
    const result = await query(
      `SELECT * FROM locations WHERE device_id = $1 AND server_time >= $2 AND server_time <= $3 ORDER BY server_time ASC LIMIT $4 OFFSET $5`,
      [deviceId, from, to, limit, offset]
    );
    return result.rows;
  },

  async getFleetPositions(organizationId) {
    const result = await query(
      `SELECT DISTINCT ON (v.id)
        v.id as vehicle_id, v.vehicle_name, v.registration_number, v.status as vehicle_status,
        l.latitude, l.longitude, l.speed, l.ignition, l.odometer, l.heading, l.server_time,
        d.imei, d.device_name, d.status as device_status
       FROM vehicles v
       JOIN devices d ON v.device_id = d.id
       JOIN locations l ON d.id = l.device_id
       WHERE v.organization_id = $1 AND v.status = 'active'
       ORDER BY v.id, l.server_time DESC`,
      [organizationId]
    );
    return result.rows;
  },

  async getAllLivePositions() {
    const result = await query(
      `SELECT DISTINCT ON (v.id)
        v.id as vehicle_id, v.vehicle_name, v.registration_number,
        l.latitude, l.longitude, l.speed, l.ignition, l.odometer, l.heading, l.server_time,
        d.imei, o.name as organization_name
       FROM vehicles v
       JOIN devices d ON v.device_id = d.id
       JOIN locations l ON d.id = l.device_id
       JOIN organizations o ON v.organization_id = o.id
       WHERE v.status = 'active'
       ORDER BY v.id, l.server_time DESC`
    );
    return result.rows;
  },

  async getLast24Hours(vehicleId) {
    const result = await query(
      `SELECT * FROM locations WHERE vehicle_id = $1 AND server_time >= now() - interval '24 hours' ORDER BY server_time ASC`,
      [vehicleId]
    );
    return result.rows;
  },
};

module.exports = Location;