"use client";

import { useEffect, useState } from "react";
import type { OnChainAgent } from "@/lib/contracts/hooks/use-agents-list";
import type { AgentService } from "@/lib/erc8004/types";

interface DiscoverAgent {
  id: number;
  name: string;
  description: string;
  image?: string;
  tags: string[];
  services?: AgentService[];
  owner?: string;
}

interface DiscoverResponse {
  agents: DiscoverAgent[];
  total: number;
  source: string;
}

export function useAgentsDiscover(params?: { tag?: string; query?: string }) {
  const [agents, setAgents] = useState<OnChainAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function fetchAgents() {
      setIsLoading(true);
      try {
        const searchParams = new URLSearchParams();
        if (params?.tag) searchParams.set("tag", params.tag);
        if (params?.query) searchParams.set("q", params.query);
        const qs = searchParams.toString();
        const url = `/api/agents/discover${qs ? `?${qs}` : ""}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: DiscoverResponse = await res.json();
        if (cancelled) return;

        const mapped: OnChainAgent[] = data.agents.map((a) => ({
          name: a.name,
          description: a.description,
          image: a.image,
          tags: a.tags ?? [],
          services: (a.services ?? []) as AgentService[],
          id: a.id,
          registeredAt: "",
          feedbackCount: 0,
          averageScore: 0,
        }));

        setAgents(mapped);
        setSource(data.source);
      } catch {
        if (!cancelled) setAgents([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAgents();
    return () => { cancelled = true; };
  }, [params?.tag, params?.query]);

  return { agents, isLoading, source };
}
