const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const ArchivedAuditLog = {
  /**
   * Create a new archived audit log entry.
   * @param {Object} data - { category: string, audit_data: Object }
   * @returns {Promise<Object>} inserted row
   */
  async create(data) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO archived_audit_logs (id, category, audit_data, created_at, updated_at)
       VALUES ($1, $2, $3, now(), now()) RETURNING *`,
      [id, data.category, JSON.stringify(data.audit_data)]
    );
    return result.rows[0];
  },

  /**
   * Retrieve archived audit logs with optional filters.
   * @param {Object} options - pagination & filters
   * @returns {Promise<{data: Array, total: number}>}
   */
  async findAll(options = {}) {
    const { page = 1, limit = 20, category, from, to } = options;
    const offset = (page - 1) * limit;
    const params = [];
    let where = '';
    let idx = 0;
    if (category) {
      idx++; where += ` AND category = $${idx}`; params.push(category);
    }
    if (from) {
      idx++; where += ` AND created_at >= $${idx}`; params.push(from);
    }
    if (to) {
      idx++; where += ` AND created_at <= $${idx}`; params.push(to);
    }
    const result = await query(
      `SELECT * FROM archived_audit_logs WHERE 1=1 ${where} ORDER BY created_at DESC LIMIT $${idx + 1} OFFSET $${idx + 2}`,
      [...params, limit, offset]
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM archived_audit_logs WHERE 1=1 ${where}`,
      params
    );
    return { data: result.rows, total: parseInt(countResult.rows[0].count) };
  },

  /**
   * Find a single archived audit log by its ID.
   */
  async findById(id) {
    const result = await query('SELECT * FROM archived_audit_logs WHERE id = $1', [id]);
    return result.rows[0];
  }
};

module.exports = ArchivedAuditLog;
