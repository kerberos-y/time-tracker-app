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
    await api.createProject({ name: name.trim(), color });
    setName("");
    await load();
  }

  async function editProject(project: Project) {
    const nextName = window.prompt("Project name", project.name) ?? project.name;
    const nextColor = window.prompt("Color hex", project.color) ?? project.color;
    await api.updateProject(project.id, { name: nextName.trim(), color: nextColor.trim() });
    await load();
  }

  return (
    <AppShell>
      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h1 className="mb-3 text-xl font-semibold">Projects</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Project name"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
          <input value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-24 rounded-md border border-zinc-300 px-2" />
          <button
            type="button"
            onClick={createProject}
            className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white"
          >
            Add project
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between rounded-md border border-zinc-200 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="font-medium">{project.name}</span>
              </div>
              <button
                type="button"
                onClick={() => editProject(project)}
                className="rounded-md bg-zinc-200 px-3 py-1.5 text-sm"
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
