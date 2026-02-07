"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/interaction/chat-interface";
import { getAgentById } from "@/lib/agents/seed-data";
import { useTranslations } from "next-intl";

export default function InteractPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const id = parseInt(agentId, 10);
  const agent = getAgentById(id);
  const t = useTranslations("Interact");
  const tc = useTranslations("Common");

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
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold">
            {t("chatWith", { name: agent.name })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("a2aInterface", { id: String(agent.id) })}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/agents/${agent.id}`}>{t("viewProfile")}</Link>
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ChatInterface agent={agent} />
      </motion.div>
    </div>
  );
}
