"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageBubble } from "./message-bubble";
import type { DemoAgent } from "@/lib/agents/seed-data";
import { useTranslations } from "next-intl";

interface ChatInterfaceProps {
  agent: DemoAgent;
}

export function ChatInterface({ agent }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("ChatInterface");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/interact",
      body: { agentId: agent.id },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-lg">
              {agent.name[0]}
            </div>
            <div>
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <p className="text-xs text-muted-foreground">
                Agent #{agent.id}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            {agent.services.map((s) => (
              <Badge key={s.name} variant="outline" className="text-xs">
                {s.type}: {s.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <MessageBubble
                role="assistant"
                agentName={agent.name}
                content={t("welcome", { name: agent.name, description: agent.description.split("。")[0] || agent.description.split(".")[0] })}
              />
            )}
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                agentName={msg.role === "assistant" ? agent.name : undefined}
                content={msg.parts
                  .map((part) => (part.type === "text" ? part.text : ""))
                  .join("")}
              />
            ))}
            {error && (
              <div className="flex justify-start">
                <div className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-sm">
                  {t("error")}
                </div>
              </div>
            )}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder={t("placeholder")}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
              {t("send")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
