import path from 'node:path';
import { fileURLToPath } from 'node:url';
import FileStore from '../utils/fileStore.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_PATH = path.join(__dirname, '..', '..', 'data', 'profile.json');

const store = new FileStore(PROFILE_PATH);

const DEFAULT_PROFILE = {
  displayName: 'Elena Rostova',
  bio: 'Writer & Researcher',
  avatarUrl: '',
  theme: 'light'
};

class ProfileRepository {
  async get() {
    let profile = await store.read(null);
    if (profile === null) {
      await store.write(DEFAULT_PROFILE);
      return { ...DEFAULT_PROFILE };
    }
    return profile;
  }

  async update(updates) {
    const profile = await this.get();
    const updated = { ...profile, ...updates };
    await store.write(updated);
    return updated;
  }
}

export default new ProfileRepository();
