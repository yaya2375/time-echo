import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import * as personaService from '../services/persona.service.js';

export const personaRoutes = Router();
personaRoutes.use(authMiddleware as any);

// GET /api/personas — list user's personas
personaRoutes.get('/', async (req: AuthRequest, res) => {
  try {
    const personas = await personaService.listPersonas(req.userId!);
    res.json({ success: true, data: personas });
  } catch (err) {
    console.error('[Personas list]', err);
    res.status(500).json({ success: false, error: '获取列表失败' });
  }
});

// POST /api/personas — create persona
personaRoutes.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, type, time_period_start, time_period_end } = req.body;
    if (!name) {
      res.status(400).json({ success: false, error: '名称不能为空' });
      return;
    }
    const persona = await personaService.createPersona(req.userId!, {
      name, type: type || 'past_self',
      time_period_start: time_period_start || '',
      time_period_end: time_period_end || '',
    });
    res.status(201).json({ success: true, data: persona });
  } catch (err) {
    console.error('[Persona create]', err);
    res.status(500).json({ success: false, error: '创建失败' });
  }
});

// GET /api/personas/:id — get persona detail
personaRoutes.get('/:id', async (req: AuthRequest, res) => {
  try {
    const persona = await personaService.getPersonaByIdAsync(req.params.id);
    if (!persona || persona.user_id !== req.userId) {
      res.status(404).json({ success: false, error: '分身不存在' });
      return;
    }
    res.json({ success: true, data: persona });
  } catch (err) {
    console.error('[Persona get]', err);
    res.status(500).json({ success: false, error: '获取失败' });
  }
});

// PATCH /api/personas/:id — update layer
personaRoutes.patch('/:id', async (req: AuthRequest, res) => {
  try {
    const { layer, content } = req.body;
    const ok = await personaService.updatePersonaLayer(req.params.id, req.userId!, layer, content);
    if (!ok) {
      res.status(404).json({ success: false, error: '分身不存在' });
      return;
    }
    res.json({ success: true, message: '更新成功' });
  } catch (err) {
    console.error('[Persona update]', err);
    res.status(500).json({ success: false, error: '更新失败' });
  }
});

// DELETE /api/personas/:id
personaRoutes.delete('/:id', async (req: AuthRequest, res) => {
  try {
    await personaService.deletePersona(req.params.id, req.userId!);
    res.json({ success: true, message: '已删除' });
  } catch (err) {
    console.error('[Persona delete]', err);
    res.status(500).json({ success: false, error: '删除失败' });
  }
});

// POST /api/personas/:id/generate — trigger AI generation
personaRoutes.post('/:id/generate', async (req: AuthRequest, res) => {
  try {
    const { feature_vector, questionnaire } = req.body;
    if (!feature_vector) {
      res.status(400).json({ success: false, error: '缺少特征向量' });
      return;
    }
    const persona = await personaService.generatePersona(req.params.id, req.userId!, {
      feature_vector,
      questionnaire: questionnaire || {},
    });
    if (!persona) {
      res.status(500).json({ success: false, error: '生成失败，请重试' });
      return;
    }
    res.json({ success: true, data: persona });
  } catch (err) {
    console.error('[Persona generate]', err);
    res.status(500).json({ success: false, error: '生成失败' });
  }
});

// GET /api/personas/:id/versions — version history (stub)
personaRoutes.get('/:id/versions', async (_req: AuthRequest, res) => {
  res.json({ success: true, data: [] });
});

// POST /api/personas/:id/rollback — rollback to version (stub)
personaRoutes.post('/:id/rollback', async (_req: AuthRequest, res) => {
  res.status(501).json({ success: false, error: 'Coming soon' });
});
