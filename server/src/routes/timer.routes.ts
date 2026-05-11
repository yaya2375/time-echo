import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import * as timerService from '../services/timer.service.js';

export const timerRoutes = Router();
timerRoutes.use(authMiddleware as any);

// GET /api/timer/status
timerRoutes.get('/status', async (req: AuthRequest, res) => {
  try {
    const status = await timerService.getTimerStatus(req.userId!);
    res.json({ success: true, data: status });
  } catch (err) {
    console.error('[Timer status]', err);
    res.status(500).json({ success: false, error: '获取状态失败' });
  }
});

// POST /api/timer/start — start a usage session
timerRoutes.post('/start', async (req: AuthRequest, res) => {
  try {
    const result = await timerService.startTimer(req.userId!);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Timer start]', err);
    res.status(500).json({ success: false, error: '启动计时失败' });
  }
});

// POST /api/timer/heartbeat — report usage tick
timerRoutes.post('/heartbeat', async (req: AuthRequest, res) => {
  try {
    const { duration_seconds } = req.body;
    const status = await timerService.heartbeatTimer(req.userId!, duration_seconds || 30);
    res.json({ success: true, data: status });
  } catch (err) {
    console.error('[Timer heartbeat]', err);
    res.status(500).json({ success: false, error: '心跳上报失败' });
  }
});

// POST /api/timer/end — end usage session
timerRoutes.post('/end', async (req: AuthRequest, res) => {
  try {
    const result = await timerService.endTimer(req.userId!);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Timer end]', err);
    res.status(500).json({ success: false, error: '结束计时失败' });
  }
});
