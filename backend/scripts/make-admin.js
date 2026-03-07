/**
 * Promote a user to admin by email.
 *
 * Usage:
 *   node scripts/make-admin.js <email>
 *
 * Example:
 *   node scripts/make-admin.js desmond@example.com
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node scripts/make-admin.js <email>');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`${user.name} (${user.email}) is already an admin.`);
  } else {
    user.role = 'admin';
    await user.save();
    console.log(`✅ ${user.name} (${user.email}) has been promoted to admin.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
