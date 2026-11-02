import 'dotenv/config';
import app from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';

const PORT = process.env.PORT || 5000;

/**
 * Start the application:
 *  1. Connect to MongoDB Atlas
 *  2. Start Express server only after a successful connection
 *  3. Exit with a meaningful error if the connection fails
 */
async function startServer() {
  try {
    // ── Step 1: Database connection ────────────────────────────────
    await connectDatabase();

    // ── Step 2: Start Express server ───────────────────────────────
    const server = app.listen(PORT, () => {
      console.log(`\n  🔥 Hearth Notes API running on http://localhost:${PORT}`);
      console.log(`  📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`  📝 Notes API:    http://localhost:${PORT}/api/notes`);
      console.log(`  👤 Profile API:  http://localhost:${PORT}/api/profile\n`);
    });

    // ── Graceful shutdown ──────────────────────────────────────────
    const shutdown = async (signal) => {
      console.log(`\n  ⏳ Received ${signal}. Shutting down gracefully…`);
      server.close(async () => {
        await disconnectDatabase();
        console.log('  👋 Hearth Notes API shut down complete.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('\n  ❌ Failed to start Hearth Notes API:', err.message);
    process.exit(1);
  }
}

startServer();
