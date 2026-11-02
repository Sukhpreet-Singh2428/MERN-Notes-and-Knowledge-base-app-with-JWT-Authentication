import mongoose from 'mongoose';

/**
 * User Schema for Hearth Notes.
 *
 * Captures the identity and profile fields derived from the existing
 * profile.json structure (displayName, bio, avatarUrl, theme), plus
 * authentication-ready fields (email, password) for future tasks.
 *
 * The password field is included in the schema definition so the data
 * model is complete, but hashing and auth logic are NOT implemented here.
 */
const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: [true, 'Display name is required.'],
      trim: true,
      maxlength: [100, 'Display name must be 100 characters or fewer.'],
    },

    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address.',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must be at least 8 characters.'],
      select: false, // Never returned in queries by default
    },

    bio: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Bio must be 200 characters or fewer.'],
    },

    avatarUrl: {
      type: String,
      default: '',
      trim: true,
    },

    theme: {
      type: String,
      enum: {
        values: ['light', 'dark'],
        message: 'Theme must be either "light" or "dark".',
      },
      default: 'light',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const User = mongoose.model('User', userSchema);

export default User;

