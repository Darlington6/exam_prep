require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const adminRoutes = require('./routes/admin');

const app = express();

// CORS: allow any origin so frontend at localhost:5174 can call this API directly
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Only listen & connect to real DB when running directly (not during tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    mongoose.connect(process.env.MONGO_URI)
      .then(() => console.log('MongoDB connected'))
      .catch(err => console.error('DB connection error:', err.message));
  });
}

app.get('/', (req, res) => res.send('API ok'));
app.get('/api/auth/ping', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/admin', adminRoutes);

// catch-all error handler (must have 4 args so Express treats it as error middleware)
app.use((err, req, res, _next) => {
  console.error(err);
  if (!res.headersSent) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = app;