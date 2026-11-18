import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { serializeUser } from '../serializers/user.serializer.js';

/**
 * JWT Authentication Middleware for Hearth Notes.
 *
 * Verifies Bearer JWT from Authorization header, loads the user from MongoDB,
 * and attaches the sanitized user object to req.user.
 *
 * Rejects missing, malformed, invalid, expired, or unknown-user requests with 401.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function authenticateToken(req, res, next) {
  const rawHeader = req.headers.authorization || req.header?.('Authorization');
  const authHeader = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  // ── Case 1: Missing Authorization Header ───────────────────────────
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.trim()) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: {
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // ── Case 2: Parse "Bearer <token>" format ──────────────────────────
  const trimmed = authHeader.trim();
  const parts = trimmed.split(/\s+/);
  const scheme = parts[0];
  const token = parts.slice(1).join(' ').trim();

  // Wrong scheme (e.g. Basic, Token, or raw string without Bearer)
  if (scheme !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // Bearer scheme present but token is missing or empty
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: {
        message: 'Authentication required',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // ── Case 3: Verify Token Using Centralized JWT Utility ─────────────
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    // Covers JsonWebTokenError, TokenExpiredError, NotBeforeError, wrong secret/algorithm/issuer/audience
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // ── Case 4: Extract and Validate userId from Payload ───────────────
  if (!decoded || !decoded.userId) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      error: {
        message: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      },
    });
  }

  // ── Case 5: Load User from MongoDB and Attach to req.user ──────────
  try {
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: {
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const safeUser = serializeUser(user);
    req.user = {
      ...safeUser,
      id: String(safeUser._id),
    };

    next();
  } catch (err) {
    // CastError occurs when decoded.userId is not a valid 24-character hex ObjectId
    if (err.name === 'CastError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: {
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
        },
      });
    }
    next(err);
  }
}

export default authenticateToken;
