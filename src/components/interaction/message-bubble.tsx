"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  confidence?: number;
  agentName?: string;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

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
        {!isUser && message.agentName && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary">
              {message.agentName}
            </span>
            {message.confidence !== undefined && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {(message.confidence * 100).toFixed(0)}% conf.
              </Badge>
            )}
          </div>
        )}
        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        <div
          className={`text-[10px] mt-1 ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}
