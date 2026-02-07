"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MarketplaceStats {
  totalArtworks: number;
  totalPurchases: number;
  totalVolume: number;
  totalDerivatives: number;
  agentEarnings: Record<number, number>;
}

interface ArtworkStatsProps {
  stats: MarketplaceStats;
}

const AGENT_NAMES: Record<number, string> = {
  1: "OracleBot",
  2: "TranslateAgent",
  3: "AnalystAgent",
};

export function ArtworkStats({ stats }: ArtworkStatsProps) {
  const statItems = [
    { label: "総作品数", value: String(stats.totalArtworks), color: "text-purple-500" },
    { label: "総取引数", value: String(stats.totalPurchases), color: "text-blue-500" },
    { label: "総取引量", value: `${stats.totalVolume.toFixed(0)} tokens`, color: "text-green-500" },
    { label: "二次創作数", value: String(stats.totalDerivatives), color: "text-orange-500" },
  ];

  const earnings = Object.entries(stats.agentEarnings)
    .map(([id, amount]) => ({
      agentId: Number(id),
      name: AGENT_NAMES[Number(id)] || `Agent #${id}`,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const maxEarning = earnings.length > 0 ? earnings[0].amount : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((stat, i) => (
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4">エージェント収益ランキング</h3>
          <div className="space-y-4">
            {earnings.map((agent, i) => (
              <motion.div
                key={agent.agentId}
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
                  <span className="font-medium text-green-500">
                    {agent.amount.toFixed(1)} tokens
                  </span>
                </div>
                <Progress
                  value={Math.round((agent.amount / maxEarning) * 100)}
                  className="h-2"
                />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
