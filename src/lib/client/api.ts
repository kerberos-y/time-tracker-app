import type { Project, ReportPeriod, TimeEntryWithProject } from "@/lib/domain/types";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return (await res.json()) as T;
}

export const api = {
  getTodayEntries() {
    return req<{ entries: TimeEntryWithProject[]; activeEntry: TimeEntryWithProject | null; taskSuggestions: string[] }>(
      "/api/time-entries?period=day",
    );
  },
  startTimer(taskName: string, projectId: number) {
    return req<TimeEntryWithProject>("/api/time-entries", {
      method: "POST",
      body: JSON.stringify({ taskName, projectId }),
    });
  },
  stopTimer(id: number) {
    return req<TimeEntryWithProject>(`/api/time-entries/${id}/stop`, { method: "POST" });
  },
  updateEntry(id: number, payload: { taskName: string; projectId: number; durationMinutes: number }) {
    return req<TimeEntryWithProject>(`/api/time-entries/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
  deleteEntry(id: number) {
    return req<{ success: true }>(`/api/time-entries/${id}`, { method: "DELETE" });
  },
  getProjects() {
    return req<Project[]>("/api/projects");
  },
  createProject(payload: { name: string; color: string }) {
    return req<Project>("/api/projects", { method: "POST", body: JSON.stringify(payload) });
  },
  updateProject(id: number, payload: { name: string; color: string }) {
    return req<Project>(`/api/projects/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
  },
  deleteProject(id: number) {
    return req<{ success: true }>(`/api/projects/${id}`, { method: "DELETE" });
  },
  getReport(period: ReportPeriod) {
    return req<{
      entries: TimeEntryWithProject[];
      totals: Array<{ projectName: string; minutes: number }>;
      range: { from: string; to: string };
    }>(`/api/reports?period=${period}`);
  },
};
