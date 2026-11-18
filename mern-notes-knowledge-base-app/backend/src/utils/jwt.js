import jwt from 'jsonwebtoken';

/**
 * JWT Utility for Hearth Notes.
 *
 * Provides a reusable, modular token-generation function.
 * All JWT configuration is sourced from environment variables.
 *
 * Security:
 *  - Secret is NEVER hardcoded.
 *  - Payload is kept minimal (userId only).
 *  - Signing algorithm is explicitly set to HS256.
 *  - Missing configuration throws at startup, not at runtime.
 */

// ── Configuration ────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a signed JWT for a given user.
 *
 * @param {string} userId - The MongoDB ObjectId (as string) for the user.
 * @returns {string} A signed JWT string.
 * @throws {Error} If JWT_SECRET is not configured.
 */
export function generateToken(userId) {
  if (!JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not defined. ' +
      'Please set JWT_SECRET in your .env file. ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
    );
  }

  if (!userId) {
    throw new Error('userId is required to generate a JWT.');
  }

  const payload = { userId: String(userId) };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'hearth-notes',
    audience: 'hearth-notes-client',
  });
}

/**
 * Verify and decode a JWT.
 *
 * Exported for use in tests and future middleware (Task 05).
 * NOT used in this task's route handlers.
 *
 * @param {string} token - The JWT string to verify.
 * @returns {Object} The decoded payload.
 * @throws {Error} If the token is invalid, expired, or the secret is missing.
 */
export function verifyToken(token) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined.');
  }

  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: 'hearth-notes',
    audience: 'hearth-notes-client',
  });
}
