const ArchivedAuditLog = require('../models/ArchivedAuditLog');

/**
 * Controller for archived audit logs.
 */
const archivedAuditController = {
  /** Create a new archived audit entry */
  async create(req, res) {
    try {
      const { category, audit_data } = req.body;
      if (!category || !audit_data) {
        return res.status(400).json({ success: false, message: 'category and audit_data are required' });
      }
      const created = await ArchivedAuditLog.create({ category, audit_data });
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      console.error('ArchivedAudit create error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  /** Get paginated list of archived audit logs */
  async list(req, res) {
    try {
      const { page, limit, category, from, to } = req.query;
      const result = await ArchivedAuditLog.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        category,
        from,
        to,
      });
      return res.json({ success: true, data: result.data, total: result.total });
    } catch (err) {
      console.error('ArchivedAudit list error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  /** Get a single archived audit log by ID */
  async getById(req, res) {
    try {
      const { id } = req.params;
      const entry = await ArchivedAuditLog.findById(id);
      if (!entry) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      return res.json({ success: true, data: entry });
    } catch (err) {
      console.error('ArchivedAudit getById error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

module.exports = archivedAuditController;
