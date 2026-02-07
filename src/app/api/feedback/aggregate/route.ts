import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/contracts/server-client";
import { reputationRegistryAbi } from "@/lib/contracts/abis/reputation-registry";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";

const MAX_CONCURRENT_RPC = 10;

/**
 * Try to read reputation summaries from Supabase first.
 * Uses anon key (RLS enforced) for read-only access.
 */
async function getFromSupabase(agentId?: number) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, anonKey);

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

/**
 * Run promises with concurrency limit to prevent RPC rate limit exhaustion.
 */
async function withConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = tasks.slice(i, i + limit);
    const batchResults = await Promise.allSettled(batch.map((fn) => fn()));
    for (const r of batchResults) {
      if (r.status === "fulfilled") results.push(r.value);
    }
  }
  return results;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentIdParam = searchParams.get("agentId");

  // Validate agentId if provided
  if (agentIdParam !== null) {
    const parsed = parseInt(agentIdParam, 10);
    if (isNaN(parsed) || parsed <= 0) {
      return NextResponse.json(
        { error: "agentId must be a positive integer" },
        { status: 400 },
      );
    }
  }

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

    // Get all agents from on-chain totalSupply with concurrency limit
    const client = getPublicClient();
    const totalSupply = (await client.readContract({
      address: CONTRACT_ADDRESSES.sepolia.identityRegistry,
      abi: (await import("@/lib/contracts/abis/identity-registry")).identityRegistryAbi,
      functionName: "totalSupply",
    })) as bigint;

    const count = Math.min(Number(totalSupply), 100); // Cap at 100 to prevent DoS
    const results: Record<number, Awaited<ReturnType<typeof getOnChainSummary>>> = {};

    const tasks = Array.from({ length: count }, (_, i) => {
      const id = i + 1;
      return async () => {
        const summary = await getOnChainSummary(id);
        results[id] = summary;
        return summary;
      };
    });

    await withConcurrencyLimit(tasks, MAX_CONCURRENT_RPC);
    return NextResponse.json(results);
  } catch (err) {
    console.error("[feedback/aggregate] Error:", err);
    return NextResponse.json(
      { error: "Failed to read data" },
      { status: 500 },
    );
  }
}
