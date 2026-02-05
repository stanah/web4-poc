"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { SimulationEvent } from "@/lib/ai/simulation-engine";

const AGENT_COLORS: Record<string, string> = {
  OracleBot: "text-amber-500",
  TranslateAgent: "text-blue-500",
  AnalystAgent: "text-emerald-500",
};

const ACTION_STYLES: Record<string, { bg: string; label: string }> = {
  request: { bg: "bg-blue-500/10 border-blue-500/20", label: "Request" },
  respond: { bg: "bg-emerald-500/10 border-emerald-500/20", label: "Response" },
  feedback: { bg: "bg-yellow-500/10 border-yellow-500/20", label: "Payment" },
};

interface SimulationMessageProps {
  event: SimulationEvent;
}

export function SimulationMessage({ event }: SimulationMessageProps) {
  const style = ACTION_STYLES[event.action] || ACTION_STYLES.request;

  if (event.action === "feedback") {
    return (
      <motion.div
        className="flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <span className="text-lg">💰</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm">
            <span className={`font-semibold ${AGENT_COLORS[event.from] || ""}`}>
              {event.from}
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={`font-semibold ${AGENT_COLORS[event.to] || ""}`}>
              {event.to}
            </span>
            <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-600/30">
              {event.feedbackScore}/5 ⭐
            </Badge>
          </div>
          {event.feedbackTags && (
            <div className="flex gap-1 mt-1">
              {event.feedbackTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`rounded-lg border p-4 ${style.bg}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-1 text-sm">
          <span className={`font-semibold ${AGENT_COLORS[event.from] || ""}`}>
            {event.from}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className={`font-semibold ${AGENT_COLORS[event.to] || ""}`}>
            {event.to}
          </span>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {style.label}
        </Badge>
      </div>
      {event.content && (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {event.content}
        </div>
      )}
    </motion.div>
  );
}
