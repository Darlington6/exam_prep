const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ExamAttempt = require('../models/ExamAttempt');
const Exam = require('../models/Exam');
const { auth } = require('../middleware/auth');

// All routes require auth
router.use(auth);

// GET /api/user/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ message: 'Failed to load profile.' });
  }
});

// PUT /api/user/profile
router.put('/profile', async (req, res) => {
  try {
    const { username, avatar } = req.body;

    // Validate username
    if (username !== undefined) {
      const trimmed = String(username).trim();
      if (trimmed.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters.' });
      }
      if (!/^[a-zA-Z0-9_ ]+$/.test(trimmed)) {
        return res.status(400).json({ message: 'Username may only contain letters, numbers, underscores, and spaces.' });
      }
      req.user.username = trimmed;
    }

    // avatar is a base64 data URL or empty string to clear
    if (avatar !== undefined) {
      if (avatar && !avatar.startsWith('data:image/')) {
        return res.status(400).json({ message: 'Invalid image format.' });
      }
      // Limit size to ~1 MB (base64 ~1.37× raw, so 750 KB raw ≈ 1 MB base64)
      if (avatar && avatar.length > 1_400_000) {
        return res.status(400).json({ message: 'Image too large. Please use an image under 1 MB.' });
      }
      req.user.avatar = avatar;
    }

    await req.user.save();
    const updated = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires');
    res.json({ user: updated });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// GET /api/user/exam-history
router.get('/exam-history', async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({ userId: req.user._id })
      .sort({ _id: -1 })
      .lean();

    // Populate exam titles by fetching unique exam IDs
    const examIds = [...new Set(attempts.map((a) => a.examId.toString()))];
    const exams = await Exam.find({ _id: { $in: examIds } })
      .select('title category')
      .lean();
    const examMap = {};
    exams.forEach((e) => { examMap[e._id.toString()] = e; });

    const history = attempts.map((a) => ({
      _id: a._id,
      examId: a.examId,
      examTitle: examMap[a.examId.toString()]?.title || 'Unknown Exam',
      examCategory: examMap[a.examId.toString()]?.category || '',
      score: a.score,
      totalQuestions: a.totalQuestions,
      correctAnswers: a.correctAnswers,
      passed: a.passed,
      completedAt: a.completedAt,
    }));

    res.json({ history });
  } catch (err) {
    console.error('Exam history error:', err.message);
    res.status(500).json({ message: 'Failed to load exam history.' });
  }
});

// PUT /api/user/settings
router.put('/settings', async (req, res) => {
  try {
    const { notifications } = req.body;

    if (notifications !== undefined) {
      req.user.notifications = Boolean(notifications);
    }

    await req.user.save();
    res.json({ settings: { notifications: req.user.notifications } });
  } catch (err) {
    console.error('Update settings error:', err.message);
    res.status(500).json({ message: 'Failed to update settings.' });
  }
});

module.exports = router;
