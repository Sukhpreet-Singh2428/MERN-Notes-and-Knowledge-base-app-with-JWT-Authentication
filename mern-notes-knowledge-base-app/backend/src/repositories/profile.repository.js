import User from '../models/User.js';
import { serializeUser } from '../serializers/user.serializer.js';

/**
 * Profile Repository — MongoDB-backed.
 *
 * Replaces the former JSON file-based repository.
 * All operations use the authenticated user's ID (never client-supplied).
 */
class ProfileRepository {
  /**
   * Retrieve the authenticated user's profile from MongoDB.
   *
   * @param {string} userId - The authenticated user's MongoDB ObjectId string.
   * @returns {Object|null} Serialized safe user object, or null if not found.
   */
  async getByUserId(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) return null;
    return serializeUser(user);
  }

  /**
   * Update the authenticated user's profile in MongoDB.
   *
   * Only receives pre-validated, whitelisted fields from the service layer.
   *
   * @param {string} userId - The authenticated user's MongoDB ObjectId string.
   * @param {Object} updates - Whitelisted field updates.
   * @returns {Object|null} Serialized safe user object after update, or null.
   */
  async updateByUserId(userId, updates) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { returnDocument: 'after', runValidators: true }
    ).select('-password');

    if (!user) return null;
    return serializeUser(user);
  }
}

export default new ProfileRepository();
