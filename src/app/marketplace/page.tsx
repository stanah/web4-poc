"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AgentGrid } from "@/components/agents/agent-grid";
import { DEMO_AGENTS } from "@/lib/agents/seed-data";
import { useAgentsList } from "@/lib/contracts/hooks/use-agents-list";

const ALL_TAGS = ["all", "oracle", "defi", "nlp", "translation", "analytics", "research", "price-feed"];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const { agents: onChainAgents, isLoading } = useAgentsList();

  // Use on-chain agents if available, otherwise fall back to seed data
  const agents = onChainAgents.length > 0 ? onChainAgents : DEMO_AGENTS;

  const filtered = agents.filter((agent) => {
    const matchesSearch =
      !search ||
      agent.name.toLowerCase().includes(search.toLowerCase()) ||
      agent.description.toLowerCase().includes(search.toLowerCase());
    const matchesTag =
      selectedTag === "all" || agent.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Agent Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Discover and interact with AI agents registered on ERC-8004
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading agents from chain...</span>
          </div>
        </div>
      ) : (
        <AgentGrid agents={filtered} />
      )}
    </div>
  );
}
