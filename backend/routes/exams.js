const express = require('express');
const { auth } = require('../middleware/auth');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');

const router = express.Router();

// All student exam routes require authentication
router.use(auth);

// GET /api/exams/attempts — get current user's exam attempts
router.get('/attempts', async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .populate('examId', 'title category difficulty');
    res.json({ attempts });
  } catch (err) {
    console.error('Get attempts error:', err);
    res.status(500).json({ message: 'Failed to fetch attempts.' });
  }
});

// GET /api/exams/category/:category — get active exams by category
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const exams = await Exam.find({ category, isActive: true })
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json({ exams });
  } catch (err) {
    console.error('Get exams by category error:', err);
    res.status(500).json({ message: 'Failed to fetch exams.' });
  }
});

// GET /api/exams/categories — list distinct exam categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Exam.distinct('category');
    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

// GET /api/exams/:id — get a single exam
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).select('-__v');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found.' });
    }
    if (!exam.isActive) {
      return res.status(404).json({ message: 'This exam is not currently available.' });
    }
    res.json({ exam });
  } catch (err) {
    console.error('Get exam error:', err);
    res.status(500).json({ message: 'Failed to fetch exam.' });
  }
});

// GET /api/exams/:examId/questions — get questions for an exam (hide correct answers)
router.get('/:examId/questions', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam || !exam.isActive) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    const questions = await Question.find({ examId: req.params.examId })
      .sort({ order: 1 })
      .select('-__v');

    // Strip isCorrect from options so students can't cheat
    const sanitized = questions.map((q) => {
      const obj = q.toObject();
      obj.options = obj.options.map(({ text }) => ({ text }));
      delete obj.explanation;
      return obj;
    });

    res.json({ questions: sanitized });
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ message: 'Failed to fetch questions.' });
  }
});

// POST /api/exams/:examId/submit — submit an exam attempt
router.post('/:examId/submit', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam || !exam.isActive) {
      return res.status(404).json({ message: 'Exam not found.' });
    }

    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    // Fetch questions with correct answers
    const questions = await Question.find({ examId: req.params.examId }).sort({ order: 1 });
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return res.status(400).json({ message: 'This exam has no questions.' });
    }

    // Grade the exam
    let correctAnswers = 0;
    for (const question of questions) {
      const selectedIndex = answers[question._id.toString()];
      if (selectedIndex !== undefined && selectedIndex !== null) {
        const selectedOption = question.options[selectedIndex];
        if (selectedOption && selectedOption.isCorrect) {
          correctAnswers++;
        }
      }
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= exam.passingScore;

    const attempt = await ExamAttempt.create({
      examId: exam._id,
      userId: req.user._id,
      answers,
      score,
      totalQuestions,
      correctAnswers,
      passed,
    });

    res.status(201).json({ attempt });
  } catch (err) {
    console.error('Submit attempt error:', err);
    res.status(500).json({ message: 'Failed to submit exam.' });
  }
});

module.exports = router;
