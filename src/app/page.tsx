"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project, TimeEntryWithProject } from "@/lib/domain/types";
import { api } from "@/lib/client/api";
import { formatMinutes, parseDuration } from "@/lib/client/time";
import { AppShell } from "@/components/layout/app-shell";

export default function Home() {
  const [entries, setEntries] = useState<TimeEntryWithProject[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntryWithProject | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [taskSuggestions, setTaskSuggestions] = useState<string[]>([]);
  const [taskName, setTaskName] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  async function loadData() {
    const [entriesData, projectsData] = await Promise.all([api.getTodayEntries(), api.getProjects()]);
    setEntries(entriesData.entries);
    setActiveEntry(entriesData.activeEntry);
    setTaskSuggestions(entriesData.taskSuggestions);
    setProjects(projectsData);
    if (!projectId && projectsData.length > 0) {
      setProjectId(projectsData[0].id);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().catch((err: Error) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, { color: string; total: number }>();
    for (const entry of entries) {
      const existing = map.get(entry.project.name) ?? { color: entry.project.color, total: 0 };
      existing.total += entry.durationMinutes;
      map.set(entry.project.name, existing);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, ...value }));
  }, [entries]);

  async function onStart() {
    if (!taskName.trim() || !projectId) {
      setError("Task and project are required");
      return;
    }
    setError("");
    await api.startTimer(taskName.trim(), projectId);
    await loadData();
  }

  async function onStop() {
    if (!activeEntry) return;
    await api.stopTimer(activeEntry.id);
    await loadData();
  }

  async function onUpdate(entry: TimeEntryWithProject) {
    const nextTask = window.prompt("Task name", entry.taskName) ?? entry.taskName;
    const nextDuration = window.prompt("Duration (hh:mm)", formatMinutes(entry.durationMinutes)) ?? formatMinutes(entry.durationMinutes);
    const nextProject = window.prompt(
      `Project ID (${projects.map((project) => `${project.id}:${project.name}`).join(", ")})`,
      String(entry.projectId),
    );
    const parsedDuration = parseDuration(nextDuration);
    if (!nextProject || !parsedDuration) {
      setError("Invalid project or duration format");
      return;
    }
    await api.updateEntry(entry.id, {
      taskName: nextTask.trim(),
      projectId: Number(nextProject),
      durationMinutes: parsedDuration,
    });
    await loadData();
  }

  async function onDelete(id: number) {
    await api.deleteEntry(id);
    await loadData();
  }

  return (
    <AppShell>
      <section className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="mb-2 text-sm text-zinc-500">Active timer</div>
        <div className="text-lg font-semibold">
          {activeEntry
            ? `${activeEntry.taskName} • ${activeEntry.project.name}`
            : "No active timer"}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Start / Stop</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            placeholder="Task name"
            list="task-suggestions"
            className="rounded-md border border-zinc-300 px-3 py-2"
          />
          <datalist id="task-suggestions">
            {taskSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <select
            value={projectId ?? ""}
            onChange={(event) => setProjectId(Number(event.target.value))}
            className="rounded-md border border-zinc-300 px-3 py-2"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onStart}
              className="rounded-md bg-emerald-600 px-4 py-2 font-medium text-white disabled:opacity-50"
              disabled={Boolean(activeEntry)}
            >
              Start
            </button>
            <button
              type="button"
              onClick={onStop}
              className="rounded-md bg-rose-600 px-4 py-2 font-medium text-white disabled:opacity-50"
              disabled={!activeEntry}
            >
              Stop
            </button>
          </div>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Today entries</h2>
        <div className="mb-3 grid gap-2 md:grid-cols-2">
          {grouped.map((group) => (
            <div key={group.name} className="rounded-md border border-zinc-200 p-3">
              <div className="text-sm text-zinc-500">Project</div>
              <div className="flex items-center gap-2 font-medium">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: group.color }} />
                {group.name}
              </div>
              <div className="text-sm">Total: {formatMinutes(group.total)}</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-200 p-3"
            >
              <div>
                <div className="font-medium">{entry.taskName}</div>
                <div className="text-sm text-zinc-500">
                  {entry.project.name} • {formatMinutes(entry.durationMinutes)}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate(entry)}
                  className="rounded-md bg-zinc-800 px-3 py-1.5 text-sm text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="rounded-md bg-zinc-200 px-3 py-1.5 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
