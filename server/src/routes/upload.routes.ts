import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { getDb, saveDb } from '../db/index.js';
import { nanoid } from 'nanoid';

export const uploadRoutes = Router();
uploadRoutes.use(authMiddleware as any);

// POST /api/upload/features — submit parsed features
uploadRoutes.post('/features', async (req: AuthRequest, res) => {
  try {
    const { feature_vector, persona_id } = req.body;

    if (!feature_vector) {
      res.status(400).json({ success: false, error: '缺少特征向量' });
      return;
    }

    const db = await getDb();
    const id = nanoid();

    db.run(
      `INSERT INTO uploads (id, user_id, persona_id, file_name, file_format, message_count, self_message_count, parse_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [
        id,
        req.userId!,
        persona_id || null,
        'client-upload',
        'feature_vector',
        feature_vector.metadata?.total_messages || 0,
        feature_vector.metadata?.self_messages || 0,
      ]
    );

    // If persona_id provided, update its feature_vector
    if (persona_id) {
      db.run(
        "UPDATE personas SET feature_vector = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
        [JSON.stringify(feature_vector), persona_id, req.userId!]
      );
    }

    saveDb();

    res.json({
      success: true,
      data: { id, message: '特征向量已保存' },
    });
  } catch (err) {
    console.error('[Upload features]', err);
    res.status(500).json({ success: false, error: '上传失败' });
  }
});
