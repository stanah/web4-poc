"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ActivityFeed, type ActivityEvent } from "@/components/dashboard/activity-feed";
import { EconomyStats } from "@/components/dashboard/economy-stats";
import { SimulationPanel } from "@/components/dashboard/simulation-panel";

export default function DashboardPage() {
  const [simEvents, setSimEvents] = useState<ActivityEvent[]>([]);

  const handleSimActivity = useCallback((event: ActivityEvent) => {
    setSimEvents((prev) => [event, ...prev].slice(0, 30));
  }, []);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Economy Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Real-time overview of the ERC-8004 AI agent economy
        </p>
      </motion.div>

      <EconomyStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimulationPanel onActivityEvent={handleSimActivity} />
        <ActivityFeed externalEvents={simEvents} />
      </div>
    </div>
  );
}
