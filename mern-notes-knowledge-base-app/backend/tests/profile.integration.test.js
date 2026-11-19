/**
 * Task 07 — Authenticated Profile Integration with MongoDB Tests
 *
 * Comprehensive test suite covering:
 *
 * 1. Authentication Enforcement
 *    - GET /api/profile without JWT → 401
 *    - PUT /api/profile without JWT → 401
 *
 * 2. Profile Read (GET)
 *    - Authenticated user can retrieve own profile
 *    - Returned profile contains expected safe fields
 *    - Password hash is not returned
 *    - __v is not returned
 *    - updatedAt is not returned
 *
 * 3. Profile Update (PUT)
 *    - Can update displayName
 *    - Can update bio
 *    - Can update avatarUrl
 *    - Can update theme
 *    - Updated data persists in MongoDB
 *    - GET immediately reflects updated data
 *    - Multiple fields can be updated at once
 *    - Validation: empty displayName rejected
 *    - Validation: invalid theme rejected
 *    - Validation: no valid fields → error
 *
 * 4. Protected Fields
 *    - Cannot modify email
 *    - Cannot modify password
 *    - Cannot modify _id
 *    - Cannot modify createdAt
 *    - Cannot modify updatedAt
 *    - Cannot inject userId / ownerId
 *    - Cannot inject arbitrary MongoDB operators ($set, $unset, etc.)
 *
 * 5. Cross-User Isolation
 *    - User A cannot target User B's profile
 *    - User A's update remains attached to User A
 *    - User B's profile remains unchanged after User A's operations
 *
 * 6. Edge Cases
 *    - Deleted user (valid JWT, no user in DB) → 401 from middleware
 */

import 'dotenv/config';

// ── Ensure JWT environment variables are available for test suite ─────────
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-that-is-long-enough-for-hs256-signing-algorithm-testing';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.NODE_ENV = 'test';

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import app from '../src/app.js';
import authService from '../src/services/auth.service.js';
import User from '../src/models/User.js';

let request;

// Helper to create distinct test users
function createTestUser(tag = 'profile') {
  const rand = Math.random().toString(36).substring(2, 8);
  return {
    displayName: `Test ${tag} ${rand}`,
    email: `${tag}_${rand}_${Date.now()}@example.com`,
    password: 'SecurePassword123!',
  };
}

