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
      category: String(category).trim().toLowerCase(),
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
    if (category !== undefined) exam.category = String(category).trim().toLowerCase();
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

function decodeHtmlEntities(str) {
  return String(str)
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function normalizeDifficulty(d) {
  if (!d) return 'medium';
  const lower = String(d).toLowerCase();
  return ['easy', 'medium', 'hard'].includes(lower) ? lower : 'medium';
}

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
      const httpReq = httpLib.get(apiUrl.trim(), { timeout: 10000 }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          try { resolve(JSON.parse(body)); } catch {
            reject(new Error('External API did not return valid JSON.'));
          }
        });
      });
      httpReq.on('error', reject);
      httpReq.on('timeout', () => { httpReq.destroy(); reject(new Error('External API request timed out.')); });
    });

    const numLimit = Math.max(1, Number(limit) || 10);
    const savedExams = [];
    const savedQuestions = [];

    // ── Open Trivia DB ───────────────────────────────────────────────────────
    // Shape: { response_code: 0, results: [{ question, correct_answer, incorrect_answers, difficulty, category }] }
    if (raw.response_code !== undefined && Array.isArray(raw.results)) {
      if (raw.response_code !== 0) {
        return res.status(400).json({ message: `Open Trivia DB returned error code ${raw.response_code}. Try a different category or fewer questions.` });
      }
      const items = raw.results.slice(0, numLimit);
      if (items.length === 0) {
        return res.json({ exams: [], questions: [] });
      }
      const exam = await Exam.create({
        title: category || items[0].category || 'Trivia Quiz',
        description: 'Imported from Open Trivia DB',
        category: (category || items[0].category || 'general').trim().toLowerCase(),
        difficulty: normalizeDifficulty(items[0].difficulty),
        duration: 30,
        passingScore: 60,
        createdBy: req.user._id,
      });
      savedExams.push(exam);

      const questionDocs = items.map((item, i) => ({
        examId: exam._id,
        questionText: decodeHtmlEntities(item.question),
        options: [
          { text: decodeHtmlEntities(item.correct_answer), isCorrect: true },
          ...item.incorrect_answers.map(a => ({ text: decodeHtmlEntities(a), isCorrect: false })),
        ],
        explanation: '',
        points: 1,
        order: i,
        createdBy: req.user._id,
      }));
      const questions = await Question.insertMany(questionDocs);
      savedQuestions.push(...questions);

    // ── QuizAPI ──────────────────────────────────────────────────────────────
    // Shape: { status: 200, data: [{ question, answers: {answer_a...}, correct_answers: {answer_a_correct...} }] }
    } else if (Array.isArray(raw.data) && raw.data.length > 0 && raw.data[0] !== null && typeof raw.data[0].answers === 'object') {
      const items = raw.data.slice(0, numLimit);
      const exam = await Exam.create({
        title: category || items[0].category || 'Quiz',
        description: 'Imported from QuizAPI',
        category: (category || items[0].category || 'general').trim().toLowerCase(),
        difficulty: normalizeDifficulty(items[0].difficulty),
        duration: 30,
        passingScore: 60,
        createdBy: req.user._id,
      });
      savedExams.push(exam);

      const questionDocs = items.map((item, i) => {
        const options = Object.entries(item.answers)
          .filter(([, v]) => v !== null && v !== '')
          .map(([key, text]) => ({
            text: String(text),
            isCorrect: item.correct_answers[`${key}_correct`] === 'true',
          }));
        return {
          examId: exam._id,
          questionText: item.question,
          options,
          explanation: item.explanation || '',
          points: 1,
          order: i,
          createdBy: req.user._id,
        };
      });
      const questions = await Question.insertMany(questionDocs);
      savedQuestions.push(...questions);

    // ── Generic exam-object list ─────────────────────────────────────────────
    // Shape: [{ title, difficulty, questions?: [...] }] or { exams: [...] }
    } else {
      const examItems = (Array.isArray(raw) ? raw : raw.exams || []).slice(0, numLimit);
      if (examItems.length === 0 || !examItems[0].title) {
        return res.status(400).json({
          message: 'Unrecognised API format. Supported formats: Open Trivia DB, QuizAPI, or a JSON array/object with exam objects (each requiring a "title" field).',
        });
      }
      for (const item of examItems) {
        try {
          const exam = await Exam.create({
            title: String(item.title).trim(),
            description: item.description ? String(item.description).trim() : '',
            category: (category || item.category || 'general').trim().toLowerCase(),
            difficulty: normalizeDifficulty(item.difficulty),
            duration: Number(item.duration) || 30,
            passingScore: Number(item.passingScore) || 60,
            createdBy: req.user._id,
          });
          savedExams.push(exam);

          if (Array.isArray(item.questions)) {
            const questionDocs = item.questions.map((q, i) => ({
              examId: exam._id,
              questionText: String(q.questionText || q.question || '').trim(),
              options: Array.isArray(q.options) ? q.options : [],
              explanation: q.explanation || '',
              points: Number(q.points) || 1,
              order: q.order !== undefined ? q.order : i,
              createdBy: req.user._id,
            }));
            const questions = await Question.insertMany(questionDocs);
            savedQuestions.push(...questions);
          }
        } catch { /* skip malformed exam items */ }
      }
    }

    res.json({ exams: savedExams, questions: savedQuestions });
  } catch (err) {
    console.error('External fetch error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to fetch from external API.' });
  }
});

module.exports = router;
