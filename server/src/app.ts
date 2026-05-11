import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { authRoutes } from './routes/auth.routes.js';
import { personaRoutes } from './routes/persona.routes.js';
import { uploadRoutes } from './routes/upload.routes.js';
import { chatRoutes } from './routes/chat.routes.js';
import { timerRoutes } from './routes/timer.routes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/personas', personaRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/timer', timerRoutes);

  // Error handler
  app.use(errorHandler);

  return app;
}
