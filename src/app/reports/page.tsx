"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import type { ReportPeriod, TimeEntryWithProject } from "@/lib/domain/types";
import { formatMinutes } from "@/lib/client/time";
import { AppShell } from "@/components/layout/app-shell";

type ReportResponse = {
  entries: TimeEntryWithProject[];
  totals: Array<{ projectName: string; minutes: number }>;
  range: { from: string; to: string };
};

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("day");
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    api
      .getReport(period)
      .then((result) => {
        setReport(result);
        setError("");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [period]);

  return (
    <AppShell>
      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h1 className="mb-3 text-xl font-semibold">Reports</h1>
        <div className="mb-3 flex flex-wrap gap-2">
          {(["day", "week", "month"] as ReportPeriod[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPeriod(value)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                period === value ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
              }`}
            >
              {value}
            </button>
          ))}
          <a
            href={`/api/reports/export?period=${period}`}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
          >
            Export CSV
          </a>
        </div>
        {report ? (
          <p className="text-sm text-zinc-500">
            Period: {new Date(report.range.from).toLocaleString()} -{" "}
            {new Date(report.range.to).toLocaleString()}
          </p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      </section>

      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Totals by project</h2>
        {isLoading ? <p className="text-sm text-zinc-500">Loading report...</p> : null}
        {!isLoading && report && report.totals.length === 0 ? (
          <p className="text-sm text-zinc-500">No tracked time in this period.</p>
        ) : null}
        <div className="space-y-2">
          {report?.totals.map((item) => (
            <div key={item.projectName} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <span>{item.projectName}</span>
              <span className="font-medium">{formatMinutes(item.minutes)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Entries</h2>
        {!isLoading && report && report.entries.length === 0 ? (
          <p className="text-sm text-zinc-500">No entries for selected period.</p>
        ) : null}
        <div className="space-y-2">
          {report?.entries.map((entry) => (
            <div key={entry.id} className="rounded-md border border-zinc-200 p-3">
              <div className="font-medium">{entry.taskName}</div>
              <div className="text-sm text-zinc-500">
                {entry.project.name} • {formatMinutes(entry.durationMinutes)}
              </div>
              <div className="mt-1 text-xs text-zinc-400">
                {new Date(entry.startedAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
