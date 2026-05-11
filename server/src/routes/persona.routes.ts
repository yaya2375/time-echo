import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const personaRoutes = Router();
personaRoutes.use(authMiddleware as any);

// Stubs — implemented in Phase 3
personaRoutes.get('/', (_req, res) => res.json({ success: true, data: [] }));
personaRoutes.post('/', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 3' }));
personaRoutes.get('/:id', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 3' }));
personaRoutes.patch('/:id', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 3' }));
personaRoutes.delete('/:id', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 3' }));
personaRoutes.post('/:id/generate', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 3' }));
personaRoutes.get('/:id/versions', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 3' }));
personaRoutes.post('/:id/rollback', (_req, res) => res.status(501).json({ success: false, error: 'Coming in Phase 3' }));
