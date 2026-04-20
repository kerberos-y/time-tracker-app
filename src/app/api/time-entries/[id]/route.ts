import { NextResponse } from "next/server";
import { timeEntriesRepository } from "@/lib/server/repositories/time-entries-repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    taskName?: string;
    projectId?: number;
    durationMinutes?: number;
  };
  if (!body.taskName || !body.projectId || body.durationMinutes === undefined) {
    return new NextResponse("taskName, projectId, durationMinutes are required", { status: 400 });
  }
  const entry = timeEntriesRepository.update(
    Number(id),
    body.taskName.trim(),
    Number(body.projectId),
    Number(body.durationMinutes),
  );
  if (!entry) {
    return new NextResponse("entry not found", { status: 404 });
  }
  return NextResponse.json(entry);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  timeEntriesRepository.delete(Number(id));
  return NextResponse.json({ success: true });
}
