const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const { auth } = require('../middleware/auth');

// ── Admin auth guard ──────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ message: 'Authentication required.' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
  next();
}

router.use(auth, requireAdmin);

// ── Exam management ───────────────────────────────────────────────────────────

// GET /api/admin/exams
router.get('/exams', async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });
    res.json({ exams });
  } catch (err) {
    console.error('Admin get exams error:', err.message);
    res.status(500).json({ message: 'Failed to load exams.' });
  }
});

// GET /api/admin/exams/:id  (must come before /:examId/questions)
router.get('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load exam.' });
  }
});

// POST /api/admin/exams
router.post('/exams', async (req, res) => {
  try {
    const { title, description, category, difficulty, duration, passingScore } = req.body;
    if (!title || !category || !difficulty || !duration || passingScore === undefined) {
      return res.status(400).json({
        message: 'title, category, difficulty, duration, and passingScore are required.',
      });
    }
    const exam = await Exam.create({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      category: String(category).trim(),
      difficulty,
      duration: Number(duration),
      passingScore: Number(passingScore),
      createdBy: req.user._id,
    });
    res.status(201).json({ exam });
  } catch (err) {
    console.error('Admin create exam error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create exam.' });
  }
});

// PUT /api/admin/exams/:id
router.put('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    const { title, description, category, difficulty, duration, passingScore } = req.body;
    if (title !== undefined) exam.title = String(title).trim();
    if (description !== undefined) exam.description = String(description).trim();
    if (category !== undefined) exam.category = String(category).trim();
    if (difficulty !== undefined) exam.difficulty = difficulty;
    if (duration !== undefined) exam.duration = Number(duration);
    if (passingScore !== undefined) exam.passingScore = Number(passingScore);
    await exam.save();
    res.json({ exam });
  } catch (err) {
    console.error('Admin update exam error:', err.message);
    res.status(500).json({ message: 'Failed to update exam.' });
  }
});

// DELETE /api/admin/exams/:id
router.delete('/exams/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    await Question.deleteMany({ examId: req.params.id });
    await exam.deleteOne();
    res.json({ message: 'Exam deleted.' });
  } catch (err) {
    console.error('Admin delete exam error:', err.message);
    res.status(500).json({ message: 'Failed to delete exam.' });
  }
});

// PATCH /api/admin/exams/:id/toggle-active
router.patch('/exams/:id/toggle-active', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    exam.isActive = !exam.isActive;
    await exam.save();
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update exam status.' });
  }
});

// GET /api/admin/exams/:examId/questions
router.get('/exams/:examId/questions', async (req, res) => {
  try {
    const questions = await Question.find({ examId: req.params.examId })
      .sort({ order: 1, createdAt: 1 });
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load questions.' });
  }
});

// ── Question management ───────────────────────────────────────────────────────

// GET /api/admin/questions/:id
router.get('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    res.json({ question });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load question.' });
  }
});

// POST /api/admin/questions
router.post('/questions', async (req, res) => {
  try {
    const { examId, questionText, options, explanation, points, order } = req.body;
    if (!examId || !questionText || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        message: 'examId, questionText, and at least 2 options are required.',
      });
    }
    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    if (!options.some((o) => o.isCorrect)) {
      return res.status(400).json({
        message: 'At least one option must be marked as correct.',
      });
    }
    const question = await Question.create({
      examId,
      questionText: String(questionText).trim(),
      options,
      explanation: explanation ? String(explanation).trim() : '',
      points: points ? Number(points) : 1,
      order: order !== undefined ? Number(order) : 0,
      createdBy: req.user._id,
    });
    res.status(201).json({ question });
  } catch (err) {
    console.error('Admin create question error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Failed to create question.' });
  }
});

// PUT /api/admin/questions/:id
router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });

    const { questionText, options, explanation, points, order } = req.body;
    if (questionText !== undefined) question.questionText = String(questionText).trim();
    if (options !== undefined) {
      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ message: 'At least 2 options are required.' });
      }
      if (!options.some((o) => o.isCorrect)) {
        return res.status(400).json({
          message: 'At least one option must be marked as correct.',
        });
      }
      question.options = options;
    }
    if (explanation !== undefined) question.explanation = String(explanation).trim();
    if (points !== undefined) question.points = Number(points);
    if (order !== undefined) question.order = Number(order);
    await question.save();
    res.json({ question });
  } catch (err) {
    console.error('Admin update question error:', err.message);
    res.status(500).json({ message: 'Failed to update question.' });
  }
});

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found.' });
    await question.deleteOne();
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete question.' });
  }
});

// ── External API fetch ────────────────────────────────────────────────────────

// POST /api/admin/external/fetch
router.post('/external/fetch', async (req, res) => {
  try {
    const { apiUrl, category, limit = 10 } = req.body;
    if (!apiUrl || typeof apiUrl !== 'string') {
      return res.status(400).json({ message: 'apiUrl is required.' });
    }

    // Basic SSRF protection — block private/loopback addresses
    let parsedUrl;
    try {
      parsedUrl = new URL(apiUrl.trim());
    } catch {
      return res.status(400).json({ message: 'Invalid API URL.' });
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ message: 'Only HTTP and HTTPS URLs are allowed.' });
    }
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      /^127\./.test(hostname) ||
      /^10\./.test(hostname) ||
      /^192\.168\./.test(hostname) ||
      /^172\.(1[6-9]|2[0-9]|3[01])\./.test(hostname) ||
      hostname === '0.0.0.0'
    ) {
      return res.status(400).json({ message: 'Requests to private addresses are not allowed.' });
    }

    const httpLib = parsedUrl.protocol === 'https:' ? require('https') : require('http');
    const raw = await new Promise((resolve, reject) => {
      const req = httpLib.get(apiUrl.trim(), { timeout: 10000 }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          try { resolve(JSON.parse(body)); } catch {
            reject(new Error('External API did not return valid JSON.'));
          }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('External API request timed out.')); });
    });

    const items = Array.isArray(raw)
      ? raw
      : raw.exams || raw.results || raw.data || [];

    const savedExams = [];
    const savedQuestions = [];

    for (const item of items.slice(0, Math.max(1, Number(limit) || 10))) {
      try {
        if (item.title && item.difficulty) {
          const exam = await Exam.create({
            title: String(item.title).trim(),
            description: item.description ? String(item.description).trim() : '',
            category: category || item.category || 'general',
            difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty)
              ? item.difficulty
              : 'medium',
            duration: Number(item.duration) || 30,
            passingScore: Number(item.passingScore) || 60,
            createdBy: req.user._id,
          });
          savedExams.push(exam);
        }
      } catch { /* skip malformed items */ }
    }

    res.json({ exams: savedExams, questions: savedQuestions });
  } catch (err) {
    console.error('External fetch error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to fetch from external API.' });
  }
});

module.exports = router;
