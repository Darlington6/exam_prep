/**
 * Student Exam Route Tests (15 test cases)
 *
 * Covers: browse by category, get single exam, get questions (answers stripped),
 * submit attempt (auto-grading: all correct, all wrong, partial), and
 * retrieve past attempts via the /api/exams endpoints.
 * Uses MongoMemoryServer for isolated, in-memory database testing.
 */
require('./setup');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// Helper to create a user and get a token
async function createUserAndToken(overrides = {}) {
  const data = {
    name: 'Test Student',
    email: `student-${Date.now()}@example.com`,
    password: 'password123',
    ...overrides,
  };

  const res = await request(app)
    .post('/api/auth/register')
    .send(data);

  return { token: res.body.token, user: res.body.user };
}

// Helper to create an admin and get a token
async function createAdminAndToken() {
  const hashed = await bcrypt.hash('admin123', 12);
  const adminUser = await User.create({
    name: 'Admin User',
    email: `admin-${Date.now()}@example.com`,
    password: hashed,
    role: 'admin',
  });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: adminUser.email, password: 'admin123' });

  return { token: res.body.token, user: res.body.user, adminUser };
}

// Helper to create an exam with questions
async function seedExamWithQuestions(adminId) {
  const exam = await Exam.create({
    title: 'Test Exam',
    description: 'A test exam',
    category: 'science',
    difficulty: 'medium',
    duration: 30,
    passingScore: 50,
    isActive: true,
    createdBy: adminId,
  });

  const q1 = await Question.create({
    examId: exam._id,
    questionText: 'What is 2+2?',
    options: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
      { text: '5', isCorrect: false },
    ],
    points: 1,
    order: 1,
    createdBy: adminId,
  });

  const q2 = await Question.create({
    examId: exam._id,
    questionText: 'What is the capital of France?',
    options: [
      { text: 'London', isCorrect: false },
      { text: 'Paris', isCorrect: true },
      { text: 'Berlin', isCorrect: false },
    ],
    points: 1,
    order: 2,
    createdBy: adminId,
  });

  return { exam, questions: [q1, q2] };
}

describe('Student Exam Routes', () => {
  let studentToken;
  let adminUser;
  let testExam;
  let testQuestions;

  beforeEach(async () => {
    const hashed = await bcrypt.hash('admin123', 12);
    adminUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: hashed,
      role: 'admin',
    });

    const { exam, questions } = await seedExamWithQuestions(adminUser._id);
    testExam = exam;
    testQuestions = questions;

    const studentRes = await createUserAndToken();
    studentToken = studentRes.token;
  });

  // ─── GET EXAMS BY CATEGORY ──────────────────────────────

  describe('GET /api/exams/category/:category', () => {
    it('should return active exams for a category', async () => {
      const res = await request(app)
        .get('/api/exams/category/science')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.exams).toHaveLength(1);
      expect(res.body.exams[0].title).toBe('Test Exam');
    });

    it('should not return inactive exams', async () => {
      testExam.isActive = false;
      await testExam.save();

      const res = await request(app)
        .get('/api/exams/category/science')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.exams).toHaveLength(0);
    });

    it('should return empty array for category with no exams', async () => {
      const res = await request(app)
        .get('/api/exams/category/humanities')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.exams).toHaveLength(0);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/exams/category/science');

      expect(res.status).toBe(401);
    });
  });

  // ─── GET SINGLE EXAM ────────────────────────────────────

  describe('GET /api/exams/:id', () => {
    it('should return a single active exam', async () => {
      const res = await request(app)
        .get(`/api/exams/${testExam._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.exam.title).toBe('Test Exam');
    });

    it('should return 404 for inactive exam', async () => {
      testExam.isActive = false;
      await testExam.save();

      const res = await request(app)
        .get(`/api/exams/${testExam._id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent id', async () => {
      const res = await request(app)
        .get('/api/exams/000000000000000000000000')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── GET QUESTIONS ──────────────────────────────────────

  describe('GET /api/exams/:examId/questions', () => {
    it('should return questions without correct answers', async () => {
      const res = await request(app)
        .get(`/api/exams/${testExam._id}/questions`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(2);

      // Ensure isCorrect is stripped
      for (const q of res.body.questions) {
        for (const opt of q.options) {
          expect(opt.isCorrect).toBeUndefined();
        }
        // Ensure explanation is stripped
        expect(q.explanation).toBeUndefined();
      }
    });

    it('should return 404 for inactive exam', async () => {
      testExam.isActive = false;
      await testExam.save();

      const res = await request(app)
        .get(`/api/exams/${testExam._id}/questions`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ─── SUBMIT ATTEMPT ─────────────────────────────────────

  describe('POST /api/exams/:examId/submit', () => {
    it('should grade and return an attempt (all correct)', async () => {
      const answers = {
        [testQuestions[0]._id.toString()]: 1, // '4' is correct (index 1)
        [testQuestions[1]._id.toString()]: 1, // 'Paris' is correct (index 1)
      };

      const res = await request(app)
        .post(`/api/exams/${testExam._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers });

      expect(res.status).toBe(201);
      expect(res.body.attempt.score).toBe(100);
      expect(res.body.attempt.correctAnswers).toBe(2);
      expect(res.body.attempt.totalQuestions).toBe(2);
      expect(res.body.attempt.passed).toBe(true);
    });

    it('should grade correctly (all wrong)', async () => {
      const answers = {
        [testQuestions[0]._id.toString()]: 0, // '3' is wrong
        [testQuestions[1]._id.toString()]: 0, // 'London' is wrong
      };

      const res = await request(app)
        .post(`/api/exams/${testExam._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers });

      expect(res.status).toBe(201);
      expect(res.body.attempt.score).toBe(0);
      expect(res.body.attempt.correctAnswers).toBe(0);
      expect(res.body.attempt.passed).toBe(false);
    });

    it('should grade correctly (partial correct)', async () => {
      const answers = {
        [testQuestions[0]._id.toString()]: 1, // correct
        [testQuestions[1]._id.toString()]: 0, // wrong
      };

      const res = await request(app)
        .post(`/api/exams/${testExam._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers });

      expect(res.status).toBe(201);
      expect(res.body.attempt.score).toBe(50);
      expect(res.body.attempt.correctAnswers).toBe(1);
      expect(res.body.attempt.passed).toBe(true); // passingScore is 50
    });

    it('should reject submission without answers', async () => {
      const res = await request(app)
        .post(`/api/exams/${testExam._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── GET ATTEMPTS ───────────────────────────────────────

  describe('GET /api/exams/attempts', () => {
    it('should return empty array when no attempts', async () => {
      const res = await request(app)
        .get('/api/exams/attempts')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.attempts).toHaveLength(0);
    });

    it('should return attempts after submitting', async () => {
      const answers = {
        [testQuestions[0]._id.toString()]: 1,
        [testQuestions[1]._id.toString()]: 1,
      };

      await request(app)
        .post(`/api/exams/${testExam._id}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ answers });

      const res = await request(app)
        .get('/api/exams/attempts')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.attempts).toHaveLength(1);
      expect(res.body.attempts[0].score).toBe(100);
    });
  });
});
