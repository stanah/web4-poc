"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAgentMetadata } from "@/lib/contracts/hooks/use-agent-metadata";
import { ReputationBadge } from "@/components/reputation/reputation-badge";
import { FeedbackForm } from "@/components/reputation/feedback-form";
import { FeedbackList } from "@/components/reputation/feedback-list";
import { useReputationSummary } from "@/lib/contracts/hooks/use-reputation";
import { useAgentTokenURI } from "@/lib/contracts/hooks/use-identity";
import { useValidations, type Validation } from "@/lib/contracts/hooks/use-validation";
import { useTranslations } from "next-intl";
import { useTagLabel } from "@/lib/i18n/tag-utils";

function AgentProfile({ agentId }: { agentId: number }) {
  const { metadata: agent, isLoading: isLoadingAgent } = useAgentMetadata(agentId);
  const { data: summary } = useReputationSummary(agentId);
  const { data: tokenURI } = useAgentTokenURI(BigInt(agentId));
  const { data: validationsData } = useValidations(agentId);
  const validations = (validationsData as Validation[] | undefined) || [];
  const t = useTranslations("AgentProfile");
  const tc = useTranslations("Common");
  const getTagLabel = useTagLabel();

  const onChainScore = summary
    ? Number((summary as { averageValue: bigint }).averageValue) /
      Math.pow(10, (summary as { averageDecimals: number }).averageDecimals)
    : 0;
  const onChainFeedbackCount = summary
    ? Number((summary as { totalFeedback: bigint }).totalFeedback)
    : 0;

  if (isLoadingAgent) {
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
          {tc("agentNotFoundDesc", { id: String(agentId) })}
        </p>
        <Button asChild className="mt-4">
          <Link href="/marketplace">{tc("backToMarketplace")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start gap-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-3xl">
          {agent.name[0]}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <ReputationBadge score={onChainScore} />
          </div>
          <p className="text-muted-foreground">{agent.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {getTagLabel(tag)}
              </Badge>
            ))}
          </div>
          {tokenURI && (
            <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
              tokenURI: {tokenURI as string}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href={`/interact/${agent.id}`}>{t("chatWithAgent")}</Link>
        </Button>
      </motion.div>

      <Separator />

      {/* Services */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>{t("services")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agent.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <Badge variant="outline">{service.type}</Badge>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{service.name}</p>
                      {service.version && (
                        <Badge variant="secondary" className="text-xs">
                          v{service.version}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                    {service.endpoint && (
                      <p className="text-xs text-muted-foreground font-mono truncate mt-1">
                        {service.endpoint}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reputation */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">
              {onChainScore.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">{t("averageScore")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{onChainFeedbackCount}</div>
            <p className="text-sm text-muted-foreground">{t("totalReviews")}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Validations */}
      {validations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("validations")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {validations.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                  >
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      {v.validationType}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono text-muted-foreground truncate">
                        {t("validator")}: {v.validator}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(Number(v.timestamp) * 1000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Feedback */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <FeedbackForm agentId={agent.id} />
        <FeedbackList agentId={agent.id} />
      </motion.div>
    </div>
  );
}

export default function AgentProfilePage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const id = parseInt(agentId, 10);

  return <AgentProfile agentId={id} />;
}
