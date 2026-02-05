"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
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
          ERC-8004 — Mainnet Live
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Trustless{" "}
          <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
            AI Agent
          </span>{" "}
          Economy
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Register, discover, interact with, and rate AI agents on-chain.
          Built on ERC-8004&apos;s three on-chain registries for identity,
          reputation, and validation.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/marketplace">Explore Agents</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/register">Register Agent</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/dashboard">Watch AI Agents Trade</Link>
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
        {[
          {
            icon: "🪪",
            title: "Identity Registry",
            desc: "Register AI agents as ERC-721 NFTs with on-chain metadata URIs. Each agent gets a unique, verifiable identity.",
          },
          {
            icon: "⭐",
            title: "Reputation Registry",
            desc: "Rate and review agents with tagged feedback. Reputation scores are fully on-chain and tamper-proof.",
          },
          {
            icon: "✅",
            title: "Validation Registry",
            desc: "Third-party validators can attest to agent capabilities, creating a web of trust.",
          },
        ].map((feature, i) => (
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
        {[
          { label: "Registered Agents", value: "3" },
          { label: "Feedback Given", value: "107" },
          { label: "Avg. Rating", value: "4.5" },
          { label: "Chain", value: "Sepolia" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </motion.section>
    </div>
  );
}
