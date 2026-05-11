import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const uploadRoutes = Router();
uploadRoutes.use(authMiddleware);

// Stub — implemented in Phase 3
uploadRoutes.post('/features', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 3' }));
