const { query } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const RfidTag = {
  /**
   * Create a new RFID tag batch allocation
   */
  async create(data) {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO rfid_tags (id, quantity, status, created_at, updated_at)
       VALUES ($1, $2, $3, now(), now()) RETURNING *`,
      [id, parseInt(data.quantity), data.status || 'Active']
    );
    return result.rows[0];
  },

  /**
   * Get all RFID tag batches, ordered by newest first
   */
  async findAll() {
    const result = await query('SELECT * FROM rfid_tags ORDER BY created_at DESC');
    return result.rows;
  }
};

module.exports = RfidTag;
