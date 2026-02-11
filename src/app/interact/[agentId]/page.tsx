"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/interaction/chat-interface";
import { TrustLifecyclePanel } from "@/components/interaction/trust-lifecycle-panel";
import { useAgentMetadata } from "@/lib/contracts/hooks/use-agent-metadata";
import { getAgentPersonality } from "@/lib/agents/personality";
import { getAgentById } from "@/lib/agents/seed-data";
import { useTranslations } from "next-intl";

export default function InteractPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const id = parseInt(agentId, 10);
  const { metadata: agent, isLoading } = useAgentMetadata(id);
  const t = useTranslations("Interact");
  const tc = useTranslations("Common");
  const personality = getAgentPersonality(id);
  const seedAgent = getAgentById(id);

  const [trustStatus, setTrustStatus] = useState<"idle" | "verifying" | "complete">("idle");

  // Simple trust status simulation tied to page interaction
  useEffect(() => {
    if (agent) {
      // Start verification animation on page load
      setTrustStatus("verifying");
      const timer = setTimeout(() => setTrustStatus("complete"), 3000);
      return () => clearTimeout(timer);
    }
  }, [agent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>{tc("loading")}</span>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold">{tc("agentNotFound")}</h2>
        <p className="text-muted-foreground mt-2">
          {tc("agentNotFoundDesc", { id: agentId })}
        </p>
        <Button asChild className="mt-4">
          <Link href="/marketplace">{tc("backToMarketplace")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{personality.emoji}</span>
          <div>
            <h1 className={`text-2xl font-bold ${personality.colorClass}`}>
              {t("chatWith", { name: agent.name })}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("a2aInterface", { id: String(agent.id) })}
            </p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/agents/${agent.id}`}>{t("viewProfile")}</Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ChatInterface agent={agent} />
        </motion.div>

        <motion.div
          className="lg:sticky lg:top-4 lg:self-start"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TrustLifecyclePanel
            status={trustStatus}
            agentId={agent.id}
            agentName={agent.name}
            protocol={agent.services[0]?.type ?? "A2A"}
            score={seedAgent?.averageScore}
            feedbackCount={seedAgent?.feedbackCount}
            serviceName={agent.services[0]?.name}
          />
        </motion.div>
      </div>
    </div>
  );
}
