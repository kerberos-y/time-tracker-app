import path from "node:path";
import fs from "node:fs";

type DatabaseSyncType = {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    run: (...args: unknown[]) => { lastInsertRowid?: number };
    all: (...args: unknown[]) => unknown[];
    get: (...args: unknown[]) => unknown;
  };
};

let cachedDb: DatabaseSyncType | null = null;

function getSqliteConstructor(): new (dbPath: string) => DatabaseSyncType {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqliteModule = require("node:sqlite");
  return sqliteModule.DatabaseSync;
}

function ensureDbPath(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "time-tracker.db");
}

function bootstrapSchema(db: DatabaseSyncType): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_name TEXT NOT NULL,
      project_id INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      ended_at TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  const countResult = db.prepare("SELECT COUNT(*) as count FROM projects").get() as {
    count: number;
  };

  if (countResult.count === 0) {
    const now = new Date().toISOString();
    const stmt = db.prepare(
      "INSERT INTO projects(name, color, created_at, updated_at) VALUES(?, ?, ?, ?)",
    );
    stmt.run("Internal", "#0ea5e9", now, now);
    stmt.run("Client A", "#10b981", now, now);
  }
}

export function getDb(): DatabaseSyncType {
  if (!cachedDb) {
    const DatabaseSync = getSqliteConstructor();
    cachedDb = new DatabaseSync(ensureDbPath());
    bootstrapSchema(cachedDb);
  }
  return cachedDb;
}
