"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import type { Project } from "@/lib/domain/types";
import { useTimeTrackerStore } from "@/lib/client/store/time-tracker-store";

export default function ProjectsPage() {
  const {
    projects,
    isBusy,
    isLoading,
    error,
    ensureLoaded,
    createProject: createProjectAction,
    updateProject,
    deleteProject,
    clearError,
  } = useTimeTrackerStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#3b82f6");

  useEffect(() => {
    ensureLoaded(false).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreateProject() {
    if (!name.trim()) {
      return;
    }
    await createProjectAction({ name: name.trim(), color });
    setName("");
  }

  async function editProject(project: Project) {
    setEditingId(project.id);
    setEditName(project.name);
    setEditColor(project.color);
  }

  async function saveEdit(projectId: number) {
    if (!editName.trim()) {
      return;
    }
    await updateProject(projectId, {
      name: editName.trim(),
      color: editColor.trim(),
    });
    setEditingId(null);
  }

  async function onDeleteProject(projectId: number) {
    if (window.confirm("Are you sure you want to delete this project and all its entries?")) {
      await deleteProject(projectId);
    }
  }

  return (
    <AppShell>
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Projects</h1>
          <button
            type="button"
            onClick={() => ensureLoaded(true)}
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
            onClick={onCreateProject}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50"
            disabled={isBusy}
          >
            Add project
          </button>
        </div>
        {error ? (
          <p className="mt-2 flex items-center justify-between text-sm text-rose-600">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="text-zinc-700 underline">
              Dismiss
            </button>
          </p>
        ) : null}
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
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editProject(project)}
                      className="rounded-lg bg-zinc-200 px-3 py-1.5 text-sm text-zinc-800 disabled:opacity-50"
                      disabled={isBusy}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      className="rounded-lg bg-rose-200 px-3 py-1.5 text-sm text-rose-800 disabled:opacity-50"
                      disabled={isBusy}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
