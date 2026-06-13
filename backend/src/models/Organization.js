const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Organization = {
  async create(data) {
    const id = uuidv4();
    const fields = [
      'id', 'name', 'email', 'mobile', 'address', 'city', 'state', 'timezone',
      'start_time', 'end_time', 'geofence_enabled', 'parking_alert', 'idle_alert',
      'overspeed_alert', 'towing_alert', 'tamper_alert', 'idle_duration',
      'parking_duration', 'overspeed_limit', 'route_deviation_meters',
      'sms_provider', 'sms_username', 'sms_password', 'sms_sender_id',
      'sms_entity_name', 'whatsapp_enabled', 'telegram_enabled', 'rfid_enabled',
      'daily_summary_enabled', 'is_active', 'settings',
      'description', 'fleet_os_email', 'show_geofences', 'overspeed_duration',
      'unauthorised_movement_alert', 'no_data_duration', 'sos_alert',
      'power_cut_off_alarm_duration', 'harsh_breaking_alert', 'trip_planned_time',
      'daily_diesel_summary', 'fuel_level_below', 'ongoing_fuel_alerts',
      'fuel_notification_alert', 'fuel_alarm', 'geofence_fuel_alert',
      'excess_consumption_filter', 'instant_fuel_alerts', 'verified_fuel_fill_theft_alert',
      'sms_sender', 'sms_pattern', 'sms_escalation', 'school_geofence',
      'geofence_immobilizer', 'send_geofence_sms', 'geofence'
    ];
    const values = [
      id, data.name, data.email, data.mobile, data.address, data.city, data.state,
      data.timezone || 'Asia/Kolkata', data.start_time, data.end_time,
      data.geofence_enabled ?? false, data.parking_alert ?? false,
      data.idle_alert ?? false, data.overspeed_alert ?? false,
      data.towing_alert ?? true, data.tamper_alert ?? true,
      data.idle_duration ?? 10, data.parking_duration ?? 10,
      data.overspeed_limit ?? 80, data.route_deviation_meters ?? 500,
      data.sms_provider, data.sms_username, data.sms_password,
      data.sms_sender_id, data.sms_entity_name,
      data.whatsapp_enabled ?? false, data.telegram_enabled ?? false,
      data.rfid_enabled ?? false, data.daily_summary_enabled ?? false,
      data.is_active ?? true, JSON.stringify(data.settings || {}),
      data.description, data.fleet_os_email, data.show_geofences ?? false, data.overspeed_duration ?? 0,
      data.unauthorised_movement_alert ?? false, data.no_data_duration, data.sos_alert ?? false,
      data.power_cut_off_alarm_duration ?? 0, data.harsh_breaking_alert ?? false, data.trip_planned_time ?? false,
      data.daily_diesel_summary ?? false, data.fuel_level_below ?? false, data.ongoing_fuel_alerts ?? false,
      data.fuel_notification_alert || 'Always', data.fuel_alarm ?? false, data.geofence_fuel_alert || 'Both',
      data.excess_consumption_filter ?? false, data.instant_fuel_alerts ?? false, data.verified_fuel_fill_theft_alert ?? true,
      data.sms_sender, data.sms_pattern, data.sms_escalation ?? false, data.school_geofence ?? false,
      data.geofence_immobilizer ?? false, data.send_geofence_sms, data.geofence
    ];
    const result = await query(
      `INSERT INTO organizations (${fields.join(',')}) VALUES (${fields.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findAll(options = {}) {
    const { page = 1, limit = 20, search = '', isActive } = options;
    const offset = (page - 1) * limit;
    const params = [];
    let paramCount = 0;
    let where = '';

    if (search) {
      paramCount++;
      where += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR mobile ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (isActive !== undefined) {
      paramCount++;
      where += ` AND is_active = $${paramCount}`;
      params.push(isActive);
    }

    const result = await query(
      `SELECT * FROM organizations WHERE 1=1 ${where} ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(`SELECT COUNT(*) FROM organizations WHERE 1=1 ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async update(id, updates) {
    const allowed = [
      'name', 'email', 'mobile', 'address', 'city', 'state', 'timezone',
      'start_time', 'end_time', 'geofence_enabled', 'parking_alert', 'idle_alert',
      'overspeed_alert', 'towing_alert', 'tamper_alert', 'idle_duration',
      'parking_duration', 'overspeed_limit', 'route_deviation_meters',
      'sms_provider', 'sms_username', 'sms_password', 'sms_sender_id',
      'sms_entity_name', 'whatsapp_enabled', 'telegram_enabled', 'rfid_enabled',
      'daily_summary_enabled', 'is_active', 'settings',
      'description', 'fleet_os_email', 'show_geofences', 'overspeed_duration',
      'unauthorised_movement_alert', 'no_data_duration', 'sos_alert',
      'power_cut_off_alarm_duration', 'harsh_breaking_alert', 'trip_planned_time',
      'daily_diesel_summary', 'fuel_level_below', 'ongoing_fuel_alerts',
      'fuel_notification_alert', 'fuel_alarm', 'geofence_fuel_alert',
      'excess_consumption_filter', 'instant_fuel_alerts', 'verified_fuel_fill_theft_alert',
      'sms_sender', 'sms_pattern', 'sms_escalation', 'school_geofence',
      'geofence_immobilizer', 'send_geofence_sms', 'geofence'
    ];
    const sets = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(updates)) {
      if (allowed.includes(key)) {
        sets.push(`${key} = $${i}`);
        if (key === 'settings' && typeof value === 'object') {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        i++;
      }
    }
    if (sets.length === 0) return null;
    sets.push('updated_at = now()');
    values.push(id);
    const result = await query(`UPDATE organizations SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, values);
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await query('DELETE FROM organizations WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },
};

module.exports = Organization;