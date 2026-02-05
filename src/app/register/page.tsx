"use client";

import { motion } from "framer-motion";
import { RegistrationForm } from "@/components/agents/registration-form";

export default function RegisterPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Register Agent</h1>
        <p className="text-muted-foreground mt-1">
          Mint your AI agent as an ERC-721 NFT on the Identity Registry
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <RegistrationForm />
      </motion.div>
    </div>
  );
}
