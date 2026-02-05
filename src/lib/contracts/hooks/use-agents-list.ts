"use client";

import { useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { identityRegistryAbi } from "../abis/identity-registry";
import { CONTRACT_ADDRESSES } from "../addresses";
import { useTotalAgents } from "./use-identity";
import type { AgentMetadata } from "@/lib/erc8004/types";
import type { DemoAgent } from "@/lib/agents/seed-data";

const address = CONTRACT_ADDRESSES.sepolia.identityRegistry;

interface OnChainAgent extends AgentMetadata {
  id: number;
  registeredAt: string;
  feedbackCount: number;
  averageScore: number;
}

export function useAgentsList() {
  const { data: totalSupply, isLoading: isLoadingTotal } = useTotalAgents();
  const [agents, setAgents] = useState<DemoAgent[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const count = totalSupply ? Number(totalSupply) : 0;

  // Build tokenURI read calls for all agent IDs (1..totalSupply)
  const tokenURICalls = Array.from({ length: count }, (_, i) => ({
    address,
    abi: identityRegistryAbi,
    functionName: "tokenURI" as const,
    args: [BigInt(i + 1)] as const,
  }));

  const {
    data: uriResults,
    isLoading: isLoadingURIs,
  } = useReadContracts({
    contracts: tokenURICalls,
    query: { enabled: count > 0 },
  });

  useEffect(() => {
    if (!uriResults || uriResults.length === 0) return;

    let cancelled = false;
    setIsLoadingMetadata(true);

    async function fetchMetadata() {
      const fetched: OnChainAgent[] = [];

      for (let i = 0; i < uriResults!.length; i++) {
        const result = uriResults![i];
        if (result.status !== "success" || !result.result) continue;

        const uri = result.result as string;
        try {
          // tokenURI may be a URL or a data URI
          let metadata: AgentMetadata;
          if (uri.startsWith("data:")) {
            const json = uri.split(",")[1];
            metadata = JSON.parse(atob(json));
          } else {
            const res = await fetch(uri);
            metadata = await res.json();
          }

          fetched.push({
            ...metadata,
            id: i + 1,
            registeredAt: new Date().toISOString(),
            feedbackCount: 0,
            averageScore: 0,
          });
        } catch {
          // Skip agents with invalid metadata
        }
      }

      if (!cancelled) {
        setAgents(fetched);
        setIsLoadingMetadata(false);
      }
    }

    fetchMetadata();
    return () => { cancelled = true; };
  }, [uriResults]);

  return {
    agents,
    isLoading: isLoadingTotal || isLoadingURIs || isLoadingMetadata,
    totalSupply: count,
  };
}
