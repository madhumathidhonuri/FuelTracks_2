/**
 * Role-based Access Control Middleware
 * Only two roles: admin and user
 */

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

const requireSameOrg = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const targetOrgId = req.params.organizationId || req.body.organization_id;

  if (req.user.role === 'admin') return next();

  if (targetOrgId && req.user.organizationId !== targetOrgId) {
    return res.status(403).json({ success: false, message: 'Access denied to this organization' });
  }

  next();
};

module.exports = { requireAdmin, requireAuth, requireSameOrg };