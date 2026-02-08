import { NextResponse } from "next/server";
import { DEMO_AGENTS } from "@/lib/agents/seed-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agentId = parseInt(id, 10);
  const agent = DEMO_AGENTS.find((a) => a.id === agentId);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: agent.name,
    description: agent.description,
    image: agent.image,
    services: agent.services.map((s) => ({
      type: s.type,
      name: s.name,
      description: s.description,
      endpoint: s.endpoint,
      version: s.version,
    })),
    tags: agent.tags,
    supportedTrust: agent.supportedTrust,
  });
}
