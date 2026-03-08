/**
 * Auth Route Tests (11 test cases)
 *
 * Covers: register (success, duplicate, missing fields, short password),
 * login (success, wrong password, non-existent email, missing fields),
 * and GET /me (valid token, no token, invalid token).
 * Uses MongoMemoryServer for isolated, in-memory database testing.
 */
require('./setup');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../server');
const User = require('../models/User');

describe('Auth Routes', () => {
  // ─── REGISTER ────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test User', email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      const hashed = await bcrypt.hash('password123', 12);
      await User.create({ name: 'Existing', email: 'dup@example.com', password: hashed });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Another', email: 'dup@example.com', password: 'password123' });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/already registered/i);
    });

    it('should reject when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'no-name@example.com' });

      expect(res.status).toBe(400);
    });

    it('should reject password shorter than 6 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Short', email: 'short@example.com', password: '123' });

      expect(res.status).toBe(400);
    });
  });

  // ─── LOGIN ───────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashed = await bcrypt.hash('password123', 12);
      await User.create({ name: 'Login User', email: 'login@example.com', password: hashed });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('login@example.com');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });

    it('should reject when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── ME ──────────────────────────────────────────────────

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Me User', email: 'me@example.com', password: 'password123' });
      token = res.body.token;
    });

    it('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('me@example.com');
      expect(res.body.user.name).toBe('Me User');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
    });
  });
});
