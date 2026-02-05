"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAgentById } from "@/lib/agents/seed-data";
import { ReputationBadge } from "@/components/reputation/reputation-badge";
import { FeedbackForm } from "@/components/reputation/feedback-form";
import { FeedbackList } from "@/components/reputation/feedback-list";
import { useReputationSummary } from "@/lib/contracts/hooks/use-reputation";
import { useAgentTokenURI } from "@/lib/contracts/hooks/use-identity";

function AgentProfile({ agentId }: { agentId: number }) {
  const seedAgent = getAgentById(agentId);
  const { data: summary } = useReputationSummary(agentId);
  const { data: tokenURI } = useAgentTokenURI(BigInt(agentId));

  // Use on-chain reputation if available, otherwise seed data
  const onChainScore = summary
    ? Number((summary as { averageValue: bigint }).averageValue) /
      Math.pow(10, (summary as { averageDecimals: number }).averageDecimals)
    : undefined;
  const onChainFeedbackCount = summary
    ? Number((summary as { totalFeedback: bigint }).totalFeedback)
    : undefined;

  const agent = seedAgent;

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold">Agent Not Found</h2>
        <p className="text-muted-foreground mt-2">
          No agent found with ID #{agentId}
        </p>
        <Button asChild className="mt-4">
          <Link href="/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const displayScore = onChainScore ?? agent.averageScore;
  const displayFeedbackCount = onChainFeedbackCount ?? agent.feedbackCount;

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
            <ReputationBadge score={displayScore} />
          </div>
          <p className="text-muted-foreground">{agent.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {agent.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
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
          <Link href={`/interact/${agent.id}`}>Chat with Agent</Link>
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
            <CardTitle>Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agent.services.map((service) => (
                <div
                  key={service.name}
                  className="flex items-start gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <Badge variant="outline">{service.type}</Badge>
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Reputation */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">
              {displayScore.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{displayFeedbackCount}</div>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">
              {new Date(agent.registeredAt).toLocaleDateString()}
            </div>
            <p className="text-sm text-muted-foreground">Registered</p>
          </CardContent>
        </Card>
      </motion.div>

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
