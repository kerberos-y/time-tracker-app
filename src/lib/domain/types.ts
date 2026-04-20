export type Project = {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};

export type TimeEntry = {
  id: number;
  taskName: string;
  projectId: number;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type TimeEntryWithProject = TimeEntry & {
  project: Project;
};

export type ReportPeriod = "day" | "week" | "month";
