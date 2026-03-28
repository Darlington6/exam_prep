const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { auth } = require('../middleware/auth');

// GET /api/categories
// Returns all distinct categories from all exams (so newly created ones appear
// immediately). The `count` field reflects only *active* exams so the UI can
// distinguish "has live exams" from "category exists but exams are inactive".
// Groups case-insensitively so "Mathematics" and "mathematics" are one entry.
router.get('/', auth, async (req, res) => {
  try {
    // All categories (active + inactive)
    const allAgg = await Exam.aggregate([
      {
        $group: {
          _id: { $toLower: { $trim: { input: '$category' } } },
          displayName: { $first: { $trim: { input: '$category' } } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Active-only counts
    const activeAgg = await Exam.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { $toLower: { $trim: { input: '$category' } } },
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    for (const item of activeAgg) countMap[item._id] = item.count;

    const categories = allAgg
      .filter((item) => item._id) // drop empty/null
      .map((item) => ({
        id: item._id,
        name: item.displayName.charAt(0).toUpperCase() + item.displayName.slice(1),
        count: countMap[item._id] || 0,
      }));

    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({ message: 'Failed to load categories.' });
  }
});

module.exports = router;
