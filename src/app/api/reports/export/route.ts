import type { ReportPeriod } from "@/lib/domain/types";
import { getReport } from "@/lib/server/services/report-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as ReportPeriod | null) ?? "day";
  const report = getReport(period);
  const csv = [
    "Task,Project,Started At,Ended At,Duration Minutes",
    ...report.entries.map(
      (entry) =>
        `"${entry.taskName}","${entry.project.name}","${entry.startedAt}","${entry.endedAt ?? ""}",${entry.durationMinutes}`,
    ),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="report-${period}.csv"`,
    },
  });
}
