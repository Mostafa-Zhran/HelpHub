const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'helphub_secure_secret_key_2026!';

module.exports = function volunteerAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Volunteer authentication required.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'volunteer') {
      return res.status(403).json({ success: false, message: 'Access denied. Volunteer role required.' });
    }
    req.volunteer = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired volunteer token.' });
  }
};
