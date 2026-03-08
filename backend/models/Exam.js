/**
 * Exam Model
 *
 * Represents an exam with a title, description, category, difficulty
 * level, time duration (minutes), passing score (0-100), and active
 * status. Indexed by category and isActive for efficient queries.
 */
const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, lowercase: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    duration: { type: Number, required: true, min: 1 },
    passingScore: { type: Number, required: true, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

examSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Exam', examSchema);
