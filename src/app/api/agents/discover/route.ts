import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/contracts/server-client";
import { identityRegistryAbi } from "@/lib/contracts/abis/identity-registry";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import type { AgentMetadata } from "@/lib/erc8004/types";

const address = CONTRACT_ADDRESSES.sepolia.identityRegistry;

/**
 * Try to read agents from Supabase first (fast, indexed).
 * Falls back to on-chain reads if Supabase is not configured.
 */
async function getAgentsFromSupabase(tag?: string, query?: string) {
  // Dynamic import to avoid errors when Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const { getSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = getSupabaseServerClient();

  let queryBuilder = supabase.from("agents").select("*");

  if (tag) {
    queryBuilder = queryBuilder.contains("tags", [tag]);
  }

  if (query) {
    queryBuilder = queryBuilder.or(
      `name.ilike.%${query}%,description.ilike.%${query}%`,
    );
  }

  const { data, error } = await queryBuilder.order("token_id", { ascending: true });

  if (error || !data) return null;

  return (data as Record<string, unknown>[]).map((row) => ({
    id: row.token_id as number,
    name: row.name as string,
    description: row.description as string,
    image: (row.image as string | null) ?? undefined,
    tags: row.tags as string[],
    services: row.services as AgentMetadata["services"],
    owner: row.owner as `0x${string}`,
  }));
}

/**
 * Fallback: read agents directly from on-chain contracts.
 */
async function getAgentsFromChain(tag?: string, query?: string) {
  const client = getPublicClient();

  let totalSupply: bigint;
  try {
    totalSupply = (await client.readContract({
      address,
      abi: identityRegistryAbi,
      functionName: "totalSupply",
    })) as bigint;
  } catch {
    return [];
  }

  const count = Number(totalSupply);
  const agents: (AgentMetadata & { id: number })[] = [];

  for (let i = 1; i <= count; i++) {
    try {
      const uri = (await client.readContract({
        address,
        abi: identityRegistryAbi,
        functionName: "tokenURI",
        args: [BigInt(i)],
      })) as string;

      let metadata: AgentMetadata;
      if (uri.startsWith("data:")) {
        const json = uri.split(",")[1];
        metadata = JSON.parse(atob(json));
      } else {
        const res = await fetch(uri);
        metadata = await res.json();
      }

      agents.push({ ...metadata, id: i });
    } catch {
      // Skip agents with invalid metadata
    }
  }

  let filtered = agents;

  if (tag) {
    filtered = filtered.filter((a) => a.tags.includes(tag));
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q)),
    );
  }

  return filtered;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag") ?? undefined;
  const query = searchParams.get("q") ?? undefined;

  // Try Supabase first (fast indexed queries)
  const supabaseAgents = await getAgentsFromSupabase(tag, query);
  if (supabaseAgents) {
    return NextResponse.json({
      agents: supabaseAgents,
      total: supabaseAgents.length,
      source: "supabase",
    });
  }

  // Fallback to on-chain reads
  const agents = await getAgentsFromChain(tag, query);
  return NextResponse.json({
    agents,
    total: agents.length,
    source: "onchain",
  });
}
