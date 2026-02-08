"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AgentGrid } from "@/components/agents/agent-grid";
import { useAgentsDiscover } from "@/lib/hooks/use-agents-discover";
import { useTranslations } from "next-intl";
import { useTagLabel } from "@/lib/i18n/tag-utils";

const ALL_TAGS = ["all", "oracle", "defi", "nlp", "translation", "analytics", "research", "price-feed"];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const { agents, isLoading } = useAgentsDiscover();
  const t = useTranslations("Marketplace");
  const getTagLabel = useTagLabel();

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
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("description")}
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant={selectedTag === tag ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedTag(tag)}
            >
              {getTagLabel(tag)}
            </Badge>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>{t("loadingFromChain")}</span>
          </div>
        </div>
      ) : (
        <AgentGrid agents={filtered} />
      )}
    </div>
  );
}
