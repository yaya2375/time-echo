import initSqlJs, { Database } from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { config } from '../config.js';
import { initializeDatabase } from './schema.js';

let db: Database;

async function createDb(): Promise<Database> {
  const SQL = await initSqlJs();
  const dir = dirname(config.database_path);
  mkdirSync(dir, { recursive: true });

  if (existsSync(config.database_path)) {
    const buffer = readFileSync(config.database_path);
    return new SQL.Database(buffer);
  }
  return new SQL.Database();
}

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await createDb();
    initializeDatabase(db);
  }
  return db;
}

export function saveDb(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(config.database_path, buffer);
  }
}

export async function closeDb(): Promise<void> {
  if (db) {
    saveDb();
    db.close();
  }
}
