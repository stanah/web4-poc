import { NextResponse } from "next/server";

const MOCK_AGGREGATED = {
  1: { totalFeedback: 47, averageScore: 4.2, topTags: ["accuracy", "speed"] },
  2: {
    totalFeedback: 32,
    averageScore: 4.5,
    topTags: ["accuracy", "helpfulness"],
  },
  3: {
    totalFeedback: 28,
    averageScore: 4.7,
    topTags: ["accuracy", "creativity"],
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (agentId) {
    const id = parseInt(agentId, 10) as keyof typeof MOCK_AGGREGATED;
    const data = MOCK_AGGREGATED[id];
    if (!data) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  return NextResponse.json(MOCK_AGGREGATED);
}
