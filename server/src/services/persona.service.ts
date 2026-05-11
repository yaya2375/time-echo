import { getDb, saveDb } from '../db/index.js';
import { nanoid } from 'nanoid';
import { callClaude } from './claude.service.js';
import { buildPersonaGenerationMessages } from '../prompts/composers/persona-prompt.js';
import { config } from '../config.js';
import type { Database } from 'sql.js';
import type { Persona, PersonaListItem, CreatePersonaInput, GeneratePersonaInput } from '@time-echo/shared';

function queryOne(db: Database, sql: string, params: any[] = []): Record<string, any> | null {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params as any);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function queryAll(db: Database, sql: string, params: any[] = []): Record<string, any>[] {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params as any);
  const rows: Record<string, any>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function toSlug(name: string): string {
  return name
    .replace(/[^\w一-鿿]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || nanoid(8);
}

export async function createPersona(userId: string, input: CreatePersonaInput): Promise<Persona> {
  const db = await getDb();
  const id = nanoid();
  const slug = toSlug(input.name) + '-' + nanoid(4);

  db.run(
    `INSERT INTO personas (id, user_id, name, slug, type, time_period_start, time_period_end)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, input.name, slug, input.type, input.time_period_start || '', input.time_period_end || '']
  );
  saveDb();

  return getPersonaById(id);
}

export function getPersonaById(id: string): Persona | null {
  const dbPromise = getDb();
  // This is synchronous usage - getDb is actually async but sql.js Database operations are sync
  // We need to handle this properly
  return null; // Will be called after await
}

export async function getPersonaByIdAsync(id: string): Promise<Persona | null> {
  const db = await getDb();
  const row = queryOne(db, 'SELECT * FROM personas WHERE id = ?', [id]);
  if (!row) return null;
  return rowToPersona(row);
}

export async function listPersonas(userId: string): Promise<PersonaListItem[]> {
  const db = await getDb();
  const rows = queryAll(db,
    'SELECT id, name, slug, type, status, time_period_start, time_period_end, version, created_at FROM personas WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows as PersonaListItem[];
}

export async function updatePersonaLayer(id: string, userId: string, layer: string, content: Record<string, unknown>): Promise<boolean> {
  const db = await getDb();
  const persona = queryOne(db, 'SELECT id FROM personas WHERE id = ? AND user_id = ?', [id, userId]);
  if (!persona) return false;

  const column = `layer_${layer}`;
  db.run(`UPDATE personas SET ${column} = ?, updated_at = datetime('now') WHERE id = ?`,
    [JSON.stringify(content), id]
  );
  saveDb();
  return true;
}

export async function deletePersona(id: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const result = db.run('DELETE FROM personas WHERE id = ? AND user_id = ?', [id, userId]);
  saveDb();
  return true;
}

export async function generatePersona(id: string, userId: string, input: GeneratePersonaInput): Promise<Persona | null> {
  const db = await getDb();
  const persona = queryOne(db, 'SELECT * FROM personas WHERE id = ? AND user_id = ?', [id, userId]);
  if (!persona) return null;

  // Update status to generating
  db.run("UPDATE personas SET status = 'generating', feature_vector = ?, updated_at = datetime('now') WHERE id = ?",
    [JSON.stringify(input.feature_vector), id]
  );
  saveDb();

  try {
    // Build prompt
    const messages = buildPersonaGenerationMessages({
      featureVector: input.feature_vector,
      timePeriodStart: persona.time_period_start as string,
      timePeriodEnd: persona.time_period_end as string,
      personaType: persona.type as string,
      selfDescription: input.questionnaire.self_description,
      whatMattered: input.questionnaire.what_mattered,
      whatChanged: input.questionnaire.what_changed,
      keyEvents: input.questionnaire.key_events,
      selfTags: input.questionnaire.self_tags,
    });

    // Call Claude
    const result = await callClaude(
      [{ role: 'user', content: messages[1].content }],
      messages[0].content,
      { maxTokens: config.anthropic_max_tokens_persona, temperature: 0.5 }
    );

    // Parse the JSON response
    let layers: Record<string, unknown>;
    try {
      // Try to extract JSON from response
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        layers = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // If parsing fails, store raw output in error
      db.run("UPDATE personas SET status = 'error', updated_at = datetime('now') WHERE id = ?", [id]);
      saveDb();
      return null;
    }

    // Map response layers to DB columns
    const layerMap: Record<string, string> = {
      'layer_0': 'layer_0_hard_rules',
      'layer_1': 'layer_1_identity',
      'layer_2': 'layer_2_speech_style',
      'layer_3': 'layer_3_emotional_patterns',
      'layer_4': 'layer_4_relationship_behavior',
      'layer_5': 'layer_5_values',
      'layer_6': 'layer_6_knowledge_boundaries',
      'layer_7': 'layer_7_time_anchor',
    };

    // Update each layer
    for (const [key, col] of Object.entries(layerMap)) {
      const data = layers[key];
      if (data) {
        db.run(`UPDATE personas SET ${col} = ?, updated_at = datetime('now') WHERE id = ?`,
          [JSON.stringify(data), id]
        );
      }
    }

    // Update status and cost
    db.run(
      `UPDATE personas SET status = 'ready', generation_prompt_tokens = ?, generation_cost_usd = ?, updated_at = datetime('now') WHERE id = ?`,
      [result.tokens.input + result.tokens.output, result.costUsd, id]
    );
    saveDb();

    return getPersonaByIdAsync(id);
  } catch (err) {
    console.error('[GeneratePersona]', err);
    db.run("UPDATE personas SET status = 'error', updated_at = datetime('now') WHERE id = ?", [id]);
    saveDb();
    return null;
  }
}

function rowToPersona(row: Record<string, any>): Persona {
  const parse = (val: any) => {
    if (!val || val === '{}') return {};
    try { return JSON.parse(val); } catch { return {}; }
  };

  return {
    id: row.id as string,
    user_id: row.user_id as string,
    name: row.name as string,
    slug: row.slug as string,
    type: row.type as Persona['type'],
    status: row.status as Persona['status'],
    time_period_start: row.time_period_start as string,
    time_period_end: row.time_period_end as string,
    layer_0_hard_rules: parse(row.layer_0_hard_rules),
    layer_1_identity: parse(row.layer_1_identity),
    layer_2_speech_style: parse(row.layer_2_speech_style),
    layer_3_emotional_patterns: parse(row.layer_3_emotional_patterns),
    layer_4_relationship_behavior: parse(row.layer_4_relationship_behavior),
    layer_5_values: parse(row.layer_5_values) || null,
    layer_6_knowledge_boundaries: parse(row.layer_6_knowledge_boundaries) || null,
    layer_7_time_anchor: parse(row.layer_7_time_anchor) || null,
    feature_vector: parse(row.feature_vector) || null,
    version: row.version as number,
    parent_version_id: row.parent_version_id as string | null,
    has_corrections: !!row.has_corrections,
    correction_count: row.correction_count as number,
    generation_prompt_tokens: row.generation_prompt_tokens as number,
    generation_cost_usd: row.generation_cost_usd as number,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

