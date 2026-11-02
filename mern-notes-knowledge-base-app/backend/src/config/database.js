import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas using Mongoose.
 *
 * Reads the connection string from process.env.MONGO_URI.
 * Registers lifecycle event listeners for connection monitoring.
 * Throws if MONGO_URI is not configured so the server never starts
 * in an invalid state.
 *
 * @returns {Promise<typeof mongoose>} The Mongoose instance once connected.
 */
export async function connectDatabase() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      'MONGO_URI is not defined. ' +
      'Please set MONGO_URI in your .env file. ' +
      'Example: MONGO_URI=mongodb+srv://<user>:<password>@cluster0.gnf3nnr.mongodb.net/hearth_notes?retryWrites=true&w=majority'
    );
  }

  // ── Mongoose connection event listeners ────────────────────────────
  mongoose.connection.on('connected', () => {
    console.log('  ✅ MongoDB connected successfully.');
  });

  mongoose.connection.on('error', (err) => {
    console.error('  ❌ MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('  ⚠️  MongoDB disconnected.');
  });

  // ── Attempt connection ─────────────────────────────────────────────
  try {
    await mongoose.connect(uri);
    return mongoose;
  } catch (err) {
    console.error('  ❌ Failed to connect to MongoDB Atlas:', err.message);
    throw err;
  }
}

/**
 * Gracefully close the Mongoose connection.
 * Call this during application shutdown.
 */
export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('  🔌 MongoDB connection closed gracefully.');
  } catch (err) {
    console.error('  ❌ Error closing MongoDB connection:', err.message);
  }
}
