const jwt = require('../utils/jwt.utils');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  const decoded = jwt.verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }

  req.user = {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role,
    organizationId: decoded.organizationId,
  };

  req.user.ip = req.ip || req.connection.remoteAddress || '0.0.0.0';

  next();
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verifyAccessToken(token);
    if (decoded) {
      req.user = {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        organizationId: decoded.organizationId,
      };
    }
  }

  next();
};

module.exports = { authenticate, optionalAuth };