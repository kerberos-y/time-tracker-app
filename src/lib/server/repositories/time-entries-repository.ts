import { getDb } from "@/lib/server/db";
import type { TimeEntryWithProject } from "@/lib/domain/types";

type EntryRow = {
  id: number;
  task_name: string;
  project_id: number;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
  project_name: string;
  project_color: string;
  project_created_at: string;
  project_updated_at: string;
};

function mapEntry(row: EntryRow): TimeEntryWithProject {
  return {
    id: row.id,
    taskName: row.task_name,
    projectId: row.project_id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    project: {
      id: row.project_id,
      name: row.project_name,
      color: row.project_color,
      createdAt: row.project_created_at,
      updatedAt: row.project_updated_at,
    },
  };
}

export const timeEntriesRepository = {
  listTaskNames(): string[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT DISTINCT task_name FROM time_entries ORDER BY task_name ASC")
      .all() as Array<{ task_name: string }>;
    return rows.map((row) => row.task_name);
  },

  listByRange(fromIso: string, toIso: string): TimeEntryWithProject[] {
    const db = getDb();
    const rows = db
      .prepare(
        `
          SELECT
            te.*,
            p.name AS project_name,
            p.color AS project_color,
            p.created_at AS project_created_at,
            p.updated_at AS project_updated_at
          FROM time_entries te
          JOIN projects p ON p.id = te.project_id
          WHERE te.started_at >= ? AND te.started_at <= ?
          ORDER BY te.started_at DESC
        `,
      )
      .all(fromIso, toIso) as EntryRow[];
    return rows.map(mapEntry);
  },

  getActive(): TimeEntryWithProject | null {
    const db = getDb();
    const row = db
      .prepare(
        `
          SELECT
            te.*,
            p.name AS project_name,
            p.color AS project_color,
            p.created_at AS project_created_at,
            p.updated_at AS project_updated_at
          FROM time_entries te
          JOIN projects p ON p.id = te.project_id
          WHERE te.ended_at IS NULL
          ORDER BY te.started_at DESC
          LIMIT 1
        `,
      )
      .get() as EntryRow | undefined;
    return row ? mapEntry(row) : null;
  },

  create(taskName: string, projectId: number): TimeEntryWithProject {
    const db = getDb();
    const now = new Date().toISOString();
    const result = db
      .prepare(
        `
          INSERT INTO time_entries(task_name, project_id, started_at, ended_at, duration_minutes, created_at, updated_at)
          VALUES(?, ?, ?, NULL, 0, ?, ?)
        `,
      )
      .run(taskName, projectId, now, now, now);
    return this.getById(Number(result.lastInsertRowid)) as TimeEntryWithProject;
  },

  stop(id: number): TimeEntryWithProject | null {
    const db = getDb();
    const existing = db
      .prepare("SELECT * FROM time_entries WHERE id = ?")
      .get(id) as { started_at: string; ended_at: string | null } | undefined;
    if (!existing || existing.ended_at) {
      return null;
    }
    const endedAt = new Date().toISOString();
    const durationMinutes = Math.max(
      1,
      Math.round(
        (new Date(endedAt).getTime() - new Date(existing.started_at).getTime()) / 60000,
      ),
    );
    db.prepare(
      "UPDATE time_entries SET ended_at = ?, duration_minutes = ?, updated_at = ? WHERE id = ?",
    ).run(endedAt, durationMinutes, endedAt, id);
    return this.getById(id);
  },

  update(id: number, taskName: string, projectId: number, durationMinutes: number): TimeEntryWithProject | null {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare(
      `
        UPDATE time_entries
        SET task_name = ?, project_id = ?, duration_minutes = ?, updated_at = ?
        WHERE id = ?
      `,
    ).run(taskName, projectId, durationMinutes, now, id);
    return this.getById(id);
  },

  delete(id: number): void {
    const db = getDb();
    db.prepare("DELETE FROM time_entries WHERE id = ?").run(id);
  },

  getById(id: number): TimeEntryWithProject | null {
    const db = getDb();
    const row = db
      .prepare(
        `
          SELECT
            te.*,
            p.name AS project_name,
            p.color AS project_color,
            p.created_at AS project_created_at,
            p.updated_at AS project_updated_at
          FROM time_entries te
          JOIN projects p ON p.id = te.project_id
          WHERE te.id = ?
        `,
      )
      .get(id) as EntryRow | undefined;
    return row ? mapEntry(row) : null;
  },
};
