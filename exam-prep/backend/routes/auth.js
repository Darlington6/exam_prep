const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // same as User model
const User = require('../models/User');

const router = express.Router();

async function requireAuth(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return null;
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(401).json({ message: 'User not found.' });
      return null;
    }
    return user;
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Invalid or expired token.' });
      return null;
    }
    throw err;
  }
}

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Add it to the backend .env file.');
  }
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body || Object.keys(body).length === 0) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    let { name, email, password } = body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }
    name = String(name).trim();
    email = String(email).toLowerCase().trim();
    password = String(password);
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = signToken(user._id);
    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (res.headersSent) return;
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors || {}).map((e) => e.message).join(' ') || err.message;
      return res.status(400).json({ message: msg });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    console.error('Register error:', err.message, err.stack);
    res.status(500).json({ message: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    email = String(email).toLowerCase().trim();
    password = String(password);
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    let valid = false;
    try {
      valid = await user.comparePassword(password);
    } catch (e) {
      console.error('Login comparePassword error:', e.message);
      return res.status(500).json({ message: 'Login failed.' });
    }
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const token = signToken(user._id);
    res.json({
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (!res.headersSent) {
      console.error('Login error:', err.message);
      res.status(500).json({ message: err.message || 'Login failed.' });
    }
  }
});

// GET /api/auth/me (current user, requires token)
router.get('/me', async (req, res) => {
  try {
    const user = await requireAuth(req, res);
    if (!user) return;
    const u = user.toObject();
    res.json({ user: { id: u._id, name: u.name, email: u.email, role: u.role } });
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
