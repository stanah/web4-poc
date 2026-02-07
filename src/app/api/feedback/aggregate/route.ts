import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/contracts/server-client";
import { reputationRegistryAbi } from "@/lib/contracts/abis/reputation-registry";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

const AGENT_IDS = [1, 2, 3];

async function getOnChainSummary(agentId: number) {
  const client = getPublicClient();
  const summary = await client.readContract({
    address: CONTRACT_ADDRESSES.sepolia.reputationRegistry,
    abi: reputationRegistryAbi,
    functionName: "getSummary",
    args: [BigInt(agentId), [], "", ""],
  });

  const { totalFeedback, averageValue, averageDecimals } = summary as {
    totalFeedback: bigint;
    averageValue: bigint;
    averageDecimals: number;
  };

  return {
    totalFeedback: Number(totalFeedback),
    averageScore:
      Number(averageValue) / Math.pow(10, averageDecimals) || 0,
    topTags: ["accuracy", "speed"], // tags are not aggregated by the contract
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get("agentId");

  try {
    if (agentId) {
      const id = parseInt(agentId, 10);
      const data = await getOnChainSummary(id);
      return NextResponse.json(data);
    }

    const results: Record<number, Awaited<ReturnType<typeof getOnChainSummary>>> = {};
    await Promise.all(
      AGENT_IDS.map(async (id) => {
        results[id] = await getOnChainSummary(id);
      }),
    );
    return NextResponse.json(results);
  } catch (err) {
    console.error("[feedback/aggregate] On-chain read failed:", err);
    // Fallback to empty data rather than mock data
    return NextResponse.json(
      { error: "Failed to read on-chain data" },
      { status: 500 },
    );
  }
}
