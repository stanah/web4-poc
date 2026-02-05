import { NextResponse } from "next/server";
import { DEMO_AGENTS } from "@/lib/agents/seed-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");
  const query = searchParams.get("q");

  let agents = [...DEMO_AGENTS];

  if (tag) {
    agents = agents.filter((a) => a.tags.includes(tag));
  }

  if (query) {
    const q = query.toLowerCase();
    agents = agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
    );
  }

  return NextResponse.json({ agents, total: agents.length });
}
