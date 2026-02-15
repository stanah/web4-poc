"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

interface AgentSummary {
  totalFeedback: number;
  averageScore: number;
  topTags: string[];
}

function useEconomyData() {
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [rankings, setRankings] = useState<
    { name: string; score: number; feedbacks: number; percentage: number }[]
  >([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [discoverRes, aggregateRes] = await Promise.all([
          fetch("/api/agents/discover"),
          fetch("/api/feedback/aggregate"),
        ]);

        if (cancelled) return;

        // Parse discover response for total agents count + names
        let agentNames: Record<number, string> = {};
        if (discoverRes.ok) {
          const discover = await discoverRes.json();
          setTotalAgents(discover.total ?? 0);
          for (const a of discover.agents ?? []) {
            agentNames[a.id] = a.name;
          }
        }

        // Parse aggregate response for reputation data
        if (aggregateRes.ok) {
          const aggregate: Record<string, AgentSummary> = await aggregateRes.json();

          const entries = Object.entries(aggregate)
            .map(([id, summary]) => ({
              agentId: Number(id),
              ...summary,
            }));

          const totalFb = entries.reduce((acc, s) => acc + s.totalFeedback, 0);
          const avg = entries.length > 0
            ? entries.reduce((acc, s) => acc + s.averageScore, 0) / entries.length
            : 0;

          setTotalFeedback(totalFb);
          setAvgRating(avg);

          const ranked = entries
            .map((s) => ({
              name: agentNames[s.agentId] ?? `Agent #${s.agentId}`,
              score: s.averageScore,
              feedbacks: s.totalFeedback,
              percentage: Math.round((s.averageScore / 5) * 100),
            }))
            .filter((r) => r.feedbacks > 0)
            .sort((a, b) => b.score - a.score);

          setRankings(ranked);
        }
      } catch {
        // Silently fail — dashboard shows zeros
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return { totalAgents, totalFeedback, avgRating, rankings };
}

export function EconomyStats() {
  const { totalAgents, totalFeedback, avgRating, rankings } = useEconomyData();
  const t = useTranslations("EconomyStats");
  const tc = useTranslations("Common");

  const stats = [
    { label: t("totalAgents"), value: String(totalAgents), subtitle: tc("onChain"), color: "text-green-500" },
    { label: t("totalFeedback"), value: String(totalFeedback), subtitle: tc("onChain"), color: "text-blue-500" },
    { label: t("avgRating"), value: avgRating.toFixed(2), subtitle: tc("acrossAllAgents"), color: "text-yellow-500" },
    { label: t("interactions"), value: String(totalFeedback), subtitle: tc("onChain"), color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Agent Rankings */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">{t("leaderboard")}</h3>
          <div className="space-y-4">
            {rankings.map((agent, i) => (
              <motion.div
                key={agent.name}
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-muted-foreground">
                      #{i + 1}
                    </span>
                    <span className="font-medium">{agent.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {agent.feedbacks} {t("reviews")}
                    </span>
                    <span className="font-medium text-yellow-500">
                      {agent.score.toFixed(1)}
                    </span>
                  </div>
                </div>
                <Progress value={agent.percentage} className="h-2" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
