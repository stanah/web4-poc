"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTotalAgents } from "@/lib/contracts/hooks/use-identity";
import { useReputationSummary } from "@/lib/contracts/hooks/use-reputation";
import { useTranslations } from "next-intl";
import { DEMO_AGENTS, AGENT_PERSONALITIES } from "@/lib/agents/seed-data";
import type { AgentPersonality } from "@/lib/agents/seed-data";

type CategoryKey = AgentPersonality["category"] | "all";

const CATEGORIES: { key: CategoryKey; i18nKey: string }[] = [
  { key: "all", i18nKey: "all" },
  { key: "creator", i18nKey: "creator" },
  { key: "derivative", i18nKey: "derivative" },
  { key: "curator", i18nKey: "curator" },
  { key: "fan", i18nKey: "fan" },
  { key: "infra", i18nKey: "infra" },
];

const WEB_ERAS = [
  { version: "1.0", emoji: "\u{1F4D6}", decade: "1990s" },
  { version: "2.0", emoji: "\u{1F465}", decade: "2000s" },
  { version: "3.0", emoji: "\u{1F517}", decade: "2010s" },
  { version: "4.0", emoji: "\u{1F916}", decade: "Now" },
];

function useOnChainStats() {
  const { data: totalSupply } = useTotalAgents();
  const { data: summary1 } = useReputationSummary(1);
  const { data: summary2 } = useReputationSummary(2);
  const { data: summary3 } = useReputationSummary(3);

  const agents = totalSupply ? String(Number(totalSupply)) : "0";

  const summaries = [summary1, summary2, summary3]
    .filter(Boolean)
    .map((s) => {
      const sum = s as { totalFeedback: bigint; averageValue: bigint; averageDecimals: number };
      return {
        totalFeedback: Number(sum.totalFeedback),
        averageScore: Number(sum.averageValue) / Math.pow(10, sum.averageDecimals),
      };
    });

  const totalFeedback = String(summaries.reduce((acc, s) => acc + s.totalFeedback, 0));

  const avgRating = summaries.length > 0
    ? (summaries.reduce((acc, s) => acc + s.averageScore, 0) / summaries.length).toFixed(1)
    : "0";

  return { agents, totalFeedback, avgRating };
}

export default function HomePage() {
  const { agents, totalFeedback, avgRating } = useOnChainStats();
  const t = useTranslations("HomePage");
  const tCat = useTranslations("AgentCategory");
  const tTag = useTranslations("AgentTagline");
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("all");

  const filteredAgents = DEMO_AGENTS.filter((agent) => {
    if (selectedCategory === "all") return true;
    return AGENT_PERSONALITIES[agent.id]?.category === selectedCategory;
  });

  const stats = [
    { label: t("statAgents"), value: agents },
    { label: t("statFeedback"), value: totalFeedback },
    { label: t("statRating"), value: avgRating },
    { label: t("statChain"), value: "Sepolia" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-16">
      {/* Hero */}
      <motion.section
        className="text-center space-y-6 max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Badge variant="outline" className="text-sm px-4 py-1">
          {t("badge")}
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          {t("title1")}{" "}
          <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>{" "}
          {t("title2")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/marketplace">{t("exploreAgents")}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/dashboard">{t("watchTrade")}</Link>
          </Button>
        </div>
      </motion.section>

      {/* Web Evolution Timeline */}
      <motion.section
        className="w-full max-w-4xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">{t("timelineTitle")}</h2>
        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-10 left-0 right-0 h-0.5 bg-gradient-to-r from-muted via-primary/30 to-primary hidden md:block" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {WEB_ERAS.map((era, i) => (
              <motion.div
                key={era.version}
                className="flex flex-col items-center text-center relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15 }}
              >
                <div
                  className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full text-4xl mb-4 ${
                    i === 3
                      ? "bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border-2 border-violet-500/50 shadow-lg shadow-violet-500/10"
                      : "bg-muted border border-border"
                  }`}
                >
                  {era.emoji}
                </div>
                <h3 className={`font-bold text-lg ${i === 3 ? "text-violet-500" : ""}`}>
                  Web {era.version}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t(`era${era.version.replace(".", "")}` as "era10")}
                </p>
                {i === 3 && (
                  <Badge className="mt-2 bg-violet-500 text-white animate-pulse">
                    {era.decade}
                  </Badge>
                )}
                {i < 3 && (
                  <span className="text-xs text-muted-foreground mt-2">{era.decade}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
        <motion.p
          className="text-center text-muted-foreground mt-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {t("timelineMessage")}
        </motion.p>
      </motion.section>

      {/* AI Economy Residents */}
      <motion.section
        className="w-full max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t("residentsTitle")}</h2>
          <Badge variant="secondary" className="text-sm">
            {t("agentCount", { count: String(DEMO_AGENTS.length) })}
          </Badge>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat.key}
              variant={selectedCategory === cat.key ? "default" : "outline"}
              className="cursor-pointer text-sm px-3 py-1"
              onClick={() => setSelectedCategory(cat.key)}
            >
              {tCat.has(cat.i18nKey) ? tCat(cat.i18nKey) : cat.i18nKey}
            </Badge>
          ))}
        </div>

        {/* Agent grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredAgents.map((agent, i) => {
            const p = AGENT_PERSONALITIES[agent.id];
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/interact/${agent.id}`}>
                  <Card className="group hover:border-primary/50 transition-all duration-200 hover:shadow-md cursor-pointer">
                    <CardContent className="p-4 text-center space-y-2">
                      <div className={`flex h-12 w-12 mx-auto items-center justify-center rounded-lg text-2xl ${p?.bgClass ?? "bg-primary/10"}`}>
                        {p?.emoji ?? "\u{1F916}"}
                      </div>
                      <h3 className={`font-semibold text-sm truncate ${p?.colorClass ?? "text-foreground"}`}>
                        {agent.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">
                        {tTag.has(p?.tagline?.replace("agentTagline.", "") ?? "")
                          ? tTag(p?.tagline?.replace("agentTagline.", "") as "oracleBot")
                          : agent.description.split("。")[0]}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Live Stats */}
      <motion.section
        className="w-full max-w-3xl text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-2xl font-bold">{t("statsTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("statsSubtitle")}</p>
        <div className="flex flex-wrap items-center justify-center gap-12 pt-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/marketplace">{t("ctaMarketplace")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">{t("ctaDashboard")}</Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
