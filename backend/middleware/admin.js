/**
 * Admin Authorization Middleware
 *
 * Must be used after the auth middleware (which populates req.user).
 * Returns 401 if no user is attached, or 403 if the user's role
 * is not 'admin'. Otherwise, passes control to the next handler.
 */
const admin = (req, res, next) => {
  // Ensure the auth middleware ran first and attached a user
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }
  // Only allow users with the admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = admin;
