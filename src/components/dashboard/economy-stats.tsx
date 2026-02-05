"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const stats = [
  {
    label: "Total Agents",
    value: "3",
    subtitle: "+3 this week",
    color: "text-green-500",
  },
  {
    label: "Total Feedback",
    value: "107",
    subtitle: "+23 today",
    color: "text-blue-500",
  },
  {
    label: "Avg. Rating",
    value: "4.47",
    subtitle: "across all agents",
    color: "text-yellow-500",
  },
  {
    label: "Interactions",
    value: "342",
    subtitle: "+87 today",
    color: "text-purple-500",
  },
];

const agentRankings = [
  { name: "AnalystAgent", score: 4.7, feedbacks: 28, percentage: 94 },
  { name: "TranslateAgent", score: 4.5, feedbacks: 32, percentage: 90 },
  { name: "OracleBot", score: 4.2, feedbacks: 47, percentage: 84 },
];

export function EconomyStats() {
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
          <h3 className="font-semibold mb-4">Agent Leaderboard</h3>
          <div className="space-y-4">
            {agentRankings.map((agent, i) => (
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
                      {agent.feedbacks} reviews
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
