const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const ExamAttempt = require('../models/ExamAttempt');
const { auth } = require('../middleware/auth');

// NOTE: specific paths must come before /:id to avoid being swallowed as IDs

// GET /api/exams/category/:category
router.get('/category/:category', auth, async (req, res) => {
  try {
    // Escape regex special chars to prevent ReDoS, then match case-insensitively
    // so "Mathematics" and "mathematics" both resolve correctly.
    const escaped = req.params.category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exams = await Exam.find({
      category: { $regex: new RegExp(`^${escaped}$`, 'i') },
      isActive: true,
    }).sort({ createdAt: -1 });
    res.json({ exams });
  } catch (err) {
    console.error('Get exams by category error:', err.message);
    res.status(500).json({ message: 'Failed to load exams.' });
  }
});

// GET /api/exams/attempts  (must come before /:id)
router.get('/attempts', auth, async (req, res) => {
  try {
    const attempts = await ExamAttempt.find({ userId: req.user._id })
      .sort({ completedAt: -1 });
    res.json({ attempts });
  } catch (err) {
    console.error('Get attempts error:', err.message);
    res.status(500).json({ message: 'Failed to load attempts.' });
  }
});

// GET /api/exams/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, isActive: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ exam });
  } catch (err) {
    console.error('Get exam error:', err.message);
    res.status(500).json({ message: 'Failed to load exam.' });
  }
});

// GET /api/exams/:id/review
// Returns questions WITH isCorrect included, but only after the user has submitted an attempt.
// This is the endpoint used by the results / answer-review screen.
router.get('/:id/review', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    // Security gate: only expose correct answers if the user actually attempted this exam
    const attempt = await ExamAttempt.findOne({
      examId: req.params.id,
      userId: req.user._id,
    });
    if (!attempt) {
      return res.status(403).json({ message: 'No completed attempt found for this exam.' });
    }

    const questions = await Question.find({ examId: req.params.id })
      .sort({ order: 1, createdAt: 1 });

    res.json({ questions });
  } catch (err) {
    console.error('Get review questions error:', err.message);
    res.status(500).json({ message: 'Failed to load review questions.' });
  }
});

// GET /api/exams/:id/questions
// Returns questions with answer options stripped of isCorrect (security)
router.get('/:id/questions', auth, async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, isActive: true });
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    const questions = await Question.find({ examId: req.params.id })
      .sort({ order: 1, createdAt: 1 });

    // Strip isCorrect and explanation from each question for security
    const sanitized = questions.map(q => {
      const obj = q.toObject();
      obj.options = obj.options.map(opt => {
        const { isCorrect, ...option } = opt;
        return option;
      });
      delete obj.explanation;
      return obj;
    });

    res.json({ questions: sanitized });
  } catch (err) {
    console.error('Get questions error:', err.message);
    res.status(500).json({ message: 'Failed to load questions.' });
  }
});

// POST /api/exams/:id/submit
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    const questions = await Question.find({ examId: req.params.id }).sort({ order: 1 });
    if (questions.length === 0) {
      return res.status(400).json({ message: 'This exam has no questions.' });
    }

    const { answers } = req.body;
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ message: 'No answers provided.' });
    }

    let correctAnswers = 0;
    questions.forEach((q) => {
      const userAnswer = answers[q._id.toString()];
      const correctIndex = q.options.findIndex((o) => o.isCorrect);
      if (userAnswer !== undefined && Number(userAnswer) === correctIndex) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);
    const passed = score >= exam.passingScore;

    const attempt = await ExamAttempt.create({
      examId: exam._id,
      userId: req.user._id,
      answers,
      score,
      totalQuestions: questions.length,
      correctAnswers,
      passed,
      completedAt: new Date(),
    });

    res.status(201).json({ attempt });
  } catch (err) {
    console.error('Submit exam error:', err.message);
    res.status(500).json({ message: 'Failed to submit exam.' });
  }
});

module.exports = router;
