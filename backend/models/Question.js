const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    isCorrect: { type: Boolean, required: true, default: false },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    questionText: { type: String, required: true, trim: true },
    options: {
      type: [optionSchema],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'A question must have at least 2 options.',
      },
    },
    explanation: { type: String, trim: true, default: '' },
    points: { type: Number, default: 1, min: 1 },
    order: { type: Number, default: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

questionSchema.index({ examId: 1, order: 1 });

module.exports = mongoose.model('Question', questionSchema);
