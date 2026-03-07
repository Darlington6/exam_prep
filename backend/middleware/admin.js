/**
 * Admin middleware — must be used after auth middleware.
 * Checks that req.user.role === 'admin'.
 */
const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = admin;
