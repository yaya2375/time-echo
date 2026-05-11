import { getDb, saveDb } from '../db/index.js';
import { nanoid } from 'nanoid';
import { config } from '../config.js';
import type { Database } from 'sql.js';

function queryOne(db: Database, sql: string, params: any[] = []): Record<string, any> | null {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params as any);
  if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
  stmt.free();
  return null;
}

export async function getTimerStatus(userId: string) {
  const db = await getDb();

  // Get today's total usage
  const today = new Date().toISOString().slice(0, 10);
  const row = queryOne(db,
    `SELECT COALESCE(SUM(duration_seconds), 0) as total_seconds
     FROM usage_sessions
     WHERE user_id = ? AND started_at >= ?`,
    [userId, today]
  );

  const totalSeconds = row ? (row.total_seconds as number) : 0;

  // Get current active session
  const activeSession = queryOne(db,
    "SELECT * FROM usage_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1",
    [userId]
  );

  let continuousMinutes = 0;
  if (activeSession) {
    const startTime = new Date(activeSession.started_at as string).getTime();
    const durationSec = activeSession.duration_seconds as number;
    const elapsedMin = Math.floor((Date.now() - startTime) / 60000);

    // Auto-end stale sessions: started >5 min ago but no heartbeat (duration=0)
    // This handles browser close without cleanup
    if (elapsedMin > 5 && durationSec === 0) {
      db.run(
        "UPDATE usage_sessions SET ended_at = datetime('now'), was_force_ended = 0 WHERE id = ?",
        [activeSession.id]
      );
      saveDb();
      continuousMinutes = 0;
    } else {
      continuousMinutes = elapsedMin;
    }
  }

  // Check cooldown
  const lastEnded = queryOne(db,
    "SELECT ended_at FROM usage_sessions WHERE user_id = ? AND ended_at IS NOT NULL AND was_force_ended = 1 ORDER BY ended_at DESC LIMIT 1",
    [userId]
  );

  let cooldownUntil: string | null = null;
  if (lastEnded) {
    const endedAt = new Date(lastEnded.ended_at as string);
    const cooldownEnd = new Date(endedAt.getTime() + config.cooldown_hours * 3600000);
    if (cooldownEnd > new Date()) {
      cooldownUntil = cooldownEnd.toISOString();
    }
  }

  return {
    is_limited: !!cooldownUntil || continuousMinutes >= config.usage_limit_minutes,
    total_seconds_today: totalSeconds,
    continuous_minutes: continuousMinutes,
    cooldown_until: cooldownUntil,
    limit_minutes: config.usage_limit_minutes,
  };
}

export async function startTimer(userId: string) {
  const db = await getDb();
  const id = nanoid();

  // End any existing active session
  db.run(
    "UPDATE usage_sessions SET ended_at = datetime('now') WHERE user_id = ? AND ended_at IS NULL",
    [userId]
  );

  db.run(
    'INSERT INTO usage_sessions (id, user_id, started_at) VALUES (?, ?, datetime(\'now\'))',
    [id, userId]
  );
  saveDb();
  return { id };
}

export async function heartbeatTimer(userId: string, durationSeconds: number) {
  const db = await getDb();

  const activeSession = queryOne(db,
    "SELECT id, started_at FROM usage_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1",
    [userId]
  );

  if (!activeSession) {
    // Auto-start a new session
    return startTimer(userId);
  }

  db.run(
    'UPDATE usage_sessions SET duration_seconds = duration_seconds + ? WHERE id = ?',
    [durationSeconds, activeSession.id]
  );
  saveDb();

  const status = await getTimerStatus(userId);
  return status;
}

export async function endTimer(userId: string) {
  const db = await getDb();

  const status = await getTimerStatus(userId);
  const forceEnd = status.continuous_minutes >= config.usage_limit_minutes;

  db.run(
    `UPDATE usage_sessions SET ended_at = datetime('now'), was_force_ended = ? WHERE user_id = ? AND ended_at IS NULL`,
    [forceEnd ? 1 : 0, userId]
  );
  saveDb();

  return { was_force_ended: forceEnd };
}
