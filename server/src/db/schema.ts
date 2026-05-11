import { Database } from 'sql.js';

export function initializeDatabase(db: Database): void {
  db.run('PRAGMA foreign_keys = ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS personas (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('past_self', 'other_person')),
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'error')),
      time_period_start TEXT NOT NULL DEFAULT '',
      time_period_end TEXT NOT NULL DEFAULT '',
      layer_0_hard_rules TEXT NOT NULL DEFAULT '{}',
      layer_1_identity TEXT NOT NULL DEFAULT '{}',
      layer_2_speech_style TEXT NOT NULL DEFAULT '{}',
      layer_3_emotional_patterns TEXT NOT NULL DEFAULT '{}',
      layer_4_relationship_behavior TEXT NOT NULL DEFAULT '{}',
      layer_5_values TEXT DEFAULT '{}',
      layer_6_knowledge_boundaries TEXT DEFAULT '{}',
      layer_7_time_anchor TEXT DEFAULT '{}',
      feature_vector TEXT DEFAULT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      parent_version_id TEXT,
      has_corrections INTEGER NOT NULL DEFAULT 0,
      correction_count INTEGER NOT NULL DEFAULT 0,
      generation_prompt_tokens INTEGER NOT NULL DEFAULT 0,
      generation_cost_usd REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run('CREATE INDEX IF NOT EXISTS idx_personas_user ON personas(user_id)');
  db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_personas_slug ON personas(user_id, slug)');

  db.run(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      persona_id TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT '新的对话',
      message_count INTEGER NOT NULL DEFAULT 0,
      total_tokens INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_sessions_user ON chat_sessions(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_sessions_persona ON chat_sessions(persona_id)');

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      token_count INTEGER NOT NULL DEFAULT 0,
      is_correction INTEGER NOT NULL DEFAULT 0,
      correction_of TEXT,
      ai_labeled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)');

  db.run(`
    CREATE TABLE IF NOT EXISTS usage_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      persona_id TEXT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      was_force_ended INTEGER NOT NULL DEFAULT 0,
      warnings_shown INTEGER NOT NULL DEFAULT 0
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_usage_user ON usage_sessions(user_id)');

  db.run(`
    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      persona_id TEXT,
      file_name TEXT NOT NULL,
      file_format TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL DEFAULT 0,
      message_count INTEGER NOT NULL DEFAULT 0,
      self_message_count INTEGER NOT NULL DEFAULT 0,
      parse_status TEXT NOT NULL DEFAULT 'pending',
      parse_error TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS corrections (
      id TEXT PRIMARY KEY,
      persona_id TEXT NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
      session_id TEXT,
      message_id TEXT,
      original_text TEXT NOT NULL,
      correction_text TEXT NOT NULL,
      applied_to_layer TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}
