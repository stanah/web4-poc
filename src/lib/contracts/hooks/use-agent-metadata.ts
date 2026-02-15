"use client";

import { useEffect, useState } from "react";
import { useAgentTokenURI } from "./use-identity";
import { getAgentById } from "@/lib/agents/seed-data";
import type { AgentMetadata } from "@/lib/erc8004/types";

interface AgentMetadataResult {
  metadata: (AgentMetadata & { id: number }) | undefined;
  isLoading: boolean;
  error: string | undefined;
}

export function useAgentMetadata(agentId: number): AgentMetadataResult {
  const { data: tokenURI, isLoading: isLoadingURI, error: uriError } = useAgentTokenURI(BigInt(agentId));
  const [metadata, setMetadata] = useState<(AgentMetadata & { id: number }) | undefined>();
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [fetchError, setFetchError] = useState<string | undefined>();

  useEffect(() => {
    if (isLoadingURI) return;

    // If on-chain tokenURI is available, fetch metadata from it
    if (tokenURI) {
      let cancelled = false;
      setIsLoadingMetadata(true);
      setFetchError(undefined);

      async function fetchMetadata() {
        try {
          const uri = tokenURI as string;
          let data: AgentMetadata;

          if (uri.startsWith("data:")) {
            const json = uri.split(",")[1];
            data = JSON.parse(atob(json));
          } else {
            const res = await fetch(uri);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            data = await res.json();
          }

          if (!cancelled) {
            setMetadata({ ...data, id: agentId });
            setIsLoadingMetadata(false);
          }
        } catch (err) {
          if (!cancelled) {
            // On-chain URI fetch failed — fall back to seed data
            const seed = getAgentById(agentId);
            if (seed) {
              setMetadata({ ...seed, id: seed.id });
              setFetchError(undefined);
            } else {
              setFetchError(err instanceof Error ? err.message : "Failed to fetch metadata");
            }
            setIsLoadingMetadata(false);
          }
        }
      }

      fetchMetadata();
      return () => { cancelled = true; };
    }

    // No on-chain tokenURI — fall back to demo seed data
    const seed = getAgentById(agentId);
    if (seed) {
      setMetadata({ ...seed, id: seed.id });
      setFetchError(undefined);
    } else {
      setMetadata(undefined);
    }
  }, [tokenURI, isLoadingURI, agentId]);

  return {
    metadata,
    isLoading: isLoadingURI || isLoadingMetadata,
    error: uriError && !metadata ? String(uriError) : fetchError,
  };
}
