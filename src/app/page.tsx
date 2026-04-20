"use client";

import { useEffect, useMemo, useState } from "react";
import type { TimeEntryWithProject } from "@/lib/domain/types";
import { formatMinutes, parseDuration } from "@/lib/client/time";
import { AppShell } from "@/components/layout/app-shell";
import { useTimeTrackerStore } from "@/lib/client/store/time-tracker-store";

function formatClockDuration(startedAt: string, nowMs: number): string {
  const diffMs = Math.max(0, nowMs - new Date(startedAt).getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
}

export default function Home() {
  const {
    entries,
    activeEntry,
    projects,
    taskSuggestions,
    selectedProjectId,
    isLoading,
    isBusy,
    error,
    ensureLoaded,
    setSelectedProjectId,
    startTimer,
    stopTimer,
    updateEntry,
    deleteEntry,
    clearError,
  } = useTimeTrackerStore();

  const [taskName, setTaskName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editProjectId, setEditProjectId] = useState<number | null>(null);
  const [editDuration, setEditDuration] = useState("00:00");
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    ensureLoaded(true).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowMs(Date.now());
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const poll = setInterval(() => {
      ensureLoaded(false).catch(() => {});
    }, 15000);
    return () => clearInterval(poll);
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
    if (!taskName.trim() || !selectedProjectId) {
      return;
    }
    await startTimer(taskName.trim(), selectedProjectId);
    setTaskName("");
  }

  async function onStop() {
    if (!activeEntry) return;
    await stopTimer(activeEntry.id);
  }

  function startEdit(entry: TimeEntryWithProject) {
    setEditingId(entry.id);
    setEditTaskName(entry.taskName);
    setEditProjectId(entry.projectId);
    setEditDuration(formatMinutes(entry.durationMinutes));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTaskName("");
    setEditProjectId(null);
    setEditDuration("00:00");
  }

  async function saveEdit(entryId: number) {
    const parsedDuration = parseDuration(editDuration);
    if (!editTaskName.trim() || !editProjectId || parsedDuration === null) {
      return;
    }
    await updateEntry(entryId, {
      taskName: editTaskName.trim(),
      projectId: editProjectId,
      durationMinutes: parsedDuration,
    });
    cancelEdit();
  }

  async function onDelete(id: number) {
    await deleteEntry(id);
  }

  return (
    <AppShell>
      <section className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-1 text-sm text-zinc-500">Active timer</div>
        {activeEntry ? (
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xl font-semibold text-zinc-900">
                {activeEntry.taskName}
              </div>
              <div className="text-sm text-zinc-500">{activeEntry.project.name}</div>
            </div>
            <div className="rounded-lg bg-zinc-900 px-3 py-2 font-mono text-lg text-white">
              {formatClockDuration(activeEntry.startedAt, nowMs)}
            </div>
          </div>
        ) : (
          <div className="text-lg font-semibold text-zinc-400">No active timer</div>
        )}
      </section>

      <section className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900">Start / Stop</h2>
          <button
            type="button"
            onClick={() => ensureLoaded(true)}
            className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200"
          >
            Refresh
          </button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            placeholder="Task name"
            list="task-suggestions"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
          />
          <datalist id="task-suggestions">
            {taskSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
          <select
            value={selectedProjectId ?? ""}
            onChange={(event) => setSelectedProjectId(Number(event.target.value))}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
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
              className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              disabled={Boolean(activeEntry) || isBusy || !taskName.trim() || !selectedProjectId}
            >
              Start
            </button>
            <button
              type="button"
              onClick={onStop}
              className="rounded-lg bg-rose-600 px-4 py-2 font-medium text-white transition hover:bg-rose-700 disabled:opacity-50"
              disabled={!activeEntry || isBusy}
            >
              Stop
            </button>
          </div>
        </div>
        {error ? (
          <p className="mt-3 flex items-center justify-between text-sm text-rose-600">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="text-zinc-700 underline">
              Dismiss
            </button>
          </p>
        ) : null}
      </section>

      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900">Today entries</h2>
          {isLoading ? <span className="text-xs text-zinc-500">Loading...</span> : null}
        </div>
        <div className="mb-3 grid gap-2 md:grid-cols-2">
          {grouped.map((group) => (
            <div key={group.name} className="rounded-lg border border-zinc-200 p-3">
              <div className="text-sm text-zinc-500">Project</div>
              <div className="flex items-center gap-2 font-medium text-zinc-900">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: group.color }} />
                {group.name}
              </div>
              <div className="text-sm text-zinc-700">Total: {formatMinutes(group.total)}</div>
            </div>
          ))}
        </div>
        {entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            No entries for today yet. Start a timer to create your first record.
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-zinc-200 p-3"
              >
                {editingId === entry.id ? (
                  <div className="grid gap-3 md:grid-cols-[1fr_220px_120px_auto]">
                    <input
                      value={editTaskName}
                      onChange={(event) => setEditTaskName(event.target.value)}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
                    />
                    <select
                      value={editProjectId ?? ""}
                      onChange={(event) => setEditProjectId(Number(event.target.value))}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
                    >
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={editDuration}
                      onChange={(event) => setEditDuration(event.target.value)}
                      placeholder="hh:mm"
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(entry.id)}
                        className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                        disabled={isBusy}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg bg-zinc-200 px-3 py-2 text-sm text-zinc-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-zinc-900">{entry.taskName}</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: entry.project.color }}
                        />
                        <span>{entry.project.name}</span>
                        <span>•</span>
                        <span>{formatMinutes(entry.durationMinutes)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(entry)}
                        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(entry.id)}
                        className="rounded-lg bg-zinc-200 px-3 py-1.5 text-sm text-zinc-800"
                        disabled={isBusy}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}
