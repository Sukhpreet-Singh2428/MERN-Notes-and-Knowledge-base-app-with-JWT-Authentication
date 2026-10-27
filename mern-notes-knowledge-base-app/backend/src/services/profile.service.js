import profileRepo from '../repositories/profile.repository.js';

class ProfileService {
  async getProfile() {
    return profileRepo.get();
  }

  async updateProfile(data) {
    const allowed = {};
    if (data.displayName !== undefined) {
      if (typeof data.displayName !== 'string' || !data.displayName.trim()) {
        return { error: 'Display name is required.' };
      }
      allowed.displayName = data.displayName.trim().slice(0, 100);
    }
    if (data.bio !== undefined) {
      allowed.bio = (typeof data.bio === 'string' ? data.bio.trim() : '').slice(0, 200);
    }
    if (data.avatarUrl !== undefined) {
      allowed.avatarUrl = typeof data.avatarUrl === 'string' ? data.avatarUrl.trim() : '';
    }

    if (Object.keys(allowed).length === 0) {
      return { error: 'No valid fields to update.' };
    }

    return profileRepo.update(allowed);
  }
}

export default new ProfileService();
