import { getDb } from "@/lib/server/db";
import type { Project } from "@/lib/domain/types";

type ProjectRow = {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
};

function mapProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const projectsRepository = {
  list(): Project[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM projects ORDER BY name ASC")
      .all() as ProjectRow[];
    return rows.map(mapProject);
  },

  create(name: string, color: string): Project {
    const db = getDb();
    const now = new Date().toISOString();
    const result = db
      .prepare(
        "INSERT INTO projects(name, color, created_at, updated_at) VALUES(?, ?, ?, ?)",
      )
      .run(name, color, now, now);
    const row = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(result.lastInsertRowid) as ProjectRow;
    return mapProject(row);
  },

  update(id: number, name: string, color: string): Project | null {
    const db = getDb();
    const now = new Date().toISOString();
    db.prepare("UPDATE projects SET name = ?, color = ?, updated_at = ? WHERE id = ?").run(
      name,
      color,
      now,
      id,
    );
    const row = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as
      | ProjectRow
      | undefined;
    return row ? mapProject(row) : null;
  },

  delete(id: number): boolean {
    const db = getDb();
    db.prepare("DELETE FROM time_entries WHERE project_id = ?").run(id);
    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return true;
  },
};
