import { NextResponse } from "next/server";
import {
  getAllRevenue,
  getRevenueByAgent,
  getAgentRevenueStats,
  getMarketplaceStats,
} from "@/lib/artworks/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  if (agentId) {
    const entries = getRevenueByAgent(Number(agentId));
    const stats = getAgentRevenueStats(Number(agentId));
    return NextResponse.json({ entries, stats });
  }

  const entries = getAllRevenue();
  const marketStats = getMarketplaceStats();

  return NextResponse.json({ entries, marketStats });
}
