/**
 * Task 06 — Protected Notes CRUD with MongoDB Tests
 *
 * Comprehensive tests for authenticated Notes API:
 *  - Authentication enforcement (401 without valid JWT)
 *  - Ownership isolation (queries scoped to authenticated user)
 *  - Create note with server-enforced ownership (cannot override `user`)
 *  - Input validation (title required, valid color enum, tags array)
 *  - Read notes list (only owns notes returned)
 *  - Read single note by ID (404 if owned by another user)
 *  - Update note (only allowed fields, cannot change ownership)
 *  - Soft delete (trash semantics) & restore
 *  - Permanent delete (only allowed when note is in trash)
 *  - State toggles (isPinned, isArchived)
 *  - Cross-user security tests (User A vs User B strict isolation)
 */

import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB, clearTestDB } from './setup.js';
import app from '../src/app.js';
import authService from '../src/services/auth.service.js';
import Note from '../src/models/Note.js';

let request;

// Helper to generate distinct test users
function createTestUser(tag = 'user') {
  const rand = Math.random().toString(36).substring(2, 8);
  return {
    displayName: `Test ${tag} ${rand}`,
    email: `${tag}_${rand}_${Date.now()}@example.com`,
    password: 'Password123!Secure',
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
// 1. AUTHENTICATION ENFORCEMENT (All Notes endpoints require JWT)
// ═══════════════════════════════════════════════════════════════════════════
describe('Notes API — Authentication Enforcement', () => {
  it('GET /api/notes without token should return 401', async () => {
    const res = await request.get('/api/notes').expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('GET /api/notes/:id without token should return 401', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request.get(`/api/notes/${fakeId}`).expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('POST /api/notes without token should return 401', async () => {
    const res = await request
      .post('/api/notes')
      .send({ title: 'Unauthenticated Note' })
      .expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('PUT /api/notes/:id without token should return 401', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request
      .put(`/api/notes/${fakeId}`)
      .send({ title: 'Updated' })
      .expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('PATCH /api/notes/:id/pin without token should return 401', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request.patch(`/api/notes/${fakeId}/pin`).expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('PATCH /api/notes/:id/archive without token should return 401', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request.patch(`/api/notes/${fakeId}/archive`).expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });

  it('DELETE /api/notes/:id without token should return 401', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request.delete(`/api/notes/${fakeId}`).expect(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Authentication required');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. CREATE NOTE & OWNERSHIP ASSIGNMENT
// ═══════════════════════════════════════════════════════════════════════════
describe('Notes API — Create Note', () => {
  it('should create a note and automatically assign ownership to authenticated user', async () => {
    const userReg = await authService.register(createTestUser('creator'));
    const token = userReg.token;
    const userId = String(userReg.user._id);

    const notePayload = {
      title: 'Architectural Blueprint',
      content: 'Database design for Hearth Notes',
      tags: ['architecture', 'db'],
      color: 'sage',
    };

    const res = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(notePayload)
      .expect(201);

    expect(res.body.success).toBe(true);
    const created = res.body.data;
    expect(created._id).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.title).toBe(notePayload.title);
    expect(created.content).toBe(notePayload.content);
    expect(created.tags).toEqual(['architecture', 'db']);
    expect(created.color).toBe('sage');
    expect(created.isDeleted).toBe(false);
    expect(created.isArchived).toBe(false);

    // Verify database record has user field set to authenticated user
    const dbNote = await Note.findById(created._id);
    expect(dbNote).toBeDefined();
    expect(String(dbNote.user)).toBe(userId);
  });

  it('should ignore and override client-supplied user ownership field', async () => {
    const userReg = await authService.register(createTestUser('spoofer'));
    const token = userReg.token;
    const realUserId = String(userReg.user._id);
    const fakeOwnerId = new mongoose.Types.ObjectId().toString();

    const res = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Attempted Hijack Note',
        content: 'Content',
        user: fakeOwnerId,
        userId: fakeOwnerId,
        ownerId: fakeOwnerId,
      })
      .expect(201);

    // Backend must enforce real authenticated user
    const dbNote = await Note.findById(res.body.data._id);
    expect(String(dbNote.user)).toBe(realUserId);
    expect(String(dbNote.user)).not.toBe(fakeOwnerId);
  });

  it('should reject note creation with missing or empty title', async () => {
    const userReg = await authService.register(createTestUser('validator'));
    const token = userReg.token;

    const res = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Note with no title' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should reject note creation with invalid color', async () => {
    const userReg = await authService.register(createTestUser('coloruser'));
    const token = userReg.token;

    const res = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Invalid Color Note', color: 'neon-purple' })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. READ NOTES (GET /api/notes and GET /api/notes/:id)
// ═══════════════════════════════════════════════════════════════════════════
describe('Notes API — Read Notes', () => {
  it('should return only notes belonging to the authenticated user', async () => {
    const userA = await authService.register(createTestUser('userA'));
    const userB = await authService.register(createTestUser('userB'));

    // Create 2 notes for User A
    await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ title: 'User A Note 1' });
    await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ title: 'User A Note 2' });

    // Create 1 note for User B
    await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ title: 'User B Note 1' });

    // User A fetches notes
    const resA = await request
      .get('/api/notes')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);

    expect(resA.body.success).toBe(true);
    expect(resA.body.count).toBe(2);
    expect(resA.body.data).toHaveLength(2);
    expect(resA.body.data.every((n) => n.title.startsWith('User A'))).toBe(true);

    // User B fetches notes
    const resB = await request
      .get('/api/notes')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(resB.body.success).toBe(true);
    expect(resB.body.count).toBe(1);
    expect(resB.body.data[0].title).toBe('User B Note 1');
  });

  it('should retrieve a single note by ID for the owner', async () => {
    const user = await authService.register(createTestUser('single'));
    const createRes = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Specific Note', content: 'Details' });

    const noteId = createRes.body.data._id;

    const res = await request
      .get(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(noteId);
    expect(res.body.data.title).toBe('Specific Note');
  });

  it('should return 404 for a non-existent note ID', async () => {
    const user = await authService.register(createTestUser('ghost'));
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request
      .get(`/api/notes/${fakeId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should return 404 for a malformed non-ObjectId note ID without crashing', async () => {
    const user = await authService.register(createTestUser('malformed'));

    const res = await request
      .get('/api/notes/invalid-id-format')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. UPDATE NOTE
// ═══════════════════════════════════════════════════════════════════════════
describe('Notes API — Update Note', () => {
  it('should update allowed fields for the note owner', async () => {
    const user = await authService.register(createTestUser('updater'));
    const createRes = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Original Title', content: 'Original Content', color: 'default' });

    const noteId = createRes.body.data._id;

    const res = await request
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Updated Title', color: 'terracotta' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.color).toBe('terracotta');
    expect(res.body.data.content).toBe('Original Content');
  });

  it('should prevent client from altering the note user ownership during update', async () => {
    const user = await authService.register(createTestUser('security'));
    const originalUserId = String(user.user._id);
    const attackerId = new mongoose.Types.ObjectId().toString();

    const createRes = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Fixed Owner Note' });

    const noteId = createRes.body.data._id;

    await request
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'New Title', user: attackerId, userId: attackerId })
      .expect(200);

    const dbNote = await Note.findById(noteId);
    expect(String(dbNote.user)).toBe(originalUserId);
  });

  it('should reject editing a trashed note with 404', async () => {
    const user = await authService.register(createTestUser('trashedit'));
    const createRes = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'To Be Trashed' });

    const noteId = createRes.body.data._id;

    // Move to trash
    await request
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    // Attempt to update
    const res = await request
      .put(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Try Edit Trashed' })
      .expect(404);

    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. STATE OPERATIONS (Pin, Archive, Trash, Restore, Permanent Delete)
// ═══════════════════════════════════════════════════════════════════════════
describe('Notes API — State Operations', () => {
  it('should toggle note pin state', async () => {
    const user = await authService.register(createTestUser('pinner'));
    const createRes = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Pin Test Note' });

    const noteId = createRes.body.data._id;

    // Pin
    const pinRes = await request
      .patch(`/api/notes/${noteId}/pin`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(pinRes.body.data.isPinned).toBe(true);

    // Unpin
    const unpinRes = await request
      .patch(`/api/notes/${noteId}/pin`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(unpinRes.body.data.isPinned).toBe(false);
  });

  it('should toggle note archive state', async () => {
    const user = await authService.register(createTestUser('archiver'));
    const createRes = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Archive Test Note' });

    const noteId = createRes.body.data._id;

    // Archive
    const archRes = await request
      .patch(`/api/notes/${noteId}/archive`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(archRes.body.data.isArchived).toBe(true);

    // Unarchive
    const unarchRes = await request
      .patch(`/api/notes/${noteId}/archive`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(unarchRes.body.data.isArchived).toBe(false);
  });

  it('should soft delete note (move to trash) and restore it', async () => {
    const user = await authService.register(createTestUser('trasher'));
    const createRes = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Soft Delete Note', isPinned: true });

    const noteId = createRes.body.data._id;

    // Soft delete (moves to trash, unpins)
    const delRes = await request
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(delRes.body.data.isDeleted).toBe(true);
    expect(delRes.body.data.isTrash).toBe(true);
    expect(delRes.body.data.isPinned).toBe(false);
    expect(delRes.body.data.deletedAt).toBeDefined();

    // Verify it is excluded from default "all" view
    const listRes = await request
      .get('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(listRes.body.data.some((n) => n._id === noteId)).toBe(false);

    // Verify it appears in "trash" view
    const trashRes = await request
      .get('/api/notes?view=trash')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(trashRes.body.data.some((n) => n._id === noteId)).toBe(true);

    // Restore from trash
    const restoreRes = await request
      .patch(`/api/notes/${noteId}/restore`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(restoreRes.body.data.isDeleted).toBe(false);
    expect(restoreRes.body.data.isTrash).toBe(false);
  });

  it('should permanently delete note only if it is in trash', async () => {
    const user = await authService.register(createTestUser('perm'));
    const createRes = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Permanent Delete Candidate' });

    const noteId = createRes.body.data._id;

    // Attempt permanent delete before moving to trash -> 400
    const prematureRes = await request
      .delete(`/api/notes/${noteId}/permanent`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(400);

    expect(prematureRes.body.error.code).toBe('INVALID_OPERATION');

    // Move to trash
    await request
      .delete(`/api/notes/${noteId}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    // Permanent delete succeeds
    const permRes = await request
      .delete(`/api/notes/${noteId}/permanent`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(permRes.body.success).toBe(true);

    // Verify document is removed from database
    const dbNote = await Note.findById(noteId);
    expect(dbNote).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. CROSS-USER SECURITY TESTS (Mandatory Strict Isolation)
// ═══════════════════════════════════════════════════════════════════════════
describe('Cross-User Security — Strict Isolation between User A and User B', () => {
  let userA;
  let userB;
  let noteAId;

  beforeEach(async () => {
    userA = await authService.register(createTestUser('UserA'));
    userB = await authService.register(createTestUser('UserB'));

    // Create a note belonging to User A
    const res = await request
      .post('/api/notes')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        title: 'Secret Diary of User A',
        content: 'Confidential thoughts',
        color: 'mustard',
        isPinned: true,
      });

    noteAId = res.body.data._id;
  });

  it('User B cannot retrieve User A note (must return 404)', async () => {
    const res = await request
      .get(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('User B cannot see User A note in notes list', async () => {
    const res = await request
      .get('/api/notes')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(res.body.data).toHaveLength(0);
  });

  it('User B cannot see User A note in search results', async () => {
    const res = await request
      .get('/api/notes?search=Secret')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(res.body.data).toHaveLength(0);
  });

  it('User B cannot update User A note (must return 404)', async () => {
    const res = await request
      .put(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ title: 'Tampered Title by User B' })
      .expect(404);

    expect(res.body.success).toBe(false);

    // Verify User A note was not modified in database
    const dbNote = await Note.findById(noteAId);
    expect(dbNote.title).toBe('Secret Diary of User A');
  });

  it('User B cannot toggle pin on User A note (must return 404)', async () => {
    const res = await request
      .patch(`/api/notes/${noteAId}/pin`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  it('User B cannot toggle archive on User A note (must return 404)', async () => {
    const res = await request
      .patch(`/api/notes/${noteAId}/archive`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  it('User B cannot soft delete User A note (must return 404)', async () => {
    const res = await request
      .delete(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(404);

    expect(res.body.success).toBe(false);

    // Verify User A note remains not deleted
    const dbNote = await Note.findById(noteAId);
    expect(dbNote.isDeleted).toBe(false);
  });

  it('User B cannot restore User A note (must return 404)', async () => {
    // User A moves note to trash
    await request
      .delete(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);

    // User B tries to restore
    const res = await request
      .patch(`/api/notes/${noteAId}/restore`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(404);

    expect(res.body.success).toBe(false);
  });

  it('User B cannot permanently delete User A note (must return 404)', async () => {
    // User A moves note to trash
    await request
      .delete(`/api/notes/${noteAId}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);

    // User B tries to permanently delete
    const res = await request
      .delete(`/api/notes/${noteAId}/permanent`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(404);

    expect(res.body.success).toBe(false);

    // Verify note is still in database
    const dbNote = await Note.findById(noteAId);
    expect(dbNote).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. REGRESSION VERIFICATION (JSON Profile API remains functional)
// ═══════════════════════════════════════════════════════════════════════════
describe('Regression Verification — JSON Profile API remains functional', () => {
  it('GET /api/profile should continue working without authentication', async () => {
    const res = await request.get('/api/profile').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.displayName).toBeDefined();
  });

  it('PUT /api/profile should continue updating profile JSON', async () => {
    const original = await request.get('/api/profile');
    const originalBio = original.body.data.bio;

    const res = await request
      .put('/api/profile')
      .send({ bio: 'Updated Bio via Profile API' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.bio).toBe('Updated Bio via Profile API');

    // Restore original profile state
    await request.put('/api/profile').send({ bio: originalBio });
  });
});
