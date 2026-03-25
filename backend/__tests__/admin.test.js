/**
 * Admin Route Tests (13 test cases)
 *
 * Covers: authorization (401/403), exam CRUD, toggle-active,
 * question CRUD — all via the /api/admin endpoints.
 * Uses MongoMemoryServer for isolated, in-memory database testing.
 */
require('./setup');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// Helper to create a student and get a token
async function createStudentToken() {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Student',
      email: `student-${Date.now()}@example.com`,
      password: 'password123',
    });
  return res.body.token;
}

// Helper to create an admin and get a token
async function createAdminToken() {
  const hashed = await bcrypt.hash('admin123', 12);
  const admin = await User.create({
    name: 'Admin',
    email: `admin-${Date.now()}@example.com`,
    password: hashed,
    role: 'admin',
  });

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: admin.email, password: 'admin123' });

  return { token: res.body.token, adminId: admin._id };
}

describe('Admin Routes', () => {
  let adminToken;
  let adminId;
  let studentToken;

  beforeEach(async () => {
    const admin = await createAdminToken();
    adminToken = admin.token;
    adminId = admin.adminId;
    studentToken = await createStudentToken();
  });

  // ─── AUTHORIZATION ──────────────────────────────────────

  describe('Authorization', () => {
    it('should reject unauthenticated access', async () => {
      const res = await request(app).get('/api/admin/exams');
      expect(res.status).toBe(401);
    });

    it('should reject student access with 403', async () => {
      const res = await request(app)
        .get('/api/admin/exams')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(res.status).toBe(403);
    });

    it('should allow admin access', async () => {
      const res = await request(app)
        .get('/api/admin/exams')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
    });
  });

  // ─── EXAM CRUD ──────────────────────────────────────────

  describe('Exam CRUD', () => {
    const examData = {
      title: 'Admin Exam',
      description: 'An admin-created exam',
      category: 'math',
      difficulty: 'easy',
      duration: 60,
      passingScore: 70,
    };

    it('should create an exam', async () => {
      const res = await request(app)
        .post('/api/admin/exams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(examData);

      expect(res.status).toBe(201);
      expect(res.body.exam.title).toBe('Admin Exam');
      expect(res.body.exam.category).toBe('math');
      expect(res.body.exam.createdBy).toBe(adminId.toString());
    });

    it('should reject exam creation with missing required fields', async () => {
      const res = await request(app)
        .post('/api/admin/exams')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Incomplete' });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it('should list all exams (including inactive)', async () => {
      await Exam.create({ ...examData, isActive: true, createdBy: adminId });
      await Exam.create({
        ...examData,
        title: 'Inactive Exam',
        isActive: false,
        createdBy: adminId,
      });

      const res = await request(app)
        .get('/api/admin/exams')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.exams).toHaveLength(2);
    });

    it('should update an exam', async () => {
      const exam = await Exam.create({ ...examData, createdBy: adminId });

      const res = await request(app)
        .put(`/api/admin/exams/${exam._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Title', duration: 90 });

      expect(res.status).toBe(200);
      expect(res.body.exam.title).toBe('Updated Title');
      expect(res.body.exam.duration).toBe(90);
    });

    it('should delete an exam and its questions', async () => {
      const exam = await Exam.create({ ...examData, createdBy: adminId });
      await Question.create({
        examId: exam._id,
        questionText: 'Q?',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
        createdBy: adminId,
      });

      const res = await request(app)
        .delete(`/api/admin/exams/${exam._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      // Verify exam and questions are deleted
      const deletedExam = await Exam.findById(exam._id);
      expect(deletedExam).toBeNull();

      const remainingQuestions = await Question.find({ examId: exam._id });
      expect(remainingQuestions).toHaveLength(0);
    });

    it('should toggle exam active status', async () => {
      const exam = await Exam.create({
        ...examData,
        isActive: true,
        createdBy: adminId,
      });

      // Toggle off
      let res = await request(app)
        .patch(`/api/admin/exams/${exam._id}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.exam.isActive).toBe(false);

      // Toggle back on
      res = await request(app)
        .patch(`/api/admin/exams/${exam._id}/toggle-active`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.exam.isActive).toBe(true);
    });
  });

  // ─── QUESTION CRUD ──────────────────────────────────────

  describe('Question CRUD', () => {
    let testExam;

    const questionData = {
      questionText: 'What is 10 / 2?',
      options: [
        { text: '3', isCorrect: false },
        { text: '5', isCorrect: true },
        { text: '7', isCorrect: false },
      ],
      explanation: '10 divided by 2 equals 5',
      points: 2,
      order: 1,
    };

    beforeEach(async () => {
      testExam = await Exam.create({
        title: 'Question Test Exam',
        description: 'For testing questions',
        category: 'math',
        difficulty: 'easy',
        duration: 30,
        passingScore: 50,
        createdBy: adminId,
      });
    });

    it('should create a question for an exam', async () => {
      const res = await request(app)
        .post('/api/admin/questions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...questionData, examId: testExam._id.toString() });

      expect(res.status).toBe(201);
      expect(res.body.question.questionText).toBe('What is 10 / 2?');
      expect(res.body.question.options).toHaveLength(3);
      expect(res.body.question.examId).toBe(testExam._id.toString());
    });

    it('should list questions for an exam', async () => {
      await Question.create({
        ...questionData,
        examId: testExam._id,
        createdBy: adminId,
      });
      await Question.create({
        ...questionData,
        questionText: 'What is 3 × 3?',
        order: 2,
        examId: testExam._id,
        createdBy: adminId,
      });

      const res = await request(app)
        .get(`/api/admin/exams/${testExam._id}/questions`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(2);
    });

    it('should update a question', async () => {
      const question = await Question.create({
        ...questionData,
        examId: testExam._id,
        createdBy: adminId,
      });

      const res = await request(app)
        .put(`/api/admin/questions/${question._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ questionText: 'Updated question text', points: 5 });

      expect(res.status).toBe(200);
      expect(res.body.question.questionText).toBe('Updated question text');
      expect(res.body.question.points).toBe(5);
    });

    it('should delete a question', async () => {
      const question = await Question.create({
        ...questionData,
        examId: testExam._id,
        createdBy: adminId,
      });

      const res = await request(app)
        .delete(`/api/admin/questions/${question._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const deleted = await Question.findById(question._id);
      expect(deleted).toBeNull();
    });
  });
});
