import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { serializeUser } from '../serializers/user.serializer.js';

const SALT_ROUNDS = 12;

/**
 * Authentication Service for Hearth Notes.
 *
 * Handles user registration and login with bcrypt password hashing
 * and JWT token generation.
 *
 * Security:
 *  - Passwords are hashed with bcryptjs (12 salt rounds).
 *  - Tokens are generated only for successful authentication.
 *  - User responses are sanitized through the centralized serializer.
 *  - Generic error messages prevent user enumeration.
 */
class AuthService {
  /**
   * Register a new user.
   *
   * @param {Object} params
   * @param {string} params.displayName
   * @param {string} params.email
   * @param {string} params.password
   * @returns {Promise<Object>} { user, token } on success, or { error, statusCode } on failure.
   */
  async register({ displayName, email, password }) {
    // ── Validation ─────────────────────────────────────────────────────
    if (!displayName || !email || !password) {
      return {
        error: 'Display name, email, and password are required.',
        statusCode: 400,
      };
    }

    if (password.length < 8) {
      return {
        error: 'Password must be at least 8 characters.',
        statusCode: 400,
      };
    }

    // ── Check for existing user ────────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return {
        error: 'A user with this email already exists.',
        statusCode: 409,
      };
    }

    // ── Hash password ──────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ── Create user ────────────────────────────────────────────────────
    const user = await User.create({
      displayName: displayName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    // ── Generate JWT ───────────────────────────────────────────────────
    const token = generateToken(user._id);

    return {
      user: serializeUser(user),
      token,
    };
  }

  /**
   * Log in an existing user.
   *
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password
   * @returns {Promise<Object>} { user, token } on success, or { error, statusCode } on failure.
   */
  async login({ email, password }) {
    // ── Validation ─────────────────────────────────────────────────────
    if (!email || !password) {
      return {
        error: 'Email and password are required.',
        statusCode: 400,
      };
    }

    // ── Find user and include password field ───────────────────────────
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return {
        error: 'Invalid email or password.',
        statusCode: 401,
      };
    }

    // ── Compare passwords ──────────────────────────────────────────────
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        error: 'Invalid email or password.',
        statusCode: 401,
      };
    }

    // ── Generate JWT ───────────────────────────────────────────────────
    const token = generateToken(user._id);

    return {
      user: serializeUser(user),
      token,
    };
  }
}

export default new AuthService();
