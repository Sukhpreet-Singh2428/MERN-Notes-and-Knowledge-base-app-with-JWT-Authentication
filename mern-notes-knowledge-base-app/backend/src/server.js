import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n  🔥 Hearth Notes API running on http://localhost:${PORT}`);
  console.log(`  📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`  📝 Notes API:    http://localhost:${PORT}/api/notes`);
  console.log(`  👤 Profile API:  http://localhost:${PORT}/api/profile\n`);
});
