"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWatchContractEvent } from "wagmi";
import { identityRegistryAbi } from "@/lib/contracts/abis/identity-registry";
import { reputationRegistryAbi } from "@/lib/contracts/abis/reputation-registry";
import { validationRegistryAbi } from "@/lib/contracts/abis/validation-registry";
import { CONTRACT_ADDRESSES } from "@/lib/contracts/addresses";
import { useTranslations } from "next-intl";

export interface ActivityEvent {
  id: string;
  type: "registration" | "feedback" | "interaction" | "validation" | "simulation";
  agentName: string;
  description: string;
  timestamp: string;
}

const AGENT_NAMES: Record<number, string> = {
  1: "OracleBot",
  2: "TranslateAgent",
  3: "AnalystAgent",
};

const typeColors: Record<ActivityEvent["type"], string> = {
  registration: "bg-green-600",
  feedback: "bg-yellow-600",
  interaction: "bg-blue-600",
  validation: "bg-purple-600",
  simulation: "bg-cyan-600",
};

interface ActivityFeedProps {
  externalEvents?: ActivityEvent[];
}

export function ActivityFeed({ externalEvents }: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const t = useTranslations("ActivityFeed");

  const typeLabel = (type: ActivityEvent["type"]): string => {
    if (t.has(type)) return t(type);
    return type;
  };

  // Merge external events (from simulation) into the feed
  useEffect(() => {
    if (externalEvents && externalEvents.length > 0) {
      setEvents((prev) => {
        const newEvents = externalEvents.filter(
          (e) => !prev.some((p) => p.id === e.id)
        );
        if (newEvents.length === 0) return prev;
        return [...newEvents, ...prev].slice(0, 30);
      });
    }
  }, [externalEvents]);

  // Watch for on-chain Transfer events (agent registrations)
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.sepolia.identityRegistry,
    abi: identityRegistryAbi,
    eventName: "Transfer",
    onLogs(logs) {
      for (const log of logs) {
        const tokenId = Number(log.args.tokenId);
        const agentName = AGENT_NAMES[tokenId] || `Agent #${tokenId}`;
        setEvents((prev) => [
          {
            id: `transfer-${log.transactionHash}-${tokenId}`,
            type: "registration",
            agentName,
            description: t("registered", { id: String(tokenId) }),
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 29),
        ]);
      }
    },
  });

  // Watch for on-chain FeedbackGiven events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.sepolia.reputationRegistry,
    abi: reputationRegistryAbi,
    eventName: "FeedbackGiven",
    onLogs(logs) {
      for (const log of logs) {
        const agentId = Number(log.args.agentId);
        const agentName = AGENT_NAMES[agentId] || `Agent #${agentId}`;
        const value = Number(log.args.value);
        const stars = Math.round(value / 100);
        setEvents((prev) => [
          {
            id: `feedback-${log.transactionHash}-${agentId}`,
            type: "feedback",
            agentName,
            description: t("receivedFeedback", { stars: String(stars) }),
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 29),
        ]);
      }
    },
  });

  // Watch for on-chain Validated events
  useWatchContractEvent({
    address: CONTRACT_ADDRESSES.sepolia.validationRegistry,
    abi: validationRegistryAbi,
    eventName: "Validated",
    onLogs(logs) {
      for (const log of logs) {
        const agentId = Number(log.args.agentId);
        const agentName = AGENT_NAMES[agentId] || `Agent #${agentId}`;
        const validationType = log.args.validationType || "unknown";
        setEvents((prev) => [
          {
            id: `validation-${log.transactionHash}-${agentId}`,
            type: "validation",
            agentName,
            description: t("validated", { type: validationType as string }),
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 29),
        ]);
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">{t("live")}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div
                    className={`h-2 w-2 rounded-full mt-2 ${typeColors[event.type]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {event.agentName}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {typeLabel(event.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
