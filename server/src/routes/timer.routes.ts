import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export const timerRoutes = Router();
timerRoutes.use(authMiddleware);

// Stubs — implemented in Phase 5
timerRoutes.get('/status', (_req, res) => res.json({
  success: true,
  data: { is_limited: false, total_seconds_today: 0, continuous_minutes: 0, cooldown_until: null, limit_minutes: 120 }
}));
timerRoutes.post('/heartbeat', (_req, res) => res.json({ success: true }));
