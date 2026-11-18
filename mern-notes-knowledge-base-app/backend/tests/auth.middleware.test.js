/**
 * Task 05 — JWT Authentication Middleware Tests
 *
 * Comprehensive tests for backend/src/middleware/auth.middleware.js:
 *  1.  Authentication success with valid JWT attaches correct user to req.user.
 *  2.  Missing Authorization header returns 401 with 'Authentication required'.
 *  3.  Wrong scheme (Basic, Token, raw string) returns 401.
 *  4.  Bearer without token returns 401 with 'Authentication required'.
 *  5.  Invalid/malformed token returns 401.
 *  6.  Expired token returns 401.
 *  7.  Wrong signature returns 401.
 *  8.  Wrong issuer returns 401.
 *  9.  Wrong audience returns 401.
 *  10. Wrong algorithm returns 401.
 *  11. Missing userId in payload returns 401.
 *  12. Nonexistent user ID in MongoDB returns 401.
 *  13. Malformed userId (non-ObjectId) returns 401.
 *  14. Password and password hash are never attached to req.user or exposed.
 *  15. bcrypt salt rounds verification: registered passwords use 12 rounds.
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import { authenticateToken } from '../src/middleware/auth.middleware.js';
import authService from '../src/services/auth.service.js';
import User from '../src/models/User.js';

// Environment configuration for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-long-enough-for-hs256-signing-algorithm-testing';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const JWT_SECRET = process.env.JWT_SECRET;

// Test user generator for test isolation
function getTestUser(name = 'Alice') {
  const id = Math.random().toString(36).substring(2, 8);
  return {
    displayName: `${name} ${id}`,
    email: `${name.toLowerCase()}_${id}_${Date.now()}@example.com`,
    password: 'Password123!Secure',
  };
}

// Express test harness applying authenticateToken to a test protected endpoint
let testApp;
let request;

beforeAll(async () => {
  await setupTestDB();

  testApp = express();
  testApp.use(express.json());

  // Protected test route
  testApp.get('/test/protected', authenticateToken, (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  });

  request = supertest(testApp);
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION SUCCESS
// ═══════════════════════════════════════════════════════════════════════════
describe('authenticateToken — Authentication Success', () => {
  it('should authenticate successfully with valid JWT and populate req.user', async () => {
    const testUser = getTestUser('Alice');
    const regResult = await authService.register(testUser);
    expect(regResult.token).toBeDefined();

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${regResult.token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user._id).toBe(String(regResult.user._id));
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.displayName).toBe(testUser.displayName);
    expect(res.body.data.user.avatarUrl).toBeDefined();
    expect(res.body.data.user.theme).toBeDefined();
    expect(res.body.data.user.createdAt).toBeDefined();
  });

  it('should allow subsequent requests with the same valid token', async () => {
    const testUser = getTestUser('Bob');
    const regResult = await authService.register(testUser);
    expect(regResult.token).toBeDefined();

    const res1 = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${regResult.token}`)
      .expect(200);

    const res2 = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${regResult.token}`)
      .expect(200);

    expect(res1.body.data.user.email).toBe(res2.body.data.user.email);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. MISSING / MALFORMED AUTHORIZATION HEADER
// ═══════════════════════════════════════════════════════════════════════════
describe('authenticateToken — Authorization Header Handling', () => {
  it('should reject request when Authorization header is completely missing', async () => {
    const res = await request
      .get('/test/protected')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
    expect(res.body.error.message).toBe('Authentication required');
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should reject request when Authorization header is empty or whitespace', async () => {
    const res = await request
      .get('/test/protected')
      .set('Authorization', '   ')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('should reject wrong scheme: Basic', async () => {
    const res = await request
      .get('/test/protected')
      .set('Authorization', 'Basic dXNlcjpwYXNz')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject wrong scheme: Token', async () => {
    const res = await request
      .get('/test/protected')
      .set('Authorization', 'Token some-random-token')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject raw token without scheme', async () => {
    const res = await request
      .get('/test/protected')
      .set('Authorization', 'some-raw-token-without-bearer')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject Bearer scheme with empty token (Bearer)', async () => {
    const res = await request
      .get('/test/protected')
      .set('Authorization', 'Bearer')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('should reject Bearer scheme with whitespace only (Bearer   )', async () => {
    const res = await request
      .get('/test/protected')
      .set('Authorization', 'Bearer   ')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. JWT VERIFICATION REJECTIONS
// ═══════════════════════════════════════════════════════════════════════════
describe('authenticateToken — JWT Verification Rejections', () => {
  it('should reject malformed/random token string', async () => {
    const res = await request
      .get('/test/protected')
      .set('Authorization', 'Bearer this.is.not.a.valid.jwt')
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject expired JWT', async () => {
    const regResult = await authService.register(getTestUser('Expired'));

    // Create a token expired 10 seconds ago
    const expiredToken = jwt.sign(
      { userId: String(regResult.user._id) },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '-10s',
        issuer: 'hearth-notes',
        audience: 'hearth-notes-client',
      }
    );

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject token signed with a different secret', async () => {
    const regResult = await authService.register(getTestUser('WrongSec'));

    const wrongSecretToken = jwt.sign(
      { userId: String(regResult.user._id) },
      'completely-different-wrong-secret-key-12345',
      {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: 'hearth-notes',
        audience: 'hearth-notes-client',
      }
    );

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${wrongSecretToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject token with wrong issuer', async () => {
    const regResult = await authService.register(getTestUser('WrongIss'));

    const wrongIssuerToken = jwt.sign(
      { userId: String(regResult.user._id) },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: 'wrong-issuer-organization',
        audience: 'hearth-notes-client',
      }
    );

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${wrongIssuerToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject token with wrong audience', async () => {
    const regResult = await authService.register(getTestUser('WrongAud'));

    const wrongAudienceToken = jwt.sign(
      { userId: String(regResult.user._id) },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: 'hearth-notes',
        audience: 'unauthorized-external-app',
      }
    );

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${wrongAudienceToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject token with wrong algorithm', async () => {
    const regResult = await authService.register(getTestUser('WrongAlg'));

    // Sign with HS384 instead of HS256
    const wrongAlgToken = jwt.sign(
      { userId: String(regResult.user._id) },
      JWT_SECRET,
      {
        algorithm: 'HS384',
        expiresIn: '1h',
        issuer: 'hearth-notes',
        audience: 'hearth-notes-client',
      }
    );

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${wrongAlgToken}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. USER IDENTITY & MONGO LOOKUP REJECTIONS
// ═══════════════════════════════════════════════════════════════════════════
describe('authenticateToken — User Identity & MongoDB Lookup', () => {
  it('should reject token missing userId in payload', async () => {
    const tokenNoUserId = jwt.sign(
      { role: 'admin', email: 'test@example.com' },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: 'hearth-notes',
        audience: 'hearth-notes-client',
      }
    );

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${tokenNoUserId}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject token with nonexistent MongoDB user ID', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const tokenFakeUser = jwt.sign(
      { userId: fakeId },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: 'hearth-notes',
        audience: 'hearth-notes-client',
      }
    );

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${tokenFakeUser}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should reject token with malformed (non-ObjectId) userId string', async () => {
    const tokenMalformedId = jwt.sign(
      { userId: 'not-a-valid-mongodb-object-id' },
      JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: '1h',
        issuer: 'hearth-notes',
        audience: 'hearth-notes-client',
      }
    );

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${tokenMalformedId}`)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. PASSWORD & INFORMATION SECURITY
// ═══════════════════════════════════════════════════════════════════════════
describe('authenticateToken — Password & Security', () => {
  it('should NOT expose password or password hash on req.user', async () => {
    const testUser = getTestUser('SecUser');
    const regResult = await authService.register(testUser);

    const res = await request
      .get('/test/protected')
      .set('Authorization', `Bearer ${regResult.token}`)
      .expect(200);

    const user = res.body.data.user;
    expect(user.password).toBeUndefined();
    expect(user.passwordHash).toBeUndefined();

    const responseStr = JSON.stringify(res.body);
    expect(responseStr).not.toContain(testUser.password);
    expect(responseStr).not.toMatch(/\$2[aby]\$/);
  });

  it('should not leak internal JWT library errors in 401 responses', async () => {
    const res = await request
      .get('/test/protected')
      .set('Authorization', 'Bearer invalid.token')
      .expect(401);

    const responseStr = JSON.stringify(res.body);
    expect(responseStr).not.toContain('JsonWebTokenError');
    expect(responseStr).not.toContain('TokenExpiredError');
    expect(responseStr).not.toContain('jwt malformed');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. BCRYPT CONFIGURATION CORRECTION (12 ROUNDS)
// ═══════════════════════════════════════════════════════════════════════════
describe('bcrypt Salt Rounds — Task 03 Alignment', () => {
  it('should hash newly registered user passwords with 12 salt rounds', async () => {
    const regResult = await authService.register({
      displayName: 'Salt Test User',
      email: 'salttest@example.com',
      password: 'TwelveRoundsPass123!',
    });

    expect(regResult.user).toBeDefined();

    // Query user directly from MongoDB including hidden password field
    const dbUser = await User.findById(regResult.user._id).select('+password');
    expect(dbUser).toBeDefined();
    expect(dbUser.password).toBeDefined();

    // Verify bcrypt rounds
    const rounds = bcrypt.getRounds(dbUser.password);
    expect(rounds).toBe(12);
  });
});
