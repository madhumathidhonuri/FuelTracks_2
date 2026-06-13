const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const User = {
  async create({ username, email, mobile, phone, password_hash, role, organization_id, first_name, last_name, alternate_email, zoho, enable_debugs, user_mode, selected_groups }) {
    const id = uuidv4();
    const finalPhone = phone || mobile || '';
    const finalFirstName = first_name || username || '';
    const finalLastName = last_name || '';

    const result = await query(
      `INSERT INTO users (id, organization_id, username, email, password_hash, first_name, last_name, phone, role, is_active, alternate_email, zoho, enable_debugs, user_mode, selected_groups, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true,$10,$11,$12,$13,$14,now(),now())
       RETURNING *`,
      [id, organization_id, username, email, password_hash, finalFirstName, finalLastName, finalPhone, role, alternate_email, zoho, enable_debugs, user_mode, JSON.stringify(selected_groups || [])]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1 OR email = $1', [username]);
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async findByOrganization(organizationId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT u.* FROM users u WHERE u.organization_id = $1 ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`,
      [organizationId, limit, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM users WHERE organization_id = $1', [organizationId]);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async findAll(options = {}) {
    const { page = 1, limit = 20, search = '', role = '' } = options;
    const offset = (page - 1) * limit;
    let where = '';
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      where += ` AND (u.email ILIKE $${paramCount} OR u.phone ILIKE $${paramCount} OR u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (role) {
      paramCount++;
      where += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    const baseQuery = `SELECT u.*, o.name as organization_name FROM users u LEFT JOIN organizations o ON u.organization_id = o.id WHERE 1=1 ${where}`;
    const result = await query(`${baseQuery} ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`, [...params, limit, offset]);
    const countResult = await query(`SELECT COUNT(*) FROM users u WHERE 1=1 ${where}`, params);
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  async update(id, updates) {
    const allowedMap = {
      username: 'username',
      mobile: 'phone',
      phone: 'phone',
      email: 'email',
      first_name: 'first_name',
      last_name: 'last_name',
      is_active: 'is_active',
      alternate_email: 'alternate_email',
      zoho: 'zoho',
      enable_debugs: 'enable_debugs',
      user_mode: 'user_mode',
      selected_groups: 'selected_groups',
      role: 'role',
    };
    const sets = [];
    const values = [];
    let i = 1;
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = allowedMap[key];
      if (dbKey && value !== undefined) {
        sets.push(`${dbKey} = $${i}`);
        if (key === 'selected_groups' && Array.isArray(value)) {
          values.push(JSON.stringify(value));
        } else {
          values.push(value);
        }
        i++;
      }
    }
    if (sets.length === 0) return null;
    sets.push(`updated_at = now()`);
    values.push(id);
    const result = await query(`UPDATE users SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, values);
    return result.rows[0] || null;
  },

  async updateLastLogin(id) {
    await query('UPDATE users SET last_login = now() WHERE id = $1', [id]);
  },

  async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },
};

module.exports = User;