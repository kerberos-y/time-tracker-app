import { NextResponse } from "next/server";
import { projectsRepository } from "@/lib/server/repositories/projects-repository";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as { name?: string; color?: string };
  if (!body.name || !body.color) {
    return new NextResponse("name and color are required", { status: 400 });
  }
  const updated = projectsRepository.update(Number(id), body.name.trim(), body.color);
  if (!updated) {
    return new NextResponse("project not found", { status: 404 });
  }
  return NextResponse.json(updated);
}
