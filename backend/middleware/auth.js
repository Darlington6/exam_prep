const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const go = (err) => {
    if (typeof next === 'function') next(err);
  };
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    req.user = user;
    go();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    go(err);
  }
};

const optionalAuth = async (req, res, next) => {
  const go = () => {
    if (typeof next === 'function') next(); 
  };
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return go();
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (user) req.user = user;
    go();
  } catch {
    go();
  }
};

module.exports = { auth, optionalAuth };
// This file defines two middleware functions for Express.js: `auth` and `optionalAuth`. The `auth` middleware checks for a valid JWT token in the Authorization header, verifies it, and attaches the corresponding user to the request object. If the token is missing, invalid, or expired, it responds with a 401 status. The `optionalAuth` middleware does the same but allows requests without a token to proceed without attaching a user. Both functions use a helper function `go` to handle errors and call the next middleware.