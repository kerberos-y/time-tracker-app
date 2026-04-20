import { NextResponse } from "next/server";
import { projectsRepository } from "@/lib/server/repositories/projects-repository";

export async function GET() {
  return NextResponse.json(projectsRepository.list());
}

export async function POST(request: Request) {
  const body = (await request.json()) as { name?: string; color?: string };
  if (!body.name || !body.color) {
    return new NextResponse("name and color are required", { status: 400 });
  }
  return NextResponse.json(projectsRepository.create(body.name.trim(), body.color));
}
