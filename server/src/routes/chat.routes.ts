import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const chatRoutes = Router();
chatRoutes.use(authMiddleware);

// Stubs — implemented in Phase 4
chatRoutes.post('/sessions', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 4' }));
chatRoutes.get('/sessions', (_req, res) => res.json({ success: true, data: [] }));
chatRoutes.get('/sessions/:id', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 4' }));
chatRoutes.delete('/sessions/:id', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 4' }));
chatRoutes.post('/sessions/:id/messages', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 4' }));
