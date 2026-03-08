/**
 * ExamAttempt Model
 *
 * Records a student's submission for a specific exam. Stores the
 * selected answers (as a Map of questionId → option index), the
 * computed score, number of correct answers, and pass/fail status.
 */
const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: {
      type: Map,
      of: Number,
      default: {},
    },
    score: { type: Number, required: true, min: 0, max: 100 },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

examAttemptSchema.index({ userId: 1, examId: 1 });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);
