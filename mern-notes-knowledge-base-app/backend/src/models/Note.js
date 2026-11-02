import mongoose from 'mongoose';

/**
 * Valid note colors matching the Hearth Notes design system.
 * Kept as an exported constant so validators and other modules can reuse it.
 */
export const VALID_COLORS = ['default', 'sage', 'terracotta', 'mustard', 'slate'];

/**
 * Note Schema for Hearth Notes.
 *
 * Every field is derived from the existing JSON-based note structure
 * (notes.repository.js seed data, note.validation.js, and notes.service.js).
 *
 * The `user` field adds a relationship to the User model so that notes
 * can be associated with their respective owners once authentication is
 * implemented in a future task.
 */
const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required.'],
      index: true, // Fast lookup of all notes belonging to a user
    },

    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      maxlength: [200, 'Title must be 200 characters or fewer.'],
    },

    content: {
      type: String,
      default: '',
      maxlength: [50000, 'Content must be 50,000 characters or fewer.'],
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 20,
        message: 'A note can have at most 20 tags.',
      },
    },

    color: {
      type: String,
      enum: {
        values: VALID_COLORS,
        message: `Color must be one of: ${VALID_COLORS.join(', ')}.`,
      },
      default: 'default',
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    isTrash: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Indexes ──────────────────────────────────────────────────────────────
// Compound index for the most common query pattern:
// "get all non-deleted, non-archived notes for a user, sorted by updatedAt"
noteSchema.index({ user: 1, isDeleted: 1, isArchived: 1, updatedAt: -1 });

// Support tag-based filtering
noteSchema.index({ tags: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;