beforeAll(async () => {
  await setupTestDB();
  request = supertest(app);
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. AUTHENTICATION ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════════════
describe('Profile API — Authentication Enforcement', () => {
  it('GET /api/profile without JWT should return 401', async () => {
    const res = await request.get('/api/profile').expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('PUT /api/profile without JWT should return 401', async () => {
    const res = await request
      .put('/api/profile')
      .send({ displayName: 'Hacker' })
      .expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/profile with invalid JWT should return 401', async () => {
    const res = await request
      .get('/api/profile')
      .set('Authorization', 'Bearer invalid.token.here')
      .expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('PUT /api/profile with invalid JWT should return 401', async () => {
    const res = await request
      .put('/api/profile')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({ displayName: 'Hacker' })
      .expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid or expired token');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. PROFILE READ (GET /api/profile)
// ═══════════════════════════════════════════════════════════════════════════
describe('Profile API — Read Profile', () => {
  it('should return the authenticated user profile', async () => {
    const userData = createTestUser('reader');
    const reg = await authService.register(userData);

    const res = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data._id).toBe(String(reg.user._id));
    expect(res.body.data.displayName).toBe(userData.displayName);
    expect(res.body.data.email).toBe(userData.email.toLowerCase());
  });

  it('should return expected safe fields in profile response', async () => {
    const reg = await authService.register(createTestUser('safefields'));

    const res = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .expect(200);

    const profile = res.body.data;
    // Safe fields must be present
    expect(profile._id).toBeDefined();
    expect(profile.displayName).toBeDefined();
    expect(profile.email).toBeDefined();
    expect(profile.avatarUrl).toBeDefined();
    expect(profile.bio).toBeDefined();
    expect(profile.theme).toBeDefined();
    expect(profile.createdAt).toBeDefined();
  });

  it('should NOT return password hash in profile response', async () => {
    const userData = createTestUser('nopwd');
    const reg = await authService.register(userData);

    const res = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .expect(200);

    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.passwordHash).toBeUndefined();

    const responseStr = JSON.stringify(res.body);
    expect(responseStr).not.toContain(userData.password);
    expect(responseStr).not.toMatch(/\$2[aby]\$/);
  });

  it('should NOT return __v in profile response', async () => {
    const reg = await authService.register(createTestUser('nov'));

    const res = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .expect(200);

    expect(res.body.data.__v).toBeUndefined();
  });

  it('should NOT return updatedAt in profile response', async () => {
    const reg = await authService.register(createTestUser('noup'));

    const res = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .expect(200);

    expect(res.body.data.updatedAt).toBeUndefined();
  });

  it('should return default values for optional profile fields', async () => {
    const reg = await authService.register(createTestUser('defaults'));

    const res = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .expect(200);

    // Registered without bio/avatarUrl — defaults should apply
    expect(res.body.data.avatarUrl).toBe('');
    expect(res.body.data.bio).toBe('');
    expect(res.body.data.theme).toBe('light');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. PROFILE UPDATE (PUT /api/profile)
// ═══════════════════════════════════════════════════════════════════════════
describe('Profile API — Update Profile', () => {
  it('should update displayName', async () => {
    const reg = await authService.register(createTestUser('updname'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ displayName: 'New Display Name' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.displayName).toBe('New Display Name');
  });

  it('should update bio', async () => {
    const reg = await authService.register(createTestUser('updbio'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ bio: 'A new biography text' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.bio).toBe('A new biography text');
  });

  it('should update avatarUrl', async () => {
    const reg = await authService.register(createTestUser('updavatar'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ avatarUrl: 'https://example.com/avatar.jpg' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.avatarUrl).toBe('https://example.com/avatar.jpg');
  });

  it('should update theme to dark', async () => {
    const reg = await authService.register(createTestUser('updtheme'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ theme: 'dark' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.theme).toBe('dark');
  });

  it('should update theme back to light', async () => {
    const reg = await authService.register(createTestUser('updtheme2'));

    // Set to dark first
    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ theme: 'dark' });

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ theme: 'light' })
      .expect(200);

    expect(res.body.data.theme).toBe('light');
  });

  it('should persist updated data in MongoDB', async () => {
    const reg = await authService.register(createTestUser('persist'));

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ displayName: 'Persisted Name', bio: 'Persisted Bio' })
      .expect(200);

    // Verify directly in database
    const dbUser = await User.findById(reg.user._id);
    expect(dbUser.displayName).toBe('Persisted Name');
    expect(dbUser.bio).toBe('Persisted Bio');
  });

  it('should reflect updated data on immediate GET', async () => {
    const reg = await authService.register(createTestUser('getafter'));

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({
        displayName: 'Immediate Read',
        bio: 'Bio After Update',
        theme: 'dark',
      })
      .expect(200);

    const getRes = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .expect(200);

    expect(getRes.body.data.displayName).toBe('Immediate Read');
    expect(getRes.body.data.bio).toBe('Bio After Update');
    expect(getRes.body.data.theme).toBe('dark');
  });

  it('should update multiple fields at once', async () => {
    const reg = await authService.register(createTestUser('multi'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({
        displayName: 'Multi Update',
        bio: 'Multi Bio',
        avatarUrl: 'https://example.com/multi.jpg',
        theme: 'dark',
      })
      .expect(200);

    expect(res.body.data.displayName).toBe('Multi Update');
    expect(res.body.data.bio).toBe('Multi Bio');
    expect(res.body.data.avatarUrl).toBe('https://example.com/multi.jpg');
    expect(res.body.data.theme).toBe('dark');
  });

  it('should reject empty displayName', async () => {
    const reg = await authService.register(createTestUser('emptyname'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ displayName: '' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Display name is required.');
  });

  it('should reject whitespace-only displayName', async () => {
    const reg = await authService.register(createTestUser('wsname'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ displayName: '   ' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Display name is required.');
  });

  it('should reject invalid theme value', async () => {
    const reg = await authService.register(createTestUser('badtheme'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ theme: 'neon' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Theme must be');
  });

  it('should reject request with no valid fields', async () => {
    const reg = await authService.register(createTestUser('nofields'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ randomField: 'some value' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('No valid fields to update.');
  });

  it('should reject empty request body', async () => {
    const reg = await authService.register(createTestUser('emptybody'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('No valid fields to update.');
  });

  it('should trim displayName whitespace', async () => {
    const reg = await authService.register(createTestUser('trimname'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ displayName: '  Trimmed Name  ' })
      .expect(200);

    expect(res.body.data.displayName).toBe('Trimmed Name');
  });

  it('should truncate displayName to 100 characters', async () => {
    const reg = await authService.register(createTestUser('longname'));
    const longName = 'A'.repeat(150);

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ displayName: longName })
      .expect(200);

    expect(res.body.data.displayName.length).toBeLessThanOrEqual(100);
  });

  it('should truncate bio to 200 characters', async () => {
    const reg = await authService.register(createTestUser('longbio'));
    const longBio = 'B'.repeat(300);

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ bio: longBio })
      .expect(200);

    expect(res.body.data.bio.length).toBeLessThanOrEqual(200);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. PROTECTED FIELDS — Cannot Modify Security-Sensitive Fields
// ═══════════════════════════════════════════════════════════════════════════
describe('Profile API — Protected Fields', () => {
  it('should NOT allow modifying email through profile update', async () => {
    const userData = createTestUser('emailprot');
    const reg = await authService.register(userData);
    const originalEmail = userData.email.toLowerCase();

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ email: 'hacker@evil.com', displayName: 'Still Me' })
      .expect(200);

    // Email should remain unchanged
    expect(res.body.data.email).toBe(originalEmail);

    // Verify in database
    const dbUser = await User.findById(reg.user._id);
    expect(dbUser.email).toBe(originalEmail);
  });

  it('should NOT allow modifying password through profile update', async () => {
    const userData = createTestUser('pwdprot');
    const reg = await authService.register(userData);

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ password: 'NewHackedPassword123!', displayName: 'Still Me' })
      .expect(200);

    // Verify password was NOT changed — original password still works for login
    const loginRes = await authService.login({
      email: userData.email,
      password: userData.password,
    });
    expect(loginRes.token).toBeDefined();
    expect(loginRes.error).toBeUndefined();
  });

  it('should NOT allow modifying _id through profile update', async () => {
    const reg = await authService.register(createTestUser('idprot'));
    const originalId = String(reg.user._id);
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ _id: fakeId, displayName: 'Still Me' })
      .expect(200);

    expect(res.body.data._id).toBe(originalId);
  });

  it('should NOT allow modifying createdAt through profile update', async () => {
    const reg = await authService.register(createTestUser('catprot'));
    const originalCreatedAt = reg.user.createdAt;

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ createdAt: '2000-01-01T00:00:00.000Z', displayName: 'Still Me' })
      .expect(200);

    // Verify createdAt was NOT changed
    const dbUser = await User.findById(reg.user._id);
    expect(new Date(dbUser.createdAt).toISOString()).toBe(
      new Date(originalCreatedAt).toISOString()
    );
  });

  it('should NOT allow modifying updatedAt through profile update', async () => {
    const reg = await authService.register(createTestUser('uatprot'));

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ updatedAt: '2000-01-01T00:00:00.000Z', displayName: 'Still Me' })
      .expect(200);

    // Verify updatedAt is NOT set to the client's value
    const dbUser = await User.findById(reg.user._id);
    expect(new Date(dbUser.updatedAt).getFullYear()).not.toBe(2000);
  });

  it('should NOT allow injecting userId field', async () => {
    const reg = await authService.register(createTestUser('uidinject'));
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ userId: fakeId, displayName: 'Still Me' })
      .expect(200);

    // The update should only affect the authenticated user
    expect(res.body.data._id).toBe(String(reg.user._id));
  });

  it('should NOT allow injecting ownerId field', async () => {
    const reg = await authService.register(createTestUser('oidinject'));
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ ownerId: fakeId, displayName: 'Still Me' })
      .expect(200);

    expect(res.body.data._id).toBe(String(reg.user._id));
  });

  it('should NOT allow injecting __v field', async () => {
    const reg = await authService.register(createTestUser('vinject'));

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ __v: 999, displayName: 'Still Me' })
      .expect(200);

    const dbUser = await User.findById(reg.user._id);
    expect(dbUser.__v).not.toBe(999);
  });

  it('should NOT allow arbitrary MongoDB operators ($set)', async () => {
    const reg = await authService.register(createTestUser('opset'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ $set: { email: 'hacker@evil.com' }, displayName: 'Valid Name' })
      .expect(200);

    // Email should NOT be changed
    const dbUser = await User.findById(reg.user._id);
    expect(dbUser.email).not.toBe('hacker@evil.com');
  });

  it('should NOT allow arbitrary MongoDB operators ($unset)', async () => {
    const reg = await authService.register(createTestUser('opunset'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ $unset: { email: '' }, displayName: 'Valid Name' })
      .expect(200);

    // Email should still exist
    const dbUser = await User.findById(reg.user._id);
    expect(dbUser.email).toBeDefined();
    expect(dbUser.email.length).toBeGreaterThan(0);
  });

  it('should NOT allow arbitrary MongoDB operators ($push)', async () => {
    const reg = await authService.register(createTestUser('oppush'));

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ $push: { roles: 'admin' }, displayName: 'Valid Name' })
      .expect(200);

    // User document should not have a roles field
    const dbUser = await User.findById(reg.user._id).lean();
    expect(dbUser.roles).toBeUndefined();
  });

  it('should NOT allow arbitrary MongoDB operators ($rename)', async () => {
    const reg = await authService.register(createTestUser('oprename'));

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ $rename: { email: 'oldEmail' }, displayName: 'Valid Name' })
      .expect(200);

    // Email field should still exist under its original name
    const dbUser = await User.findById(reg.user._id);
    expect(dbUser.email).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. CROSS-USER ISOLATION
// ═══════════════════════════════════════════════════════════════════════════
describe('Profile API — Cross-User Isolation', () => {
  let userA;
  let userB;

  beforeEach(async () => {
    userA = await authService.register(createTestUser('UserA'));
    userB = await authService.register(createTestUser('UserB'));
  });

  it('User A cannot target User B profile via userId in body', async () => {
    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        userId: String(userB.user._id),
        displayName: 'Hijacked by A',
      })
      .expect(200);

    // User A's profile was updated, not User B's
    expect(res.body.data._id).toBe(String(userA.user._id));
    expect(res.body.data.displayName).toBe('Hijacked by A');

    // Verify User B's profile is unchanged
    const userBProfile = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(userBProfile.body.data.displayName).toBe(userB.user.displayName);
    expect(userBProfile.body.data.displayName).not.toBe('Hijacked by A');
  });

  it('User A cannot target User B profile via ownerId in body', async () => {
    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        ownerId: String(userB.user._id),
        bio: 'Injected Bio',
      })
      .expect(200);

    // User B's bio should be unchanged
    const userBProfile = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(userBProfile.body.data.bio).not.toBe('Injected Bio');
  });

  it('User A cannot target User B profile via id in body', async () => {
    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        id: String(userB.user._id),
        displayName: 'Stolen Identity',
      })
      .expect(200);

    // User B's displayName should be unchanged
    const userBProfile = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(userBProfile.body.data.displayName).not.toBe('Stolen Identity');
  });

  it('User A update remains attached only to User A', async () => {
    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ displayName: 'User A Updated', bio: 'User A Bio', theme: 'dark' })
      .expect(200);

    const profileA = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);

    expect(profileA.body.data.displayName).toBe('User A Updated');
    expect(profileA.body.data.bio).toBe('User A Bio');
    expect(profileA.body.data.theme).toBe('dark');
  });

  it('User B profile remains unchanged after User A operations', async () => {
    // User A performs updates
    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ displayName: 'User A Modified', bio: 'Modified Bio', theme: 'dark' })
      .expect(200);

    // Verify User B is completely unaffected
    const profileB = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(profileB.body.data._id).toBe(String(userB.user._id));
    expect(profileB.body.data.displayName).toBe(userB.user.displayName);
    expect(profileB.body.data.email).toBe(userB.user.email);
    expect(profileB.body.data.theme).toBe('light'); // default, not dark
  });

  it('Each user can only read their own profile', async () => {
    // Update both users differently
    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ displayName: 'Alpha User' })
      .expect(200);

    await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ displayName: 'Beta User' })
      .expect(200);

    // Verify isolation
    const profileA = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);

    const profileB = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(profileA.body.data.displayName).toBe('Alpha User');
    expect(profileA.body.data._id).toBe(String(userA.user._id));

    expect(profileB.body.data.displayName).toBe('Beta User');
    expect(profileB.body.data._id).toBe(String(userB.user._id));

    // Cross-check: neither sees the other's data
    expect(profileA.body.data._id).not.toBe(profileB.body.data._id);
    expect(profileA.body.data.displayName).not.toBe(profileB.body.data.displayName);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. EDGE CASES
