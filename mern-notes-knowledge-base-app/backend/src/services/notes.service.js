import notesRepo from '../repositories/notes.repository.js';

/**
 * Notes Service for Hearth Notes.
 *
 * Implements business logic for note operations.
 * Every operation requires the authenticated user's ID.
 */
class NotesService {
  /**
   * Helper to normalize note object with consistent boolean flags and both `_id` and `id`
   *
   * @param {Object} note - Mongoose document or plain object
   * @returns {Object|null}
   */
  _normalize(note) {
    if (!note) return null;
    const doc = typeof note.toObject === 'function' ? note.toObject() : { ...note };
    const isDeleted = Boolean(doc.isDeleted || doc.isTrash);
    return {
      ...doc,
      _id: doc._id,
      id: String(doc._id || doc.id),
      isDeleted,
      isTrash: isDeleted,
      deletedAt: doc.deletedAt || (isDeleted ? (doc.updatedAt || new Date()) : null),
    };
  }

  /**
   * Get notes for an authenticated user with optional filtering.
   *
   * @param {string} userId - Authenticated user's ID
   * @param {Object} query - { view, search, tag, color, dateFrom, dateTo, sort }
   */
  async getNotes(userId, query = {}) {
    const rawNotes = await notesRepo.findByUser(userId, query);
    return rawNotes.map((n) => this._normalize(n));
  }

  /**
   * Get a single note by user ID and note ID.
   *
   * @param {string} userId - Authenticated user's ID
   * @param {string} id - Note ID
   */
  async getNoteById(userId, id) {
    const note = await notesRepo.findByIdAndUser(userId, id);
    return this._normalize(note);
  }

  /**
   * Create a note for the authenticated user.
   *
   * @param {string} userId - Authenticated user's ID
   * @param {Object} data - Note data (title, content, tags, color, isPinned, isArchived)
   */
  async createNote(userId, data) {
    const created = await notesRepo.create(userId, data);
    return this._normalize(created);
  }

  /**
   * Update an existing note belonging to the authenticated user.
   *
   * @param {string} userId - Authenticated user's ID
   * @param {string} id - Note ID
   * @param {Object} data - Update payload
   */
  async updateNote(userId, id, data) {
    const existing = await notesRepo.findByIdAndUser(userId, id);
    if (!existing) return null;
    if (existing.isDeleted || existing.isTrash) return null; // Cannot edit trashed notes

    const allowed = {};
    if (data.title !== undefined) allowed.title = data.title;
    if (data.content !== undefined) allowed.content = data.content;
    if (data.tags !== undefined) allowed.tags = data.tags;
    if (data.color !== undefined) allowed.color = data.color;
    if (data.isPinned !== undefined) allowed.isPinned = Boolean(data.isPinned);
    if (data.isArchived !== undefined) allowed.isArchived = Boolean(data.isArchived);

    const updated = await notesRepo.update(userId, id, allowed);
    return this._normalize(updated);
  }

  /**
   * Toggle pin state for a note belonging to the authenticated user.
   *
   * @param {string} userId - Authenticated user's ID
   * @param {string} id - Note ID
   */
  async togglePin(userId, id) {
    const note = await notesRepo.findByIdAndUser(userId, id);
    if (!note || note.isDeleted || note.isTrash) return null;

    const updated = await notesRepo.update(userId, id, {
      isPinned: !note.isPinned,
    });
    return this._normalize(updated);
  }

  /**
   * Toggle archive state for a note belonging to the authenticated user.
   *
   * @param {string} userId - Authenticated user's ID
   * @param {string} id - Note ID
   */
  async toggleArchive(userId, id) {
    const note = await notesRepo.findByIdAndUser(userId, id);
    if (!note || note.isDeleted || note.isTrash) return null;

    const updated = await notesRepo.update(userId, id, {
      isArchived: !note.isArchived,
    });
    return this._normalize(updated);
  }

  /**
   * Soft delete a note (move to trash).
   *
   * @param {string} userId - Authenticated user's ID
   * @param {string} id - Note ID
   */
  async softDelete(userId, id) {
    const note = await notesRepo.findByIdAndUser(userId, id);
    if (!note) return null;

    const updated = await notesRepo.update(userId, id, {
      isDeleted: true,
      isTrash: true,
      isPinned: false,
      deletedAt: new Date(),
    });
    return this._normalize(updated);
  }

  /**
   * Restore a note from trash.
   *
   * @param {string} userId - Authenticated user's ID
   * @param {string} id - Note ID
   */
  async restore(userId, id) {
    const note = await notesRepo.findByIdAndUser(userId, id);
    if (!note || (!note.isDeleted && !note.isTrash)) return null;

    const updated = await notesRepo.update(userId, id, {
      isDeleted: false,
      isTrash: false,
      deletedAt: null,
    });
    return this._normalize(updated);
  }

  /**
   * Permanently delete a note (must be in trash first).
   *
   * @param {string} userId - Authenticated user's ID
   * @param {string} id - Note ID
   */
  async permanentDelete(userId, id) {
    const note = await notesRepo.findByIdAndUser(userId, id);
    if (!note) return null;
    if (!note.isDeleted && !note.isTrash) {
      return { error: 'Note must be in trash before permanent deletion.' };
    }

    const removed = await notesRepo.remove(userId, id);
    return removed ? { removed: true } : null;
  }
}

export default new NotesService();
