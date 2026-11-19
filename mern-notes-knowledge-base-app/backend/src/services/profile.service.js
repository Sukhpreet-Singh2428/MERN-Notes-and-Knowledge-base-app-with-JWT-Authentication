import profileRepo from '../repositories/profile.repository.js';

/**
 * Profile Service — Business logic for authenticated profile operations.
 *
 * Uses an explicit whitelist to prevent modification of protected fields.
 * The userId always comes from the authenticated JWT (req.user.id),
 * never from the client request body.
 */

/** Fields that clients are allowed to update. */
const ALLOWED_UPDATE_FIELDS = ['displayName', 'avatarUrl', 'bio', 'theme'];

class ProfileService {
  /**
   * Retrieve the authenticated user's profile.
   *
   * @param {string} userId - Authenticated user's ID from JWT.
   * @returns {Object|null} Serialized profile or null.
   */
  async getProfile(userId) {
    return profileRepo.getByUserId(userId);
  }

  /**
   * Update the authenticated user's profile.
   *
   * Validates input and applies an explicit whitelist so that protected
   * fields (email, password, _id, createdAt, updatedAt, __v) are never
   * writable through this endpoint.
   *
   * @param {string} userId - Authenticated user's ID from JWT.
   * @param {Object} data - Raw request body from the client.
   * @returns {Object} Updated serialized profile, or { error } on failure.
   */
  async updateProfile(userId, data) {
    const allowed = {};

    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (data[field] !== undefined) {
        allowed[field] = data[field];
      }
    }

    // ── Validate displayName ──────────────────────────────────────────
    if (allowed.displayName !== undefined) {
      if (typeof allowed.displayName !== 'string' || !allowed.displayName.trim()) {
        return { error: 'Display name is required.' };
      }
      allowed.displayName = allowed.displayName.trim().slice(0, 100);
    }

    // ── Validate bio ──────────────────────────────────────────────────
    if (allowed.bio !== undefined) {
      allowed.bio = (typeof allowed.bio === 'string' ? allowed.bio.trim() : '').slice(0, 200);
    }

    // ── Validate avatarUrl ────────────────────────────────────────────
    if (allowed.avatarUrl !== undefined) {
      allowed.avatarUrl = typeof allowed.avatarUrl === 'string' ? allowed.avatarUrl.trim() : '';
    }

    // ── Validate theme ────────────────────────────────────────────────
    if (allowed.theme !== undefined) {
      const validThemes = ['light', 'dark'];
      if (!validThemes.includes(allowed.theme)) {
        return { error: 'Theme must be either "light" or "dark".' };
      }
    }

    // ── No valid fields supplied ──────────────────────────────────────
    if (Object.keys(allowed).length === 0) {
      return { error: 'No valid fields to update.' };
    }

    const updated = await profileRepo.updateByUserId(userId, allowed);
    if (!updated) {
      return { error: 'Profile not found.' };
    }

    return updated;
  }
}

export default new ProfileService();