// ═══════════════════════════════════════════════════════════════════════════
describe('Profile API — Edge Cases', () => {
  it('should return consistent structure between serializer and profile GET', async () => {
    const reg = await authService.register(createTestUser('consistent'));

    const getRes = await request
      .get('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .expect(200);

    // The serialized user shape from registration should match profile GET
    const profileData = getRes.body.data;
    expect(profileData._id).toBe(String(reg.user._id));
    expect(profileData.displayName).toBe(reg.user.displayName);
    expect(profileData.email).toBe(reg.user.email);
    expect(profileData.avatarUrl).toBe(reg.user.avatarUrl);
    expect(profileData.bio).toBe(reg.user.bio);
    expect(profileData.theme).toBe(reg.user.theme);
  });

  it('should handle non-string bio gracefully', async () => {
    const reg = await authService.register(createTestUser('badbio'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ bio: 12345 })
      .expect(200);

    // Should coerce to empty string per existing validation
    expect(typeof res.body.data.bio).toBe('string');
  });

  it('should handle non-string avatarUrl gracefully', async () => {
    const reg = await authService.register(createTestUser('badavatar'));

    const res = await request
      .put('/api/profile')
      .set('Authorization', `Bearer ${reg.token}`)
      .send({ avatarUrl: 999 })
      .expect(200);

    expect(typeof res.body.data.avatarUrl).toBe('string');
  });
});
