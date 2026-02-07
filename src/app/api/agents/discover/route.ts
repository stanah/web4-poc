import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/contracts/server-client";
import { identityRegistryAbi } from "@/lib/contracts/abis/identity-registry";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import type { AgentMetadata } from "@/lib/erc8004/types";

const address = CONTRACT_ADDRESSES.sepolia.identityRegistry;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");
  const query = searchParams.get("q");

  const client = getPublicClient();

  let totalSupply: bigint;
  try {
    totalSupply = await client.readContract({
      address,
      abi: identityRegistryAbi,
      functionName: "totalSupply",
    }) as bigint;
  } catch {
    return NextResponse.json({ agents: [], total: 0 });
  }

  const count = Number(totalSupply);
  const agents: (AgentMetadata & { id: number })[] = [];

  for (let i = 1; i <= count; i++) {
    try {
      const uri = await client.readContract({
        address,
        abi: identityRegistryAbi,
        functionName: "tokenURI",
        args: [BigInt(i)],
      }) as string;

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
        a.tags.some((t) => t.includes(q))
    );
  }

  return NextResponse.json({ agents: filtered, total: filtered.length });
}
