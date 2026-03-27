/**
 * One-time migration: normalise all exam category strings to lowercase + trimmed.
 * Exams imported via the external-API fetch were saved with the raw category text
 * (e.g. "Science", "Science & Nature") while the student-facing category page
 * queries with lowercase slugs (e.g. "science").  This script aligns existing
 * records so they are found by the category-page query.
 *
 * Run once:  node scripts/fixExamCategories.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('../models/Exam');

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'exam_prep_db' });
  console.log('Connected to MongoDB');

  // $type: 2 is the BSON string type — matches every exam whose category is stored
  // as a string (which is all of them in this schema, but targets only those whose
  // value differs from its normalised form).
  const exams = await Exam.find({ category: { $type: 'string' } });
  console.log(`Found ${exams.length} exam(s) to check`);

  let fixed = 0;
  for (const exam of exams) {
    const normalized = (exam.category || '').trim().toLowerCase();
    if (exam.category !== normalized) {
      const oldCategory = exam.category;
      exam.category = normalized;
      await exam.save();
      console.log(`Fixed exam: "${exam.title}"  "${oldCategory}" → "${normalized}"`);
      fixed++;
    }
  }

  console.log(`\nDone. Fixed ${fixed} exam(s).`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
