"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/lib/domain/types";
import { api } from "@/lib/client/api";
import { AppShell } from "@/components/layout/app-shell";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#3b82f6");
  const [isLoading, setIsLoading] = useState(true);

  async function load() {
    const items = await api.getProjects();
    setProjects(items);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  async function createProject() {
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    try {
      setIsBusy(true);
      await api.createProject({ name: name.trim(), color });
      setName("");
      await load();
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsBusy(false);
    }
  }

  async function editProject(project: Project) {
    setEditingId(project.id);
    setEditName(project.name);
    setEditColor(project.color);
  }

  async function saveEdit(projectId: number) {
    if (!editName.trim()) {
      setError("Project name is required");
      return;
    }
    try {
      setIsBusy(true);
      await api.updateProject(projectId, { name: editName.trim(), color: editColor.trim() });
      await load();
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AppShell>
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Projects</h1>
          <button
            type="button"
            onClick={() => load()}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200"
          >
            Refresh
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Project name"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
          />
          <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-14 rounded-lg border border-zinc-300 p-1" />
          <button
            type="button"
            onClick={createProject}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50"
            disabled={isBusy}
          >
            Add project
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        {isLoading ? <p className="text-sm text-zinc-500">Loading projects...</p> : null}
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-3"
            >
              {editingId === project.id ? (
                <div className="grid w-full gap-2 md:grid-cols-[1fr_80px_auto]">
                  <input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
                  />
                  <input
                    type="color"
                    value={editColor}
                    onChange={(event) => setEditColor(event.target.value)}
                    className="h-10 w-full rounded-lg border border-zinc-300 p-1"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(project.id)}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                      disabled={isBusy}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-zinc-200 px-3 py-1.5 text-sm text-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="font-medium">{project.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => editProject(project)}
                    className="rounded-lg bg-zinc-200 px-3 py-1.5 text-sm text-zinc-800 disabled:opacity-50"
                    disabled={isBusy}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
