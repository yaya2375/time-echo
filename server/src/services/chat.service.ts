import { getDb, saveDb } from '../db/index.js';
import { nanoid } from 'nanoid';
import { streamClaude } from './claude.service.js';
import { buildChatMessages } from '../prompts/composers/chat-prompt.js';
import type { Database } from 'sql.js';
import type { ChatSession, ChatMessage } from '@time-echo/shared';

function queryOne(db: Database, sql: string, params: any[] = []): Record<string, any> | null {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params as any);
  if (stmt.step()) { const row = stmt.getAsObject(); stmt.free(); return row; }
  stmt.free();
  return null;
}

function queryAll(db: Database, sql: string, params: any[] = []): Record<string, any>[] {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params as any);
  const rows: Record<string, any>[] = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export async function createSession(userId: string, personaId: string, title?: string): Promise<ChatSession> {
  const db = await getDb();
  const id = nanoid();

  db.run(
    'INSERT INTO chat_sessions (id, user_id, persona_id, title) VALUES (?, ?, ?, ?)',
    [id, userId, personaId, title || '新的对话']
  );
  saveDb();

  const row = queryOne(db, 'SELECT * FROM chat_sessions WHERE id = ?', [id]);
  return rowToSession(row!);
}

export async function listSessions(userId: string, personaId?: string): Promise<ChatSession[]> {
  const db = await getDb();
  let sql = 'SELECT cs.*, (SELECT content FROM messages WHERE session_id = cs.id ORDER BY created_at DESC LIMIT 1) as last_message_preview FROM chat_sessions cs WHERE cs.user_id = ?';
  const params: string[] = [userId];

  if (personaId) {
    sql += ' AND cs.persona_id = ?';
    params.push(personaId);
  }

  sql += ' ORDER BY cs.updated_at DESC';
  const rows = queryAll(db, sql, params);
  return rows.map(rowToSession);
}

export async function getSession(sessionId: string, userId: string): Promise<{ session: ChatSession; messages: ChatMessage[] } | null> {
  const db = await getDb();
  const row = queryOne(db, 'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
  if (!row) return null;

  const msgRows = queryAll(db,
    'SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 100',
    [sessionId]
  );

  return {
    session: rowToSession(row),
    messages: msgRows.map(rowToMessage),
  };
}

export async function* sendMessage(
  sessionId: string,
  userId: string,
  content: string
): AsyncGenerator<{ type: 'token'; token: string } | { type: 'done'; messageId: string } | { type: 'error'; error: string }> {
  const db = await getDb();

  // Validate session
  const session = queryOne(db, 'SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
  if (!session) {
    yield { type: 'error', error: '会话不存在' };
    return;
  }

  // Validate persona
  const persona = queryOne(db, 'SELECT * FROM personas WHERE id = ?', [session.persona_id as string]);
  if (!persona || persona.status !== 'ready') {
    yield { type: 'error', error: 'Persona 未就绪' };
    return;
  }

  // Save user message
  const userMsgId = nanoid();
  db.run(
    'INSERT INTO messages (id, session_id, role, content, token_count) VALUES (?, ?, ?, ?, ?)',
    [userMsgId, sessionId, 'user', content, content.length]
  );

  // Load chat history
  const historyRows = queryAll(db,
    'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 40',
    [sessionId]
  );

  const history = historyRows.map((r) => ({ role: r.role as string, content: r.content as string }));

  // Parse persona layers
  const parse = (val: any) => { try { return JSON.parse(val || '{}'); } catch { return {}; } };

  // Build chat messages
  const { systemMessage } = buildChatMessages({
    personaName: persona.name as string,
    timePeriod: `${persona.time_period_start} — ${persona.time_period_end}`,
    timePeriodEnd: persona.time_period_end as string,
    layers: {
      identity: parse(persona.layer_1_identity),
      speechStyle: parse(persona.layer_2_speech_style),
      emotional: parse(persona.layer_3_emotional_patterns),
      values: parse(persona.layer_5_values),
      knowledgeBoundaries: parse(persona.layer_6_knowledge_boundaries),
      timeAnchor: parse(persona.layer_7_time_anchor),
    },
    history,
    userMessage: content,
  });

  // Stream AI response
  const claudeMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const h of history) {
    if (h.role === 'user' || h.role === 'assistant') {
      claudeMessages.push({ role: h.role, content: h.content });
    }
  }

  let fullResponse = '';

  try {
    for await (const event of streamClaude(claudeMessages, systemMessage)) {
      if ('done' in event && event.done) {
        // Save assistant message
        const aiMsgId = nanoid();
        db.run(
          'INSERT INTO messages (id, session_id, role, content, token_count, ai_labeled) VALUES (?, ?, ?, ?, ?, 1)',
          [aiMsgId, sessionId, 'assistant', fullResponse, event.tokens.output]
        );

        // Update session stats
        db.run(
          "UPDATE chat_sessions SET message_count = message_count + 2, total_tokens = total_tokens + ?, updated_at = datetime('now') WHERE id = ?",
          [event.tokens.input + event.tokens.output, sessionId]
        );

        saveDb();
        yield { type: 'done', messageId: aiMsgId };
        return;
      } else if ('token' in event) {
        fullResponse += event.token;
        yield { type: 'token', token: event.token };
      }
    }
  } catch (err: any) {
    console.error('[Chat stream]', err);
    yield { type: 'error', error: err.message || 'AI 响应失败' };
  }
}

function rowToSession(row: Record<string, any>): ChatSession {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    persona_id: row.persona_id as string,
    title: row.title as string,
    message_count: row.message_count as number,
    total_tokens: row.total_tokens as number,
    is_active: !!row.is_active,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    last_message_preview: (row as any).last_message_preview as string | undefined,
  };
}

function rowToMessage(row: Record<string, any>): ChatMessage {
  return {
    id: row.id as string,
    session_id: row.session_id as string,
    role: row.role as ChatMessage['role'],
    content: row.content as string,
    token_count: row.token_count as number,
    is_correction: !!row.is_correction,
    correction_of: row.correction_of as string | null,
    ai_labeled: !!row.ai_labeled,
    created_at: row.created_at as string,
  };
}
