const express = require('express');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(auth, admin);

// ─── EXAM CRUD ───────────────────────────────────────────────

// GET /api/admin/exams — list all exams (including inactive)
router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');
    res.json({ exams });
  } catch (err) {
    console.error('Admin get exams error:', err);
    res.status(500).json({ message: 'Failed to fetch exams.' });
  }
});

// GET /api/admin/exams/:id — get a single exam
router.get('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name email');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }
    res.json({ exam });
  } catch (err) {
    console.error('Admin get exam error:', err);
    res.status(500).json({ message: 'Failed to fetch exam.' });
  }
});

// POST /api/admin/exams — create a new exam
router.post('/exams', async (req, res) => {
  try {
    const { title, description, category, difficulty, duration, passingScore } = req.body;

    if (!title || !description || !category || !duration || passingScore === undefined) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const exam = await Exam.create({
      title,
      description,
      category: category.toLowerCase(),
      difficulty: difficulty || 'medium',
      duration,
      passingScore,
      createdBy: req.user._id,
    });

    res.status(201).json({ exam });
  } catch (err) {
    console.error('Admin create exam error:', err);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(' ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Failed to create exam.' });
  }
});

// PUT /api/admin/exams/:id — update an exam
router.put('/exams/:id', async (req, res) => {
  try {
    const updates = {};
    const allowed = ['title', 'description', 'category', 'difficulty', 'duration', 'passingScore'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = key === 'category' ? req.body[key].toLowerCase() : req.body[key];
      }
    }

    const exam = await Exam.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    res.json({ exam });
  } catch (err) {
    console.error('Admin update exam error:', err);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(' ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Failed to update exam.' });
  }
});

// DELETE /api/admin/exams/:id — delete an exam and its questions
router.delete('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    // Also remove all associated questions
    await Question.deleteMany({ examId: req.params.id });

    res.json({ message: 'Exam and associated questions deleted.' });
  } catch (err) {
    console.error('Admin delete exam error:', err);
    res.status(500).json({ message: 'Failed to delete exam.' });
  }
});

// PATCH /api/admin/exams/:id/toggle-active — toggle exam active status
router.patch('/exams/:id/toggle-active', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    exam.isActive = !exam.isActive;
    await exam.save();

    res.json({ exam });
  } catch (err) {
    console.error('Admin toggle active error:', err);
    res.status(500).json({ message: 'Failed to toggle exam status.' });
  }
});

// ─── QUESTION CRUD ───────────────────────────────────────────

// GET /api/admin/exams/:examId/questions — list questions for an exam
router.get('/exams/:examId/questions', async (req, res) => {
  try {
    const questions = await Question.find({ examId: req.params.examId })
      .sort({ order: 1 })
      .populate('createdBy', 'name email');
    res.json({ questions });
  } catch (err) {
    console.error('Admin get questions error:', err);
    res.status(500).json({ message: 'Failed to fetch questions.' });
  }
});

// GET /api/admin/questions/:id — get a single question
router.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('createdBy', 'name email');
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }
    res.json({ question });
  } catch (err) {
    console.error('Admin get question error:', err);
    res.status(500).json({ message: 'Failed to fetch question.' });
  }
});

// POST /api/admin/questions — create a question
router.post('/questions', async (req, res) => {
  try {
    const { examId, questionText, options, explanation, points, order } = req.body;

    if (!examId || !questionText || !options) {
      return res.status(400).json({ message: 'examId, questionText, and options are required.' });
    }

    // Validate exam exists
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    // Validate at least one correct option
    const hasCorrect = options.some((opt) => opt.isCorrect);
    if (!hasCorrect) {
      return res.status(400).json({ message: 'At least one option must be marked as correct.' });
    }

    const question = await Question.create({
      examId,
      questionText,
      options,
      explanation: explanation || '',
      points: points || 1,
      order: order !== undefined ? order : 0,
      createdBy: req.user._id,
    });

    res.status(201).json({ question });
  } catch (err) {
    console.error('Admin create question error:', err);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(' ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Failed to create question.' });
  }
});

// PUT /api/admin/questions/:id — update a question
router.put('/questions/:id', async (req, res) => {
  try {
    const updates = {};
    const allowed = ['questionText', 'options', 'explanation', 'points', 'order'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // If options are being updated, validate at least one correct
    if (updates.options) {
      const hasCorrect = updates.options.some((opt) => opt.isCorrect);
      if (!hasCorrect) {
        return res.status(400).json({ message: 'At least one option must be marked as correct.' });
      }
    }

    const question = await Question.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }

    res.json({ question });
  } catch (err) {
    console.error('Admin update question error:', err);
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map((e) => e.message).join(' ');
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: 'Failed to update question.' });
  }
});

// DELETE /api/admin/questions/:id — delete a question
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found.' });
    }
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    console.error('Admin delete question error:', err);
    res.status(500).json({ message: 'Failed to delete question.' });
  }
});

// ─── EXTERNAL FETCH ──────────────────────────────────────────

// POST /api/admin/external/fetch — fetch exams from an external API
router.post('/external/fetch', async (req, res) => {
  try {
    const { apiUrl, category, limit } = req.body;

    if (!apiUrl) {
      return res.status(400).json({ message: 'apiUrl is required.' });
    }

    // Dynamic import for fetch (Node 18+ has global fetch)
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(502).json({ message: `External API returned ${response.status}.` });
    }

    const externalData = await response.json();

    // This is a flexible handler — the external API format may vary.
    // For now, return the raw data and let the frontend handle mapping.
    res.json({
      message: 'External data fetched successfully.',
      exams: externalData.exams || [],
      questions: externalData.questions || [],
    });
  } catch (err) {
    console.error('External fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch from external API.' });
  }
});

module.exports = router;
