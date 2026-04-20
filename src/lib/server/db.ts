import path from "node:path";
import fs from "node:fs";
import BetterSqlite3 from "better-sqlite3";

type DatabaseSyncType = {
  exec: (sql: string) => void;
  prepare: (sql: string) => {
    run: (...args: unknown[]) => { lastInsertRowid?: number };
    all: (...args: unknown[]) => unknown[];
    get: (...args: unknown[]) => unknown;
  };
};

let cachedDb: DatabaseSyncType | null = null;

function getSqliteFromNodeBuiltin(dbPath: string): DatabaseSyncType | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const sqliteModule = require("node:sqlite");
    const db = new sqliteModule.DatabaseSync(dbPath) as DatabaseSyncType;
    return db;
  } catch {
    return null;
  }
}

function getSqliteFromBetterSqlite(dbPath: string): DatabaseSyncType {
  const db = new BetterSqlite3(dbPath);
  return {
    exec: (sql: string) => db.exec(sql),
    prepare: (sql: string) => {
      const stmt = db.prepare(sql);
      return {
        run: (...args: unknown[]) => {
          const result = stmt.run(...args);
          const rawId = result.lastInsertRowid;
          const normalized =
            typeof rawId === "bigint" ? Number(rawId) : (rawId as number);
          return { lastInsertRowid: normalized };
        },
        all: (...args: unknown[]) => stmt.all(...args),
        get: (...args: unknown[]) => stmt.get(...args),
      };
    },
  };
}

function ensureDbPath(): string {
  const dataDir = process.env.VERCEL ? "/tmp/time-tracker-data" : path.join(process.cwd(), "data");
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
    const dbPath = ensureDbPath();
    cachedDb =
      getSqliteFromNodeBuiltin(dbPath) ?? getSqliteFromBetterSqlite(dbPath);
    bootstrapSchema(cachedDb);
  }
  return cachedDb;
}
