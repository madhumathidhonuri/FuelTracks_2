const Alert = require('../models/Alert');

const getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, alertType, severity } = req.query;
    const orgId = req.user.role === 'admin' ? (req.query.organizationId || req.user.organizationId) : req.user.organizationId;

    const result = await Alert.findByOrganization(orgId, {
      page: parseInt(page),
      limit: parseInt(limit),
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      alertType,
      severity,
    });

    return res.json({ success: true, data: result.data, total: result.total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
};

const getUnread = async (req, res) => {
  try {
    const orgId = req.user.role === 'admin' ? (req.query.organizationId || req.user.organizationId) : req.user.organizationId;
    const count = await Alert.getUnreadCount(orgId);
    const recent = await Alert.getRecent(orgId, 10);
    return res.json({ success: true, data: { count, recent } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch unread alerts' });
  }
};

const markRead = async (req, res) => {
  try {
    const alert = await Alert.markRead(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    return res.json({ success: true, message: 'Alert marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark alert as read' });
  }
};

const markAllRead = async (req, res) => {
  try {
    const orgId = req.user.role === 'admin' ? (req.query.organizationId || req.user.organizationId) : req.user.organizationId;
    await Alert.markAllRead(orgId);
    return res.json({ success: true, message: 'All alerts marked as read' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};

const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.delete(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    return res.json({ success: true, message: 'Alert deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete alert' });
  }
};

module.exports = { getAlerts, getUnread, markRead, markAllRead, deleteAlert };