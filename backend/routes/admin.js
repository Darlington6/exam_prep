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

    // Normalize common external API shapes into { exams, questions }
    const normalize = (data) => {
      let exams = [];
      let questions = [];

      const classifyItem = (item) => {
        if (!item || typeof item !== 'object') return;
        if ('questionText' in item || 'options' in item || 'answers' in item) {
          questions.push(item);
        } else if ('title' in item || 'description' in item || 'category' in item) {
          exams.push(item);
        } else if (Array.isArray(item.options) && item.options.length) {
          questions.push(item);
        } else {
          exams.push(item);
        }
      };

      const pushList = (list) => {
        if (!Array.isArray(list)) return;
        for (const it of list) classifyItem(it);
      };

      // Common shapes: array root, { exams: [], questions: [] }, { data: [] }, { items: [] }
      if (Array.isArray(data)) {
        pushList(data);
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.exams) || Array.isArray(data.questions)) {
          if (Array.isArray(data.exams)) pushList(data.exams);
          if (Array.isArray(data.questions)) pushList(data.questions);
        } else if (Array.isArray(data.data) || Array.isArray(data.items)) {
          pushList(data.data || data.items);
        } else {
          // Try any top-level array properties
          for (const key of Object.keys(data)) {
            if (Array.isArray(data[key])) pushList(data[key]);
          }
        }
      }

      // Apply limit to exams (limit parameter is intended to cap number of exams)
      if (typeof limit === 'number' && limit > 0) exams = exams.slice(0, limit);

      // Ensure arrays are returned (never undefined)
      return { exams, questions };
    };

    const { exams, questions } = normalize(externalData || {});

    // If exams contain nested questions, extract them and attach to the parent exam
    for (const ex of exams) {
      if (ex && Array.isArray(ex.questions) && ex.questions.length) {
        ex._externalQuestions = ex.questions;
      }
    }

    const createdExams = [];
    const createdQuestions = [];
    const warnings = [];

    // Helper to sanitize options into { text, isCorrect }
    const sanitizeOptions = (opts) => {
      if (!Array.isArray(opts)) return [];
      // If options are strings, convert to objects
      if (opts.length && typeof opts[0] === 'string') {
        return opts.map((t) => ({ text: String(t), isCorrect: false }));
      }
      return opts.map((o) => ({ text: String(o.text || o.label || ''), isCorrect: !!o.isCorrect }));
    };

    // Persist exams and their nested questions (if any)
    for (const extExam of exams) {
      try {
        const title = extExam.title || extExam.name || 'Untitled Exam';
        const description = extExam.description || extExam.summary || '';
        const categoryVal = (category || extExam.category || 'general').toLowerCase();
        const difficulty = ['easy', 'medium', 'hard'].includes((extExam.difficulty || '').toLowerCase())
          ? extExam.difficulty.toLowerCase()
          : 'medium';
        const duration = Number(extExam.duration) || 30;
        const passingScore = Number(extExam.passingScore) || 50;

        const examDoc = await Exam.create({
          title,
          description,
          category: categoryVal,
          difficulty,
          duration,
          passingScore,
          createdBy: req.user._id,
        });

        createdExams.push(examDoc);

        // Persist nested questions if present
        const nested = extExam._externalQuestions || [];
        for (const q of nested) {
          try {
            const options = sanitizeOptions(q.options || q.answers || q.choices || []);
            const filtered = options.filter((o) => o.text && o.text.trim());
            const hasCorrect = filtered.some((o) => o.isCorrect);
            if (filtered.length < 2 || !hasCorrect) {
              warnings.push(`Skipped question for exam ${title} due to invalid options`);
              continue;
            }

            const questionDoc = await Question.create({
              examId: examDoc._id,
              questionText: q.questionText || q.text || q.prompt || 'Untitled question',
              options: filtered,
              explanation: q.explanation || q.explain || '',
              points: Number(q.points) || 1,
              order: Number(q.order) || 0,
              createdBy: req.user._id,
            });
            createdQuestions.push(questionDoc);
          } catch (qerr) {
            console.error('Failed to create question:', qerr);
            warnings.push(`Failed to create a question for exam ${extExam.title || extExam.name}`);
          }
        }
      } catch (e) {
        console.error('Failed to create exam from external data:', e);
        warnings.push(`Failed to create exam ${extExam.title || extExam.name}`);
      }
    }

    // Try to attach any top-level questions to created exams by matching examTitle or exam field
    for (const q of questions) {
      try {
        let targetExam = null;
        if (q.examTitle) targetExam = createdExams.find((e) => e.title === q.examTitle || e.title === q.examTitle);
        if (!targetExam && q.exam) targetExam = createdExams.find((e) => e._id.toString() === String(q.exam) || e.title === q.exam);

        if (!targetExam) {
          warnings.push('Found an unassigned question; no matching exam found');
          continue;
        }

        const options = sanitizeOptions(q.options || q.answers || q.choices || []);
        const filtered = options.filter((o) => o.text && o.text.trim());
        const hasCorrect = filtered.some((o) => o.isCorrect);
        if (filtered.length < 2 || !hasCorrect) {
          warnings.push(`Skipped question for exam ${targetExam.title} due to invalid options`);
          continue;
        }

        const questionDoc = await Question.create({
          examId: targetExam._id,
          questionText: q.questionText || q.text || q.prompt || 'Untitled question',
          options: filtered,
          explanation: q.explanation || q.explain || '',
          points: Number(q.points) || 1,
          order: Number(q.order) || 0,
          createdBy: req.user._id,
        });
        createdQuestions.push(questionDoc);
      } catch (err) {
        console.error('Failed to attach top-level question:', err);
      }
    }

    res.json({
      message: 'External data fetched and imported successfully.',
      exams: createdExams,
      questions: createdQuestions,
      warnings,
    });
  } catch (err) {
    console.error('External fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch from external API.' });
  }
});

module.exports = router;
