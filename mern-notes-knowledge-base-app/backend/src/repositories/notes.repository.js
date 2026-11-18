import mongoose from 'mongoose';
import Note from '../models/Note.js';

/**
 * MongoDB Notes Repository for Hearth Notes.
 *
 * All operations are strictly scoped to the authenticated user ID at the query level.
 * Cross-user access is impossible because queries always include { user: userId }.
 */
class NotesRepository {
  /**
   * Find all notes belonging to a specific user, with optional filtering and sorting.
   *
   * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ID
   * @param {Object} query - { view, search, tag, color, dateFrom, dateTo, sort }
   * @returns {Promise<Array>} List of Mongoose Note documents
   */
  async findByUser(userId, query = {}) {
    const { view = 'all', search, tag, color, dateFrom, dateTo, sort = 'updatedAt' } = query;

    const filter = {
      user: userId,
    };

    // ── View Filter ──────────────────────────────────────────────────
    switch (view) {
      case 'pinned':
        filter.isDeleted = false;
        filter.isArchived = false;
        filter.isPinned = true;
        break;
      case 'archived':
        filter.isDeleted = false;
        filter.isArchived = true;
        break;
      case 'trash':
        filter.$or = [{ isDeleted: true }, { isTrash: true }];
        break;
      case 'all':
      default:
        filter.isDeleted = false;
        filter.isArchived = false;
        break;
    }

    // ── Search Filter ────────────────────────────────────────────────
    // Case-insensitive, matches title, content, or tags
    if (search && search.trim()) {
      const rawQ = search.trim();
      const cleanQ = rawQ.replace(/^#+/, '').trim();
      const escaped = cleanQ.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');

      const searchConditions = [
        { title: { $regex: searchRegex } },
        { content: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // ── Tag Filter ───────────────────────────────────────────────────
    if (tag && tag.trim()) {
      const t = tag.trim().replace(/^#+/, '');
      const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const tagRegex = new RegExp(`^${escaped}$`, 'i');
      filter.tags = { $elemMatch: { $regex: tagRegex } };
    }

    // ── Color Filter ─────────────────────────────────────────────────
    if (color && color.trim()) {
      filter.color = color.trim();
    }

    // ── Date Range Filter ────────────────────────────────────────────
    if (dateFrom || dateTo) {
      const dateFilter = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (!isNaN(from)) dateFilter.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (!isNaN(to)) {
          to.setHours(23, 59, 59, 999);
          dateFilter.$lte = to;
        }
      }
      if (Object.keys(dateFilter).length > 0) {
        filter.createdAt = dateFilter;
      }
    }

    // ── Sorting ──────────────────────────────────────────────────────
    const sortField = sort === 'createdAt' ? 'createdAt' : 'updatedAt';
    let sortOptions;
    if (view === 'all') {
      sortOptions = { isPinned: -1, [sortField]: -1 };
    } else {
      sortOptions = { [sortField]: -1 };
    }

    return Note.find(filter).sort(sortOptions);
  }

  /**
   * Find a single note by user and note ID.
   *
   * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ID
   * @param {string} noteId - Note's ObjectId
   * @returns {Promise<Object|null>} Note document or null
   */
  async findByIdAndUser(userId, noteId) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return null;
    }
    return Note.findOne({ _id: noteId, user: userId });
  }

  /**
   * Create a new note belonging to the authenticated user.
   *
   * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ID
   * @param {Object} data - Validated note data
   * @returns {Promise<Object>} Created Note document
   */
  async create(userId, data) {
    return Note.create({
      user: userId,
      title: data.title,
      content: data.content || '',
      tags: data.tags || [],
      color: data.color || 'default',
      isPinned: Boolean(data.isPinned),
      isArchived: Boolean(data.isArchived),
      isDeleted: false,
      isTrash: false,
      deletedAt: null,
    });
  }

  /**
   * Update a note belonging to the authenticated user.
   *
   * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ID
   * @param {string} noteId - Note ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated Note document or null
   */
  async update(userId, noteId, updates) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return null;
    }
    return Note.findOneAndUpdate(
      { _id: noteId, user: userId },
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    );
  }

  /**
   * Permanently delete a note belonging to the authenticated user.
   *
   * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ID
   * @param {string} noteId - Note ID
   * @returns {Promise<boolean>} True if removed, false otherwise
   */
  async remove(userId, noteId) {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return false;
    }
    const result = await Note.deleteOne({ _id: noteId, user: userId });
    return result.deletedCount > 0;
  }
}

export default new NotesRepository();
