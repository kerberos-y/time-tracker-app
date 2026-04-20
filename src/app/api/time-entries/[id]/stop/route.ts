import { NextResponse } from "next/server";
import { timeEntriesRepository } from "@/lib/server/repositories/time-entries-repository";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const stopped = timeEntriesRepository.stop(Number(id));
  if (!stopped) {
    return new NextResponse("entry not found or already stopped", { status: 404 });
  }
  return NextResponse.json(stopped);
}
