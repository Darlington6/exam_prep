const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { auth } = require('../middleware/auth');

// GET /api/categories
// Returns all distinct categories derived from active exams.
// Groups case-insensitively so "Mathematics" and "mathematics" are one entry.
router.get('/', auth, async (req, res) => {
  try {
    const agg = await Exam.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { $toLower: { $trim: { input: '$category' } } },
          displayName: { $first: { $trim: { input: '$category' } } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const categories = agg
      .filter((item) => item._id) // drop empty/null
      .map((item) => ({
        id: item._id,                                                          // lowercase slug used in URLs
        name: item.displayName.charAt(0).toUpperCase() + item.displayName.slice(1), // title-case display
        count: item.count,
      }));

    res.json({ categories });
  } catch (err) {
    console.error('Get categories error:', err.message);
    res.status(500).json({ message: 'Failed to load categories.' });
  }
});

module.exports = router;
