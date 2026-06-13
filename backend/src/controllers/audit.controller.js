const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', entityType } = req.query;
    const result = await AuditLog.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      entityType,
    });

    return res.json({
      success: true,
      data: result.data,
      total: result.total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error('Get audit logs error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
  }
};

module.exports = { getAuditLogs };
