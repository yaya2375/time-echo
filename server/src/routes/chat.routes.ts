import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import * as chatService from '../services/chat.service.js';

export const chatRoutes = Router();
chatRoutes.use(authMiddleware as any);

// POST /api/chat/sessions — create session
chatRoutes.post('/sessions', async (req: AuthRequest, res) => {
  try {
    const { persona_id, title } = req.body;
    if (!persona_id) {
      res.status(400).json({ success: false, error: '缺少 persona_id' });
      return;
    }
    const session = await chatService.createSession(req.userId!, persona_id, title);
    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('[Chat session create]', err);
    res.status(500).json({ success: false, error: '创建会话失败' });
  }
});

// GET /api/chat/sessions — list sessions
chatRoutes.get('/sessions', async (req: AuthRequest, res) => {
  try {
    const personaId = req.query.persona_id as string | undefined;
    const sessions = await chatService.listSessions(req.userId!, personaId);
    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('[Chat sessions list]', err);
    res.status(500).json({ success: false, error: '获取会话列表失败' });
  }
});

// GET /api/chat/sessions/:id — get session + messages
chatRoutes.get('/sessions/:id', async (req: AuthRequest, res) => {
  try {
    const result = await chatService.getSession(req.params.id, req.userId!);
    if (!result) {
      res.status(404).json({ success: false, error: '会话不存在' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Chat session get]', err);
    res.status(500).json({ success: false, error: '获取会话失败' });
  }
});

// DELETE /api/chat/sessions/:id
chatRoutes.delete('/sessions/:id', async (req: AuthRequest, res) => {
  try {
    const db = await import('../db/index.js').then((m) => m.getDb());
    const session = db.prepare('SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?');
    session.bind([req.params.id, req.userId!] as any);
    if (!session.step()) {
      session.free();
      res.status(404).json({ success: false, error: '会话不存在' });
      return;
    }
    session.free();
    db.run('DELETE FROM chat_sessions WHERE id = ?', [req.params.id]);
    (await import('../db/index.js')).saveDb();
    res.json({ success: true, message: '已删除' });
  } catch (err) {
    console.error('[Chat session delete]', err);
    res.status(500).json({ success: false, error: '删除失败' });
  }
});

// POST /api/chat/sessions/:id/messages — send message (SSE stream)
chatRoutes.post('/sessions/:id/messages', async (req: AuthRequest, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ success: false, error: '消息不能为空' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      for await (const event of chatService.sendMessage(req.params.id, req.userId!, content)) {
        if (event.type === 'token') {
          res.write(`data: ${JSON.stringify({ type: 'token', content: event.token })}\n\n`);
        } else if (event.type === 'done') {
          res.write(`data: ${JSON.stringify({ type: 'done', message_id: event.messageId })}\n\n`);
        } else if (event.type === 'error') {
          res.write(`data: ${JSON.stringify({ type: 'error', error: event.error })}\n\n`);
        }
      }
    } catch (streamErr: any) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: streamErr.message || '流式响应中断' })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[Chat message send]', err);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: '发送失败' });
    }
  }
});
