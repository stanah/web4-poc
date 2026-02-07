import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/contracts/server-client";
import { identityRegistryAbi } from "@/lib/contracts/abis/identity-registry";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import type { AgentMetadata } from "@/lib/erc8004/types";

const address = CONTRACT_ADDRESSES.sepolia.identityRegistry;
const MAX_CONCURRENT_RPC = 10;

/**
 * Check if a URL points to a private/internal IP range (SSRF prevention).
 */
function isPrivateUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "[::1]" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) {
      return true;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * Parse metadata from a data URI, supporting both base64 and plain text formats.
 */
function parseDataUri(uri: string): AgentMetadata | null {
  try {
    const commaIndex = uri.indexOf(",");
    if (commaIndex === -1) return null;
    const header = uri.slice(0, commaIndex);
    const body = uri.slice(commaIndex + 1);
    if (header.includes(";base64")) {
      return JSON.parse(atob(body));
    }
    return JSON.parse(decodeURIComponent(body));
  } catch {
    return null;
  }
}

/**
 * Safely fetch metadata from an external URL with SSRF protection.
 */
async function safeFetchMetadata(uri: string): Promise<AgentMetadata | null> {
  if (isPrivateUrl(uri)) return null;
  try {
    const res = await fetch(uri, {
      signal: AbortSignal.timeout(5000),
      redirect: "manual",
    });
    if (res.status >= 300 && res.status < 400) return null;
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Try to read agents from Supabase first (fast, indexed).
 * Falls back to on-chain reads if Supabase is not configured.
 */
async function getAgentsFromSupabase(tag?: string, query?: string) {
  // Dynamic import to avoid errors when Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return null;

  const { createBrowserClient } = await import("@/lib/supabase/create-client");
  const supabase = createBrowserClient();

  let queryBuilder = supabase.from("agents").select("*");

  if (tag) {
    queryBuilder = queryBuilder.contains("tags", [tag]);
  }

  if (query) {
    // Whitelist approach: only allow safe characters for PostgREST filters
    const sanitized = query.replace(/[^a-zA-Z0-9\s\u3000-\u9FFF\uFF00-\uFFEF-]/g, "");
    if (sanitized) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${sanitized}%,description.ilike.%${sanitized}%`,
      );
    }
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
 * Run promises with concurrency limit.
 */
async function withConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function runNext(): Promise<void> {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => runNext());
  await Promise.all(workers);
  return results;
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

  // Fetch metadata concurrently with limit to avoid RPC rate-limiting
  const tasks = Array.from({ length: count }, (_, i) => {
    const tokenId = i + 1;
    return async (): Promise<(AgentMetadata & { id: number }) | null> => {
      try {
        const uri = (await client.readContract({
          address,
          abi: identityRegistryAbi,
          functionName: "tokenURI",
          args: [BigInt(tokenId)],
        })) as string;

        let metadata: AgentMetadata | null = null;
        if (uri.startsWith("data:")) {
          metadata = parseDataUri(uri);
        } else {
          metadata = await safeFetchMetadata(uri);
        }

        if (!metadata) return null;
        return { ...metadata, id: tokenId };
      } catch {
        return null;
      }
    };
  });

  const results = await withConcurrencyLimit(tasks, MAX_CONCURRENT_RPC);
  let agents = results.filter(
    (a): a is AgentMetadata & { id: number } => a !== null,
  );

  if (tag) {
    agents = agents.filter((a) => a.tags.includes(tag));
  }

  if (query) {
    const q = query.toLowerCase();
    agents = agents.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q)),
    );
  }

  return agents;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag") ?? undefined;
  const query = searchParams.get("q") ?? undefined;

  try {
    // Try Supabase first (fast indexed queries)
    const supabaseAgents = await getAgentsFromSupabase(tag, query);
    if (supabaseAgents) {
      return NextResponse.json({
        agents: supabaseAgents,
        total: supabaseAgents.length,
        source: "supabase",
      });
    }
  } catch (err) {
    console.error("[discover] Supabase query failed, falling back to on-chain:", err);
  }

  try {
    // Fallback to on-chain reads
    const agents = await getAgentsFromChain(tag, query);
    return NextResponse.json({
      agents,
      total: agents.length,
      source: "onchain",
    });
  } catch (err) {
    console.error("[discover] On-chain fallback also failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 },
    );
  }
}
