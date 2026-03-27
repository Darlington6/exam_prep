require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/categories');

const app = express();

// CORS: allow any origin so frontend at localhost:5174 can call this API directly
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get('/', (req, res) => res.send('API ok'));
app.get('/api/auth/ping', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/categories', categoryRoutes);

// catch-all error handler (must have 4 args so Express treats it as error middleware)
app.use((err, req, res, _next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// Only start the server if this file is run directly, not when imported by tests
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI, {
    dbName: 'exam_prep_db',
    family: 4, // force IPv4 — avoids ENETUNREACH on broken IPv6/NAT64 paths
  })
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('DB connection error:', err.message);
      process.exit(1);
    });
}

module.exports = app;