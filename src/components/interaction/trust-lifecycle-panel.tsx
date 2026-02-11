"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface TrustLifecyclePanelProps {
  status: "idle" | "verifying" | "complete";
  agentId: number;
  agentName: string;
  protocol: string;
  score?: number;
  feedbackCount?: number;
  serviceName?: string;
}

const STEPS = [
  { icon: "\u{1FAAA}", key: "step1", detailKey: "step1Detail" },
  { icon: "\u2B50", key: "step2", detailKey: "step2Detail" },
  { icon: "\u{1F50D}", key: "step3", detailKey: "step3Detail" },
  { icon: "\u{1F517}", key: "step4", detailKey: "step4Detail" },
  { icon: "\u2705", key: "step5", detailKey: "step5Detail" },
];

export function TrustLifecyclePanel({
  status,
  agentId,
  agentName,
  protocol,
  score = 0,
  feedbackCount = 0,
  serviceName = "",
}: TrustLifecyclePanelProps) {
  const [activeStep, setActiveStep] = useState(-1);
  const t = useTranslations("TrustLifecycle");

  useEffect(() => {
    if (status === "verifying") {
      setActiveStep(0);
      const timers: ReturnType<typeof setTimeout>[] = [];
      for (let i = 1; i < STEPS.length; i++) {
        timers.push(setTimeout(() => setActiveStep(i), i * 500));
      }
      return () => timers.forEach(clearTimeout);
    }
    if (status === "complete") {
      setActiveStep(STEPS.length);
    }
    if (status === "idle") {
      setActiveStep(-1);
    }
  }, [status]);

  const getStepState = (index: number) => {
    if (status === "complete") return "complete";
    if (status === "idle") return "idle";
    if (index < activeStep) return "complete";
    if (index === activeStep) return "active";
    return "idle";
  };

  const getDetailText = (key: string) => {
    switch (key) {
      case "step1Detail":
        return t(key, { id: String(agentId) });
      case "step2Detail":
        return t(key, { score: score.toFixed(1), count: String(feedbackCount) });
      case "step3Detail":
        return t(key, { name: serviceName });
      case "step4Detail":
        return t(key, { protocol });
      case "step5Detail":
        return t(key);
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{t("title")}</CardTitle>
        <p className="text-[11px] text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const state = getStepState(i);
            return (
              <motion.div
                key={step.key}
                className={`flex items-start gap-3 rounded-lg p-3 border transition-all duration-300 ${
                  state === "complete"
                    ? "bg-green-500/10 border-green-500/20"
                    : state === "active"
                      ? "bg-primary/10 border-primary/30"
                      : "bg-muted/30 border-transparent"
                }`}
                initial={{ opacity: 0.5 }}
                animate={{
                  opacity: state === "idle" ? 0.5 : 1,
                  scale: state === "active" ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-xl flex-shrink-0">
                  {state === "complete" ? "\u2705" : step.icon}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-medium ${
                      state === "active"
                        ? "text-primary"
                        : state === "complete"
                          ? "text-green-600"
                          : "text-muted-foreground"
                    }`}
                  >
                    {t(step.key as "step1")}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {getDetailText(step.detailKey)}
                  </p>
                </div>
                {state === "active" && (
                  <div className="ml-auto flex-shrink-0">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
