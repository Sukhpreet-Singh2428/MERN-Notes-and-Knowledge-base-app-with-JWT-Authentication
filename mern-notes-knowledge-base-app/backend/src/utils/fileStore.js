import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

/**
 * FileStore - Thread-safe JSON file persistence utility.
 * Serializes writes to prevent data corruption from overlapping operations.
 */
class FileStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.writeQueue = Promise.resolve();
  }

  /** Ensure the directory for the file exists */
  async ensureDir() {
    const dir = path.dirname(this.filePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  /** Read and parse the JSON file. Returns defaultValue if file missing/malformed. */
  async read(defaultValue = null) {
    try {
      await this.ensureDir();
      if (!existsSync(this.filePath)) {
        return defaultValue;
      }
      const raw = await readFile(this.filePath, 'utf-8');
      const trimmed = raw.trim();
      if (!trimmed) return defaultValue;
      return JSON.parse(trimmed);
    } catch (err) {
      if (err.code === 'ENOENT') return defaultValue;
      if (err instanceof SyntaxError) {
        console.error(`[FileStore] Malformed JSON in ${this.filePath}:`, err.message);
        return defaultValue;
      }
      throw err;
    }
  }

  /** Serialize a write operation through the queue to prevent lost updates */
  async write(data) {
    this.writeQueue = this.writeQueue.then(async () => {
      await this.ensureDir();
      const json = JSON.stringify(data, null, 2);
      await writeFile(this.filePath, json, 'utf-8');
    });
    return this.writeQueue;
  }
}

export default FileStore;
