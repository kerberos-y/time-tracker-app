import { NextResponse } from "next/server";
import type { ReportPeriod } from "@/lib/domain/types";
import { getReport } from "@/lib/server/services/report-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as ReportPeriod | null) ?? "day";
  const report = getReport(period);
  return NextResponse.json({
    entries: report.entries,
    totals: report.totals,
    range: {
      from: report.range.from.toISOString(),
      to: report.range.to.toISOString(),
    },
  });
}
