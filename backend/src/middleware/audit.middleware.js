const AuditLog = require('../models/AuditLog');

const METHODS_TO_LOG = ['POST', 'PUT', 'PATCH', 'DELETE'];

const audit = (req, res, next) => {
  if (!METHODS_TO_LOG.includes(req.method)) return next();

  const originalSend = res.send;

  res.send = function (body) {
    res.locals.body = body;

    if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
      setImmediate(async () => {
        try {
          const entityType = getEntityType(req.path);
          const entityId = extractEntityId(req.path, body);

          await AuditLog.create({
            user_id: req.user.id,
            user_name: req.user.username,
            user_ip: req.user.ip || req.ip || '0.0.0.0',
            action: `${req.method} ${req.originalUrl}`,
            entity_type: entityType,
            entity_id: entityId,
            new_values: req.body,
            description: `${req.user.username} ${req.method.toLowerCase()}ed ${entityType}`,
          });
        } catch (err) {
          console.error('Audit log error:', err.message);
        }
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

const getEntityType = (path) => {
  const parts = path.split('/').filter(Boolean);
  if (parts.length < 2) return 'unknown';
  return parts[1] || 'unknown';
};

const extractEntityId = (path, body) => {
  try {
    const parts = path.split('/').filter(Boolean);
    if (parts.length >= 3 && isUUID(parts[2])) return parts[2];
    if (body) {
      const parsed = typeof body === 'string' ? JSON.parse(body) : body;
      if (parsed.data?.id) return parsed.data.id;
      if (parsed.id) return parsed.id;
    }
  } catch {}
  return null;
};

const isUUID = (str) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

module.exports = { audit };