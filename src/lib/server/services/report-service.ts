import type { ReportPeriod } from "@/lib/domain/types";
import { timeEntriesRepository } from "@/lib/server/repositories/time-entries-repository";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfWeekMonday(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeekMonday(date: Date): Date {
  const start = startOfWeekMonday(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getDateRangeForPeriod(period: ReportPeriod): { from: Date; to: Date } {
  const now = new Date();
  if (period === "week") {
    return { from: startOfWeekMonday(now), to: endOfWeekMonday(now) };
  }
  if (period === "month") {
    return { from: startOfMonth(now), to: endOfMonth(now) };
  }
  return { from: startOfDay(now), to: endOfDay(now) };
}

export function getReport(period: ReportPeriod) {
  const range = getDateRangeForPeriod(period);
  const entries = timeEntriesRepository.listByRange(range.from.toISOString(), range.to.toISOString());
  const grouped = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.project.name] = (acc[entry.project.name] ?? 0) + entry.durationMinutes;
    return acc;
  }, {});
  const totals = Object.entries(grouped).map(([projectName, minutes]) => ({ projectName, minutes }));
  return { range, entries, totals };
}
