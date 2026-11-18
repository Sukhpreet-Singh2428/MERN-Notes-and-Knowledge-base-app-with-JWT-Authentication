/**
 * User DTO Serializer for Hearth Notes.
 *
 * Centralizes the transformation of a Mongoose User document
 * into a safe, consistent plain object for API responses.
 *
 * Security:
 *  - NEVER includes password or password hash.
 *  - Standardizes the avatarUrl field (always present, defaults to '').
 *  - Returns only the fields that API consumers need.
 */

/**
 * Serialize a Mongoose User document into a safe DTO.
 *
 * @param {Object} user - A Mongoose User document or plain object.
 * @returns {Object} A sanitized user object safe for API responses.
 */
export function serializeUser(user) {
  if (!user) return null;

  // Support both Mongoose documents and plain objects
  const doc = typeof user.toObject === 'function' ? user.toObject() : user;

  return {
    _id: doc._id,
    displayName: doc.displayName || '',
    email: doc.email || '',
    avatarUrl: doc.avatarUrl || '',
    bio: doc.bio || '',
    theme: doc.theme || 'light',
    createdAt: doc.createdAt,
  };
}
