"use client";

import { motion } from "framer-motion";

interface MessageBubbleProps {
  role: string;
  content: string;
  agentName?: string;
  agentEmoji?: string;
  agentColor?: string;
}

export function MessageBubble({ role, content, agentName, agentEmoji, agentColor }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted rounded-bl-sm"
        }`}
      >
        {!isUser && agentName && (
          <div className="mb-1">
            <span className={`text-xs font-medium ${agentColor || "text-primary"}`}>
              {agentEmoji && <span className="mr-1">{agentEmoji}</span>}
              {agentName}
            </span>
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap">{content}</div>
      </div>
    </motion.div>
  );
}
