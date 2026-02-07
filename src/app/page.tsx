"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTotalAgents } from "@/lib/contracts/hooks/use-identity";
import { useReputationSummary } from "@/lib/contracts/hooks/use-reputation";
import { useTranslations } from "next-intl";

function useOnChainStats() {
  const { data: totalSupply } = useTotalAgents();
  const { data: summary1 } = useReputationSummary(1);
  const { data: summary2 } = useReputationSummary(2);
  const { data: summary3 } = useReputationSummary(3);

  const agents = totalSupply ? String(Number(totalSupply)) : "0";

  const summaries = [summary1, summary2, summary3]
    .filter(Boolean)
    .map((s) => {
      const sum = s as { totalFeedback: bigint; averageValue: bigint; averageDecimals: number };
      return {
        totalFeedback: Number(sum.totalFeedback),
        averageScore: Number(sum.averageValue) / Math.pow(10, sum.averageDecimals),
      };
    });

  const totalFeedback = String(summaries.reduce((acc, s) => acc + s.totalFeedback, 0));

  const avgRating = summaries.length > 0
    ? (summaries.reduce((acc, s) => acc + s.averageScore, 0) / summaries.length).toFixed(1)
    : "0";

  return { agents, totalFeedback, avgRating };
}

export default function HomePage() {
  const { agents, totalFeedback, avgRating } = useOnChainStats();
  const t = useTranslations("HomePage");

  const features = [
    {
      icon: "🪪",
      title: t("featureIdentityTitle"),
      desc: t("featureIdentityDesc"),
    },
    {
      icon: "⭐",
      title: t("featureReputationTitle"),
      desc: t("featureReputationDesc"),
    },
    {
      icon: "✅",
      title: t("featureValidationTitle"),
      desc: t("featureValidationDesc"),
    },
  ];

  const stats = [
    { label: t("statAgents"), value: agents },
    { label: t("statFeedback"), value: totalFeedback },
    { label: t("statRating"), value: avgRating },
    { label: t("statChain"), value: "Sepolia" },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-16">
      {/* Hero */}
      <motion.section
        className="text-center space-y-6 max-w-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Badge variant="outline" className="text-sm px-4 py-1">
          {t("badge")}
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          {t("title1")}{" "}
          <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            {t("titleHighlight")}
          </span>{" "}
          {t("title2")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("description")}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/marketplace">{t("exploreAgents")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">{t("registerAgent")}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/dashboard">{t("watchTrade")}</Link>
          </Button>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            className="rounded-xl border bg-card p-6 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <div className="text-3xl">{feature.icon}</div>
            <h3 className="font-semibold text-lg">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Stats */}
      <motion.section
        className="flex flex-wrap items-center justify-center gap-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.section>
    </div>
  );
}
