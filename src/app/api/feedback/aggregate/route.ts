import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/contracts/server-client";
import { reputationRegistryAbi } from "@/lib/contracts/abis/reputation-registry";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

/**
 * Try to read reputation summaries from Supabase first.
 */
async function getFromSupabase(agentId?: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const { getSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = getSupabaseServerClient();

  if (agentId) {
    const { data, error } = await supabase
      .from("reputation_summaries")
      .select("*")
      .eq("agent_id", agentId)
      .single();

    if (error || !data) return null;

    const d = data as Record<string, unknown>;
    return {
      totalFeedback: d.total_feedback as number,
      averageScore: Number(d.average_score),
      topTags: Object.entries((d.tag_counts ?? {}) as Record<string, number>)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag),
    };
  }

  // Get all reputation summaries
  const { data, error } = await supabase
    .from("reputation_summaries")
    .select("*");

  if (error || !data) return null;

  const results: Record<number, { totalFeedback: number; averageScore: number; topTags: string[] }> = {};
  for (const row of data as Record<string, unknown>[]) {
    results[row.agent_id as number] = {
      totalFeedback: row.total_feedback as number,
      averageScore: Number(row.average_score),
      topTags: Object.entries((row.tag_counts ?? {}) as Record<string, number>)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag),
    };
  }

  return results;
}

/**
 * Fallback: read reputation from on-chain contract.
 */
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
    topTags: ["accuracy", "speed"],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentIdParam = searchParams.get("agentId");
  const agentId = agentIdParam ? parseInt(agentIdParam, 10) : undefined;

  // Try Supabase first
  try {
    const supabaseResult = await getFromSupabase(agentId);
    if (supabaseResult) {
      return NextResponse.json(supabaseResult);
    }
  } catch {
    // Fall through to on-chain
  }

  // Fallback to on-chain reads
  try {
    if (agentId) {
      const data = await getOnChainSummary(agentId);
      return NextResponse.json(data);
    }

    // Get all agents from on-chain totalSupply
    const { getPublicClient: getClient } = await import(
      "@/lib/contracts/server-client"
    );
    const { identityRegistryAbi: idAbi } = await import(
      "@/lib/contracts/abis/identity-registry"
    );
    const client = getClient();
    const totalSupply = (await client.readContract({
      address: CONTRACT_ADDRESSES.sepolia.identityRegistry,
      abi: idAbi,
      functionName: "totalSupply",
    })) as bigint;

    const count = Number(totalSupply);
    const results: Record<number, Awaited<ReturnType<typeof getOnChainSummary>>> = {};
    await Promise.all(
      Array.from({ length: count }, (_, i) => i + 1).map(async (id) => {
        try {
          results[id] = await getOnChainSummary(id);
        } catch {
          // Skip agents with no feedback
        }
      }),
    );
    return NextResponse.json(results);
  } catch (err) {
    console.error("[feedback/aggregate] Error:", err);
    return NextResponse.json(
      { error: "Failed to read data" },
      { status: 500 },
    );
  }
}
