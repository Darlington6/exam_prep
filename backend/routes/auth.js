const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../utils/emailService');

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
      user: { id: user._id, name: user.name, email: user.email, role: user.role, username: user.username || '', avatar: user.avatar || '', notifications: user.notifications !== undefined ? user.notifications : true, createdAt: user.createdAt },
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
      user: { id: user._id, name: user.name, email: user.email, role: user.role, username: user.username || '', avatar: user.avatar || '', notifications: user.notifications !== undefined ? user.notifications : true, createdAt: user.createdAt },
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
    res.json({
      user: {
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        username: u.username || '',
        avatar: u.avatar || '',
        notifications: u.notifications !== undefined ? u.notifications : true,
        createdAt: u.createdAt,
      }
    });
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }
    const normalised = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalised)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email: normalised });
    // Always respond the same way to avoid user enumeration
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate raw token and store its SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(normalised, resetUrl);

    res.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot-password error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Unable to send reset email. Please try again later.' });
    }
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Reset token is missing or invalid.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'New password is required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return res.status(400).json({ message: 'Password must contain uppercase, lowercase, a number, and a special character.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired. Please request a new one.' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (err) {
    console.error('Reset-password error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
  }
});

module.exports = router;
