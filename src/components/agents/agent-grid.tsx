"use client";

import { AgentCard } from "./agent-card";
import type { OnChainAgent } from "@/lib/contracts/hooks/use-agents-list";
import { useTranslations } from "next-intl";

interface AgentGridProps {
  agents: OnChainAgent[];
}

export function AgentGrid({ agents }: AgentGridProps) {
  const t = useTranslations("AgentGrid");

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-medium">{t("noAgents")}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("adjustSearch")}
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
