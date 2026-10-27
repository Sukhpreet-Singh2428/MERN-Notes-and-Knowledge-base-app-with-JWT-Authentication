import notesRepo from '../repositories/notes.repository.js';
import crypto from 'node:crypto';

class NotesService {
  /**
   * Helper to normalize note object with consistent boolean flags
   */
  _normalize(note) {
    if (!note) return null;
    const isDeleted = Boolean(note.isDeleted || note.isTrash);
    return {
      ...note,
      isDeleted,
      isTrash: isDeleted,
      deletedAt: note.deletedAt || (isDeleted ? (note.updatedAt || new Date().toISOString()) : null),
    };
  }

  /**
   * Get notes with optional filtering.
   * @param {Object} query - { view, search, tag, color, dateFrom, dateTo, sort }
   */
  async getNotes(query = {}) {
    let rawNotes = await notesRepo.getAll();
    let notes = rawNotes.map((n) => this._normalize(n));
    const { view = 'all', search, tag, color, dateFrom, dateTo, sort = 'updatedAt' } = query;

    // View filtering
    switch (view) {
      case 'pinned':
        notes = notes.filter((n) => !n.isDeleted && !n.isArchived && n.isPinned);
        break;
      case 'archived':
        notes = notes.filter((n) => !n.isDeleted && n.isArchived);
        break;
      case 'trash':
        notes = notes.filter((n) => n.isDeleted);
        break;
      case 'all':
      default:
        notes = notes.filter((n) => !n.isDeleted && !n.isArchived);
        break;
    }

    // Search filter: case-insensitive, matches title, content, and tags
    if (search && search.trim()) {
      const rawQ = search.trim().toLowerCase();
      const cleanQ = rawQ.replace(/^#+/, '').trim();

      notes = notes.filter((n) => {
        // Match in title
        const titleMatch = Boolean(n.title && n.title.toLowerCase().includes(cleanQ));
        // Match in content
        const contentMatch = Boolean(n.content && n.content.toLowerCase().includes(cleanQ));
        // Match in tags (exact, substring, or with/without #)
        const tagMatch =
          Array.isArray(n.tags) &&
          n.tags.some((t) => {
            const tagLower = t.toLowerCase();
            return (
              tagLower.includes(cleanQ) ||
              tagLower === cleanQ ||
              cleanQ.includes(tagLower) ||
              `#${tagLower}`.includes(rawQ)
            );
          });

        return titleMatch || contentMatch || tagMatch;
      });
    }

    // Tag filter: matches tag name with or without leading '#'
    if (tag && tag.trim()) {
      const t = tag.trim().toLowerCase().replace(/^#+/, '');
      notes = notes.filter(
        (n) => n.tags && n.tags.some((nt) => nt.toLowerCase() === t)
      );
    }

    // Color filter
    if (color && color.trim()) {
      notes = notes.filter((n) => n.color === color.trim());
    }

    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (!isNaN(from)) {
        notes = notes.filter((n) => new Date(n.createdAt) >= from);
      }
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (!isNaN(to)) {
        to.setHours(23, 59, 59, 999);
        notes = notes.filter((n) => new Date(n.createdAt) <= to);
      }
    }

    // Sorting
    const sortField = sort === 'createdAt' ? 'createdAt' : 'updatedAt';
    notes.sort((a, b) => {
      if (view === 'all') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }
      return new Date(b[sortField]) - new Date(a[sortField]);
    });

    return notes;
  }

  async getNoteById(id) {
    const note = await notesRepo.findById(id);
    return this._normalize(note);
  }

  async createNote(data) {
    const now = new Date().toISOString();
    const note = {
      id: crypto.randomUUID(),
      title: data.title,
      content: data.content || '',
      tags: data.tags || [],
      color: data.color || 'default',
      isPinned: Boolean(data.isPinned),
      isArchived: Boolean(data.isArchived),
      isDeleted: false,
      isTrash: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    const created = await notesRepo.create(note);
    return this._normalize(created);
  }

  async updateNote(id, data) {
    const existing = await notesRepo.findById(id);
    if (!existing) return null;
    if (existing.isDeleted) return null; // Cannot edit trashed notes

    const updates = { ...data, updatedAt: new Date().toISOString() };
    const updated = await notesRepo.update(id, updates);
    return this._normalize(updated);
  }

  async togglePin(id) {
    const note = await notesRepo.findById(id);
    if (!note || note.isDeleted) return null;
    const updated = await notesRepo.update(id, {
      isPinned: !note.isPinned,
      updatedAt: new Date().toISOString(),
    });
    return this._normalize(updated);
  }

  async toggleArchive(id) {
    const note = await notesRepo.findById(id);
    if (!note || note.isDeleted) return null;
    const updated = await notesRepo.update(id, {
      isArchived: !note.isArchived,
      updatedAt: new Date().toISOString(),
    });
    return this._normalize(updated);
  }

  /** Soft delete - moves to trash */
  async softDelete(id) {
    const note = await notesRepo.findById(id);
    if (!note) return null;
    const now = new Date().toISOString();
    const updated = await notesRepo.update(id, {
      isDeleted: true,
      isTrash: true,
      deletedAt: now,
      isPinned: false,
      updatedAt: now,
    });
    return this._normalize(updated);
  }

  /** Restore from trash */
  async restore(id) {
    const note = await notesRepo.findById(id);
    if (!note || (!note.isDeleted && !note.isTrash)) return null;
    const updated = await notesRepo.update(id, {
      isDeleted: false,
      isTrash: false,
      deletedAt: null,
      updatedAt: new Date().toISOString(),
    });
    return this._normalize(updated);
  }

  /** Permanent delete - removes from data */
  async permanentDelete(id) {
    const note = await notesRepo.findById(id);
    if (!note) return null;
    if (!note.isDeleted && !note.isTrash) {
      return { error: 'Note must be in trash before permanent deletion.' };
    }
    const removed = await notesRepo.remove(id);
    return removed ? { removed: true } : null;
  }
}

export default new NotesService();
