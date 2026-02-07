"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DemoAgent } from "@/lib/agents/seed-data";
import { useTranslations } from "next-intl";
import { useTagLabel } from "@/lib/i18n/tag-utils";

interface AgentCardProps {
  agent: DemoAgent;
  index?: number;
}

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= Math.round(score) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-muted-foreground">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export function AgentCard({ agent, index = 0 }: AgentCardProps) {
  const t = useTranslations("Common");
  const getTagLabel = useTagLabel();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
                {agent.name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{agent.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Agent #{agent.id}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {agent.services[0]?.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {agent.description}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {getTagLabel(tag)}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <StarRating score={agent.averageScore} />
            <span className="text-xs text-muted-foreground">
              {agent.feedbackCount} {t("reviews")}
            </span>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="default" size="sm" className="flex-1">
              <Link href={`/agents/${agent.id}`}>{t("profile")}</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/interact/${agent.id}`}>{t("interact")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
