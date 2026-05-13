import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.js';
import { getDb, saveDb } from '../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { config } from '../config.js';
import type { Database } from 'sql.js';

export const authRoutes = Router();

function queryOne(db: Database, sql: string, params: any[] = []): Record<string, any> | null {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

// POST /api/auth/register
authRoutes.post('/register', async (req, res) => {
  try {
    const { username, password, display_name } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, error: '用户名和密码不能为空' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: '密码至少6位' });
      return;
    }

    const db = await getDb();
    const existing = queryOne(db, 'SELECT id FROM users WHERE username = ?', [username]);
    if (existing) {
      res.status(409).json({ success: false, error: '用户名已存在' });
      return;
    }

    const id = nanoid();
    const password_hash = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (id, username, password_hash, display_name) VALUES (?, ?, ?, ?)',
      [id, username, password_hash, display_name || username]
    );
    saveDb();

    const token = jwt.sign({ sub: id }, config.jwt_secret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id, username, display_name: display_name || username },
      },
    });
  } catch (err) {
    console.error('[Register]', err);
    res.status(500).json({ success: false, error: '注册失败' });
  }
});

// POST /api/auth/login
authRoutes.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, error: '用户名和密码不能为空' });
      return;
    }

    const db = await getDb();
    const user = queryOne(db, 'SELECT id, username, password_hash, display_name FROM users WHERE username = ?', [username]);

    if (!user) {
      res.status(401).json({ success: false, error: '用户名或密码错误' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ success: false, error: '用户名或密码错误' });
      return;
    }

    const token = jwt.sign({ sub: user.id }, config.jwt_secret, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, display_name: user.display_name },
      },
    });
  } catch (err) {
    console.error('[Login]', err);
    res.status(500).json({ success: false, error: '登录失败' });
  }
});

// POST /api/auth/wechat-login — WeChat Mini Program login
authRoutes.post('/wechat-login', async (req, res) => {
  try {
    const { code, nickname, avatar } = req.body;

    if (!code) {
      res.status(400).json({ success: false, error: '缺少登录凭证' });
      return;
    }

    if (!config.wechat_appid || !config.wechat_secret) {
      // Dev mode: use code as a mock openid for local testing
      const db = await getDb();
      const mockOpenid = `wechat_dev_${code}`;
      const existing = queryOne(db, 'SELECT * FROM users WHERE wechat_openid = ?', [mockOpenid]);
      let user;
      if (existing) {
        user = existing;
        if (nickname) {
          db.run('UPDATE users SET display_name = ? WHERE id = ?', [nickname, user.id]);
          saveDb();
        }
      } else {
        const id = nanoid();
        db.run(
          'INSERT INTO users (id, username, display_name, password_hash, wechat_openid) VALUES (?, ?, ?, ?, ?)',
          [id, `wx_${code.slice(0, 12)}`, nickname || `微信用户${code.slice(0, 4)}`, '', mockOpenid]
        );
        saveDb();
        user = { id, username: `wx_${code.slice(0, 12)}`, display_name: nickname || `微信用户${code.slice(0, 4)}` };
      }
      const token = jwt.sign({ sub: user.id }, config.jwt_secret, { expiresIn: '7d' });
      res.json({
        success: true,
        data: { token, isNewUser: !existing, user: { id: user.id, username: user.username, display_name: user.display_name } },
      });
      return;
    }

    // Production: call WeChat API
    const wxRes = await fetch('https://api.weixin.qq.com/sns/jscode2session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appid: config.wechat_appid,
        secret: config.wechat_secret,
        js_code: code,
        grant_type: 'authorization_code',
      }),
    });
    const wxData = await wxRes.json() as any;

    if (wxData.errcode) {
      console.error('[WeChat Login]', wxData);
      res.status(400).json({ success: false, error: `微信登录失败: ${wxData.errmsg || '未知错误'}` });
      return;
    }

    const { openid, session_key, unionid } = wxData;

    // Find or create user by openid
    const db = await getDb();
    const existing = queryOne(db, 'SELECT * FROM users WHERE wechat_openid = ?', [openid]);
    let isNewUser = false;
    let user;

    if (existing) {
      user = existing;
      if (nickname) {
        db.run('UPDATE users SET display_name = ? WHERE id = ?', [nickname, user.id]);
        saveDb();
      }
    } else {
      isNewUser = true;
      const id = nanoid();
      const generatedUsername = `wx_${openid.slice(0, 12)}`;
      db.run(
        'INSERT INTO users (id, username, display_name, password_hash, wechat_openid) VALUES (?, ?, ?, ?, ?)',
        [id, generatedUsername, nickname || `微信用户`, '', openid]
      );
      saveDb();
      user = { id, username: generatedUsername, display_name: nickname || '微信用户' };
    }

    const token = jwt.sign({ sub: user.id }, config.jwt_secret, { expiresIn: '7d' });

    res.json({
      success: true,
      data: {
        token,
        isNewUser,
        user: {
          id: user.id as string,
          username: user.username as string,
          display_name: user.display_name as string,
        },
      },
    });
  } catch (err) {
    console.error('[WeChat Login]', err);
    res.status(500).json({ success: false, error: '微信登录失败' });
  }
});

// GET /api/auth/me
authRoutes.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const db = await getDb();
    const user = queryOne(db, 'SELECT id, username, display_name, created_at FROM users WHERE id = ?', [req.userId!]);

    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('[Me]', err);
    res.status(500).json({ success: false, error: '获取用户信息失败' });
  }
});
