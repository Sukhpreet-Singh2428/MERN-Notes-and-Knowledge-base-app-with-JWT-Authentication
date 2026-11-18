/**
 * Test setup for Hearth Notes backend.
 *
 * Uses isolated local MongoDB test database (or mongodb-memory-server if local is unavailable).
 * Does NOT connect to production MongoDB Atlas.
 */
import mongoose from 'mongoose';

const TEST_DB_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/hearth_notes_test';

let mongoMemoryServerInstance = null;

/**
 * Connect to isolated test database.
 */
export async function setupTestDB() {
  try {
    // Attempt connecting to local MongoDB server first (instant, no 800MB download)
    await mongoose.connect(TEST_DB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
  } catch (err) {
    // Fallback to mongodb-memory-server if local daemon is not running
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(uri);
  }
}

/**
 * Drop test database collections and close connection.
 */
export async function teardownTestDB() {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.dropDatabase();
    } catch (e) {
      // Ignore if database drop fails
    }
    await mongoose.disconnect();
  }

  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
}

/**
 * Clear all collections between test cases.
 */
export async function clearTestDB() {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}
