import { NextResponse } from "next/server";
import { getDateRangeForPeriod } from "@/lib/server/services/report-service";
import { timeEntriesRepository } from "@/lib/server/repositories/time-entries-repository";
import type { ReportPeriod } from "@/lib/domain/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as ReportPeriod | null) ?? "day";
  const range = getDateRangeForPeriod(period);
  return NextResponse.json({
    entries: timeEntriesRepository.listByRange(range.from.toISOString(), range.to.toISOString()),
    activeEntry: timeEntriesRepository.getActive(),
    taskSuggestions: timeEntriesRepository.listTaskNames(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { taskName?: string; projectId?: number };
  if (!body.taskName || !body.projectId) {
    return new NextResponse("taskName and projectId are required", { status: 400 });
  }
  const active = timeEntriesRepository.getActive();
  if (active) {
    return new NextResponse("Another timer is active", { status: 400 });
  }
  return NextResponse.json(
    timeEntriesRepository.create(body.taskName.trim(), Number(body.projectId)),
  );
}
