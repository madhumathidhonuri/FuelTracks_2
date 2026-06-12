const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const Licence = {
  async create(data) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO licences (id, organization_id, tier, total_count, used_count, is_active, expire_date, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,now(),now())
       RETURNING *`,
      [id, data.organization_id, data.tier, data.total_count || 0, data.used_count || 0, data.is_active ?? true, data.expire_date]
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await query('SELECT * FROM licences WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByOrganization(organizationId) {
    const result = await query('SELECT * FROM licences WHERE organization_id = $1 ORDER BY tier', [organizationId]);
    return result.rows;
  },

  async findByOrganizationAndTier(organizationId, tier) {
    const result = await query(
      'SELECT * FROM licences WHERE organization_id = $1 AND tier = $2',
      [organizationId, tier]
    );
    return result.rows[0] || null;
  },

  async getAvailableCount(organizationId, tier) {
    const result = await query(
      `SELECT (total_count - used_count) as available FROM licences WHERE organization_id = $1 AND tier = $2 AND is_active = true`,
      [organizationId, tier]
    );
    return result.rows[0] ? parseInt(result.rows[0].available) : 0;
  },

  async incrementUsed(organizationId, tier, count = 1) {
    const result = await query(
      `UPDATE licences SET used_count = used_count + $1, updated_at = now()
       WHERE organization_id = $2 AND tier = $3 RETURNING *`,
      [count, organizationId, tier]
    );
    return result.rows[0];
  },

  async decrementUsed(organizationId, tier, count = 1) {
    const result = await query(
      `UPDATE licences SET used_count = GREATEST(0, used_count - $1), updated_at = now()
       WHERE organization_id = $2 AND tier = $3 RETURNING *`,
      [count, organizationId, tier]
    );
    return result.rows[0];
  },

  async update(id, updates) {
    const allowed = ['total_count', 'is_active', 'expire_date'];
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
    const result = await query(`UPDATE licences SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, values);
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await query('DELETE FROM licences WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
  },

  async getExpiringSoon(days = 7) {
    const result = await query(
      `SELECT l.*, o.name as organization_name, o.email as organization_email
       FROM licences l JOIN organizations o ON l.organization_id = o.id
       WHERE l.expire_date <= now() + interval '${days} days' AND l.expire_date > now() AND l.is_active = true`
    );
    return result.rows;
  },

  async getAll(options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT l.*, o.name as organization_name
       FROM licences l JOIN organizations o ON l.organization_id = o.id
       ORDER BY l.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM licences');
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },
};

module.exports = Licence;