/**
 * Task 04 — JWT Token Generation Tests
 *
 * Comprehensive test suite covering:
 *  1.  Successful registration returns a JWT.
 *  2.  Successful login returns a JWT.
 *  3.  Registration and login return valid tokens.
 *  4.  Token payload contains the correct userId.
 *  5.  Token algorithm is HS256.
 *  6.  Token expiration is configured correctly.
 *  7.  Token signature can be verified using the configured secret.
 *  8.  Invalid login does not return a token.
 *  9.  Duplicate registration does not return a token.
 *  10. Password and password hash are never exposed.
 *  11. JWT secret is never exposed.
 *  12. Existing authentication tests still pass (register/login flow).
 *  13. Existing JSON-based APIs remain functional.
 *
 * Uses mongodb-memory-server for isolated testing — no Atlas connection.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';

// ── Set required environment variables BEFORE importing the app ─────────
process.env.JWT_SECRET = 'test-jwt-secret-that-is-long-enough-for-hs256-signing-algorithm-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

// Dynamic import so env vars are set before modules load
let app;
let request;

const TEST_USER = {
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  password: 'SecurePass123!',
};

const TEST_USER_2 = {
  displayName: 'John Smith',
  email: 'john@example.com',
  password: 'AnotherPass456!',
};

beforeAll(async () => {
  await setupTestDB();
  const appModule = await import('../src/app.js');
  app = appModule.default;
  request = supertest(app);
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. JWT UTILITY UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe('JWT Utility — generateToken / verifyToken', () => {
  it('should generate a valid JWT string', async () => {
    const { generateToken } = await import('../src/utils/jwt.js');
    const token = generateToken('507f1f77bcf86cd799439011');
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // header.payload.signature
  });

  it('should throw if userId is not provided', async () => {
    const { generateToken } = await import('../src/utils/jwt.js');
    expect(() => generateToken(null)).toThrow('userId is required');
    expect(() => generateToken(undefined)).toThrow('userId is required');
    expect(() => generateToken('')).toThrow('userId is required');
  });

  it('should encode userId in the payload', async () => {
    const { generateToken } = await import('../src/utils/jwt.js');
    const userId = '507f1f77bcf86cd799439011';
    const token = generateToken(userId);
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe(userId);
  });

  it('should use HS256 algorithm', async () => {
    const { generateToken } = await import('../src/utils/jwt.js');
    const token = generateToken('507f1f77bcf86cd799439011');
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
    expect(header.alg).toBe('HS256');
  });

  it('should set expiration from JWT_EXPIRES_IN', async () => {
    const { generateToken } = await import('../src/utils/jwt.js');
    const token = generateToken('507f1f77bcf86cd799439011');
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.iat).toBeDefined();
    // 1h = 3600 seconds
    expect(decoded.exp - decoded.iat).toBe(3600);
  });

  it('should set issuer and audience claims', async () => {
    const { generateToken } = await import('../src/utils/jwt.js');
    const token = generateToken('507f1f77bcf86cd799439011');
    const decoded = jwt.decode(token);
    expect(decoded.iss).toBe('hearth-notes');
    expect(decoded.aud).toBe('hearth-notes-client');
  });

  it('should be verifiable with the configured secret', async () => {
    const { generateToken, verifyToken } = await import('../src/utils/jwt.js');
    const userId = '507f1f77bcf86cd799439011';
    const token = generateToken(userId);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(userId);
  });

  it('should NOT contain password or sensitive data in the payload', async () => {
    const { generateToken } = await import('../src/utils/jwt.js');
    const token = generateToken('507f1f77bcf86cd799439011');
    const decoded = jwt.decode(token);
    expect(decoded.password).toBeUndefined();
    expect(decoded.email).toBeUndefined();
    expect(decoded.displayName).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. REGISTRATION WITH JWT
// ═══════════════════════════════════════════════════════════════════════════
describe('POST /api/auth/register — JWT Integration', () => {
  it('should return 201 with a JWT on successful registration', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.split('.')).toHaveLength(3);
  });

  it('should return a serialized user object alongside the token', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    const { user } = res.body.data;
    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(user.displayName).toBe(TEST_USER.displayName);
    expect(user.email).toBe(TEST_USER.email);
    expect(user.avatarUrl).toBeDefined();
    expect(user.bio).toBeDefined();
    expect(user.theme).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  it('should return a token with the correct userId in the payload', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    const { token, user } = res.body.data;
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe(String(user._id));
  });

  it('should return a token signed with HS256', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    const { token } = res.body.data;
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
    expect(header.alg).toBe('HS256');
  });

  it('should return a token with correct expiration', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    const { token } = res.body.data;
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp - decoded.iat).toBe(3600); // 1h
  });

  it('should return a token verifiable with the configured secret', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    const { token } = res.body.data;
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    expect(decoded.userId).toBeDefined();
  });

  it('should NEVER expose the password in the response', async () => {
    const res = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    const responseStr = JSON.stringify(res.body);
    expect(res.body.data.user.password).toBeUndefined();
    expect(responseStr).not.toContain(TEST_USER.password);
    // Should not contain bcrypt hash pattern
    expect(responseStr).not.toMatch(/\$2[aby]\$/);
  });

  it('should NOT return a token for duplicate email registration', async () => {
    // First registration
    await request.post('/api/auth/register').send(TEST_USER).expect(201);

    // Duplicate registration
    const res = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();
    expect(res.body.error).toBeDefined();
  });

  it('should NOT return a token for missing fields', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ email: 'test@test.com' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();
  });

  it('should NOT return a token for short password', async () => {
    const res = await request
      .post('/api/auth/register')
      .send({ displayName: 'Test', email: 'test@test.com', password: 'short' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. LOGIN WITH JWT
// ═══════════════════════════════════════════════════════════════════════════
describe('POST /api/auth/login — JWT Integration', () => {
  beforeEach(async () => {
    await clearTestDB();
    // Register user for login tests
    await request.post('/api/auth/register').send(TEST_USER);
  });

  it('should return 200 with a JWT on successful login', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(typeof res.body.data.token).toBe('string');
    expect(res.body.data.token.split('.')).toHaveLength(3);
  });

  it('should return the serialized user object alongside the token', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    const { user } = res.body.data;
    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(user.displayName).toBe(TEST_USER.displayName);
    expect(user.email).toBe(TEST_USER.email);
    expect(user.avatarUrl).toBeDefined();
    expect(user.createdAt).toBeDefined();
  });

  it('should return a token with the correct userId', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    const { token, user } = res.body.data;
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe(String(user._id));
  });

  it('should return a token signed with HS256', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    const { token } = res.body.data;
    const header = JSON.parse(Buffer.from(token.split('.')[0], 'base64url').toString());
    expect(header.alg).toBe('HS256');
  });

  it('should return a token with correct expiration', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    const { token } = res.body.data;
    const decoded = jwt.decode(token);
    expect(decoded.exp - decoded.iat).toBe(3600);
  });

  it('should return a token verifiable with the configured secret', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    const { token } = res.body.data;
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
    expect(decoded.userId).toBeDefined();
  });

  it('should NEVER expose the password in the response', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    const responseStr = JSON.stringify(res.body);
    expect(res.body.data.user.password).toBeUndefined();
    expect(responseStr).not.toContain(TEST_USER.password);
    expect(responseStr).not.toMatch(/\$2[aby]\$/);
  });

  it('should NOT return a token for wrong password', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPassword123!' })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();
    expect(res.body.error.message).toBe('Invalid email or password.');
  });

  it('should NOT return a token for non-existent user', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'SomePass123!' })
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();
    expect(res.body.error.message).toBe('Invalid email or password.');
  });

  it('should NOT return a token for missing credentials', async () => {
    const res = await request
      .post('/api/auth/login')
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.data).toBeUndefined();
  });

  it('should use the same generic error for wrong email and wrong password', async () => {
    const wrongEmail = await request
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: TEST_USER.password });

    const wrongPass = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: 'WrongPassword123!' });

    // Both should return the same generic message (prevents user enumeration)
    expect(wrongEmail.body.error.message).toBe(wrongPass.body.error.message);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. SECURITY TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe('Security — JWT and password safety', () => {
  it('JWT secret is never exposed in registration response', async () => {
    const res = await request.post('/api/auth/register').send(TEST_USER).expect(201);
    const responseStr = JSON.stringify(res.body);
    expect(responseStr).not.toContain(process.env.JWT_SECRET);
  });

  it('JWT secret is never exposed in login response', async () => {
    await request.post('/api/auth/register').send(TEST_USER);
    const res = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    const responseStr = JSON.stringify(res.body);
    expect(responseStr).not.toContain(process.env.JWT_SECRET);
  });

  it('token is NOT verifiable with a wrong secret', async () => {
    const res = await request.post('/api/auth/register').send(TEST_USER).expect(201);
    const { token } = res.body.data;

    expect(() => {
      jwt.verify(token, 'wrong-secret', { algorithms: ['HS256'] });
    }).toThrow();
  });

  it('password hash is not stored in the token payload', async () => {
    const res = await request.post('/api/auth/register').send(TEST_USER).expect(201);
    const { token } = res.body.data;
    const decoded = jwt.decode(token, { complete: true });
    const payloadStr = JSON.stringify(decoded.payload);
    expect(payloadStr).not.toMatch(/\$2[aby]\$/);
    expect(payloadStr).not.toContain('password');
  });

  it('token payload contains only minimal identity information', async () => {
    const res = await request.post('/api/auth/register').send(TEST_USER).expect(201);
    const { token } = res.body.data;
    const decoded = jwt.decode(token);

    // Only these fields should be in the payload
    const allowedKeys = ['userId', 'iat', 'exp', 'iss', 'aud'];
    const actualKeys = Object.keys(decoded);
    for (const key of actualKeys) {
      expect(allowedKeys).toContain(key);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. SERIALIZER TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe('User Serializer', () => {
  it('should serialize a user object with correct fields', async () => {
    const { serializeUser } = await import('../src/serializers/user.serializer.js');
    const mockUser = {
      _id: '507f1f77bcf86cd799439011',
      displayName: 'Test User',
      email: 'test@example.com',
      password: '$2a$10$hashedPasswordShouldNeverAppear',
      avatarUrl: '',
      bio: 'Hello',
      theme: 'dark',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const serialized = serializeUser(mockUser);
    expect(serialized._id).toBe(mockUser._id);
    expect(serialized.displayName).toBe(mockUser.displayName);
    expect(serialized.email).toBe(mockUser.email);
    expect(serialized.avatarUrl).toBe('');
    expect(serialized.bio).toBe('Hello');
    expect(serialized.theme).toBe('dark');
    expect(serialized.createdAt).toBeDefined();
    // NEVER include password
    expect(serialized.password).toBeUndefined();
    // NEVER include updatedAt in serialized output
    expect(serialized.updatedAt).toBeUndefined();
  });

  it('should return null for null input', async () => {
    const { serializeUser } = await import('../src/serializers/user.serializer.js');
    expect(serializeUser(null)).toBeNull();
  });

  it('should default avatarUrl to empty string', async () => {
    const { serializeUser } = await import('../src/serializers/user.serializer.js');
    const serialized = serializeUser({ _id: '1', displayName: 'X', email: 'x@x.com' });
    expect(serialized.avatarUrl).toBe('');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. EXISTING AUTHENTICATION FLOW TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe('Existing auth flow — register + login', () => {
  it('should register and then login with the same credentials', async () => {
    // Register
    const regRes = await request
      .post('/api/auth/register')
      .send(TEST_USER)
      .expect(201);

    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.user.email).toBe(TEST_USER.email);

    // Login
    const loginRes = await request
      .post('/api/auth/login')
      .send({ email: TEST_USER.email, password: TEST_USER.password })
      .expect(200);

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.user.email).toBe(TEST_USER.email);

    // Both should have valid tokens
    expect(regRes.body.data.token).toBeDefined();
    expect(loginRes.body.data.token).toBeDefined();

    const decodedReg = jwt.verify(regRes.body.data.token, process.env.JWT_SECRET);
    const decodedLogin = jwt.verify(loginRes.body.data.token, process.env.JWT_SECRET);
    expect(decodedReg.userId).toBe(String(regRes.body.data.user._id));
    expect(decodedLogin.userId).toBe(String(loginRes.body.data.user._id));
  });

  it('should handle case-insensitive email during registration and login', async () => {
    await request
      .post('/api/auth/register')
      .send({ ...TEST_USER, email: 'Jane@Example.COM' })
      .expect(201);

    const res = await request
      .post('/api/auth/login')
      .send({ email: 'jane@example.com', password: TEST_USER.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should register multiple different users', async () => {
    const res1 = await request.post('/api/auth/register').send(TEST_USER).expect(201);
    const res2 = await request.post('/api/auth/register').send(TEST_USER_2).expect(201);

    expect(res1.body.data.user._id).not.toBe(res2.body.data.user._id);
    expect(res1.body.data.token).toBeDefined();
    expect(res2.body.data.token).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. EXISTING JSON-BASED API TESTS
// ═══════════════════════════════════════════════════════════════════════════
describe('Existing JSON-based APIs remain functional', () => {
  it('GET / should return welcome message', async () => {
    const res = await request.get('/').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Hearth Notes');
    expect(res.body.endpoints.auth).toBe('/api/auth');
  });

  it('GET /api/health should return health status', async () => {
    const res = await request.get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /api/notes should return notes (JSON-based)', async () => {
    const res = await request.get('/api/notes').expect(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/profile should return profile (JSON-based)', async () => {
    const res = await request.get('/api/profile').expect(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 for undefined routes', async () => {
    const res = await request.get('/api/nonexistent').expect(404);
    expect(res.body.success).toBe(false);
  });
});
