"use client";

import { AgentCard } from "./agent-card";
import type { DemoAgent } from "@/lib/agents/seed-data";

interface AgentGridProps {
  agents: DemoAgent[];
}

export function AgentGrid({ agents }: AgentGridProps) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-medium">No agents found</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent, index) => (
        <AgentCard key={agent.id} agent={agent} index={index} />
      ))}
    </div>
  );
}
