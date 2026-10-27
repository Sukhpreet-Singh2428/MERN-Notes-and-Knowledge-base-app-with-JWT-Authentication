import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import notesRoutes from './routes/notes.routes.js';
import profileRoutes from './routes/profile.routes.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Allowed origins for CORS (supports port 3000, 5173, and any local host/port)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, postman, direct browser hits)
      if (!origin) return callback(null, true);
      // Allow any localhost or 127.0.0.1 port in development
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Root endpoint — friendly welcome and sitemap
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🔥 Hearth Notes API is running.',
    version: '1.0.0 (CE1)',
    frontendUrl: 'http://localhost:3000',
    endpoints: {
      health: '/api/health',
      notes: '/api/notes',
      profile: '/api/profile',
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      message: 'Hearth Notes API is running.',
      timestamp: new Date().toISOString(),
    },
  });
});

// Routes
app.use('/api/notes', notesRoutes);
app.use('/api/profile', profileRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
