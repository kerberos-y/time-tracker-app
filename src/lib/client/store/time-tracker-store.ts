"use client";

import { create } from "zustand";
import { api } from "@/lib/client/api";
import type { Project, TimeEntryWithProject } from "@/lib/domain/types";

const FRESH_MS = 15000;

type TrackerStore = {
  projects: Project[];
  entries: TimeEntryWithProject[];
  activeEntry: TimeEntryWithProject | null;
  taskSuggestions: string[];
  selectedProjectId: number | null;
  isLoading: boolean;
  isBusy: boolean;
  error: string;
  lastLoadedAt: number;
  ensureLoaded: (force?: boolean) => Promise<void>;
  setSelectedProjectId: (projectId: number) => void;
  startTimer: (taskName: string, projectId: number) => Promise<void>;
  stopTimer: (id: number) => Promise<void>;
  updateEntry: (
    id: number,
    payload: { taskName: string; projectId: number; durationMinutes: number },
  ) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;
  createProject: (payload: { name: string; color: string }) => Promise<void>;
  updateProject: (id: number, payload: { name: string; color: string }) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  clearError: () => void;
};

export const useTimeTrackerStore = create<TrackerStore>((set, get) => ({
  projects: [],
  entries: [],
  activeEntry: null,
  taskSuggestions: [],
  selectedProjectId: null,
  isLoading: false,
  isBusy: false,
  error: "",
  lastLoadedAt: 0,

  async ensureLoaded(force = false) {
    const state = get();
    const isFresh = Date.now() - state.lastLoadedAt < FRESH_MS;
    if (!force && (state.isLoading || isFresh)) {
      return;
    }
    set({ isLoading: true });
    try {
      const [entriesData, projectsData] = await Promise.all([
        api.getTodayEntries(),
        api.getProjects(),
      ]);
      const selected =
        state.selectedProjectId && projectsData.some((project) => project.id === state.selectedProjectId)
          ? state.selectedProjectId
          : (projectsData[0]?.id ?? null);
      set({
        entries: entriesData.entries,
        activeEntry: entriesData.activeEntry,
        taskSuggestions: entriesData.taskSuggestions,
        projects: projectsData,
        selectedProjectId: selected,
        error: "",
        lastLoadedAt: Date.now(),
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to load tracker data",
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setSelectedProjectId(projectId: number) {
    set({ selectedProjectId: projectId });
  },

  async startTimer(taskName: string, projectId: number) {
    set({ isBusy: true });
    try {
      await api.startTimer(taskName.trim(), projectId);
      await get().ensureLoaded(true);
      set({ error: "" });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to start timer",
      });
    } finally {
      set({ isBusy: false });
    }
  },

  async stopTimer(id: number) {
    set({ isBusy: true });
    try {
      await api.stopTimer(id);
      await get().ensureLoaded(true);
      set({ error: "" });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to stop timer",
      });
    } finally {
      set({ isBusy: false });
    }
  },

  async updateEntry(id, payload) {
    set({ isBusy: true });
    try {
      await api.updateEntry(id, payload);
      await get().ensureLoaded(true);
      set({ error: "" });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update entry",
      });
    } finally {
      set({ isBusy: false });
    }
  },

  async deleteEntry(id: number) {
    set({ isBusy: true });
    try {
      await api.deleteEntry(id);
      await get().ensureLoaded(true);
      set({ error: "" });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete entry",
      });
    } finally {
      set({ isBusy: false });
    }
  },

  async createProject(payload) {
    set({ isBusy: true });
    try {
      await api.createProject(payload);
      await get().ensureLoaded(true);
      set({ error: "" });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to create project",
      });
    } finally {
      set({ isBusy: false });
    }
  },

  async updateProject(id, payload) {
    set({ isBusy: true });
    try {
      await api.updateProject(id, payload);
      await get().ensureLoaded(true);
      set({ error: "" });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update project",
      });
    } finally {
      set({ isBusy: false });
    }
  },

  async deleteProject(id) {
    set({ isBusy: true });
    try {
      await api.deleteProject(id);
      await get().ensureLoaded(true);
      set({ error: "" });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete project",
      });
    } finally {
      set({ isBusy: false });
    }
  },

  clearError() {
    set({ error: "" });
  },
}));
