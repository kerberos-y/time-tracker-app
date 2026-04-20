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

  async function load() {
    setProjects(await api.getProjects());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load().catch((err: Error) => setError(err.message));
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
    const nextName = window.prompt("Project name", project.name) ?? project.name;
    const nextColor = window.prompt("Color hex", project.color) ?? project.color;
    try {
      setIsBusy(true);
      await api.updateProject(project.id, { name: nextName.trim(), color: nextColor.trim() });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <AppShell>
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="mb-3 text-xl font-semibold">Projects</h1>
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
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
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
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
