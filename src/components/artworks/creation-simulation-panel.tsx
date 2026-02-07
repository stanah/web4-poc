"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CreationEvent } from "@/lib/artworks/creation-engine";

type SimulationStatus = "idle" | "running" | "complete" | "error";

const AGENT_COLORS: Record<string, string> = {
  OracleBot: "text-amber-500",
  TranslateAgent: "text-blue-500",
  AnalystAgent: "text-emerald-500",
  System: "text-purple-500",
};

const EVENT_ICONS: Record<string, string> = {
  "creation-start": "🎨",
  "creation-delta": "",
  "creation-complete": "✅",
  "music-generation-start": "🎵",
  "music-generation-complete": "🎶",
  "purchase-start": "🛒",
  "purchase-complete": "💰",
  "derivative-start": "🔄",
  "derivative-delta": "",
  "derivative-complete": "✅",
  "revenue-distributed": "💎",
  "simulation-complete": "🎉",
  error: "❌",
};

const EVENT_COLORS: Record<string, string> = {
  "creation-start": "bg-purple-500/10 border-purple-500/20",
  "creation-complete": "bg-purple-500/10 border-purple-500/20",
  "music-generation-start": "bg-pink-500/10 border-pink-500/20",
  "music-generation-complete": "bg-pink-500/10 border-pink-500/20",
  "purchase-start": "bg-blue-500/10 border-blue-500/20",
  "purchase-complete": "bg-green-500/10 border-green-500/20",
  "derivative-start": "bg-orange-500/10 border-orange-500/20",
  "derivative-complete": "bg-orange-500/10 border-orange-500/20",
  "revenue-distributed": "bg-yellow-500/10 border-yellow-500/20",
  "simulation-complete": "bg-emerald-500/10 border-emerald-500/20",
  error: "bg-red-500/10 border-red-500/20",
};

interface CreationSimulationPanelProps {
  onComplete?: () => void;
}

export function CreationSimulationPanel({ onComplete }: CreationSimulationPanelProps) {
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [events, setEvents] = useState<CreationEvent[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingAgent, setStreamingAgent] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, streamingContent]);

  const startSimulation = useCallback(async () => {
    setStatus("running");
    setEvents([]);
    setStreamingContent("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/artworks/simulation/stream", {
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        setStatus("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6);

          try {
            const event: CreationEvent = JSON.parse(json);

            if (
              event.type === "creation-delta" ||
              event.type === "derivative-delta"
            ) {
              setStreamingContent((prev) => prev + (event.content || ""));
              setStreamingAgent(event.agentName);
              continue;
            }

            if (
              event.type === "creation-complete" ||
              event.type === "derivative-complete"
            ) {
              setStreamingContent("");
              setStreamingAgent("");
            }

            if (event.type === "simulation-complete") {
              setStatus("complete");
              onComplete?.();
            } else if (event.type === "error") {
              setStatus("error");
            }

            setEvents((prev) => [...prev, event]);
          } catch {
            // skip malformed JSON
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setStatus("error");
      }
    }
  }, [onComplete]);

  const stopSimulation = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              AI自律創作シミュレーション
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              創作 → 二次創作 → 購入 → 報酬分配
            </p>
          </div>
          <div className="flex items-center gap-2">
            {status === "running" && (
              <Badge
                variant="default"
                className="bg-green-600 animate-pulse"
              >
                ライブ
              </Badge>
            )}
            {status === "complete" && (
              <Badge variant="secondary">完了</Badge>
            )}
            {status === "error" && (
              <Badge variant="destructive">エラー</Badge>
            )}
            {status === "running" ? (
              <Button variant="outline" size="sm" onClick={stopSimulation}>
                停止
              </Button>
            ) : (
              <Button size="sm" onClick={startSimulation}>
                {status === "idle" ? "シミュレーション開始" : "再実行"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[600px] p-4" ref={scrollRef}>
          {events.length === 0 && status === "idle" ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <p className="text-4xl mb-4">🎨🔄💰</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                AIエージェントが自律的に作品を創作し、二次創作を行い、購入・報酬分配までの一連の流れを観察できます。
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {events.map((event, i) => (
                  <CreationEventMessage key={`${event.type}-${i}`} event={event} />
                ))}
                {streamingContent && (
                  <motion.div
                    className="rounded-lg border p-4 bg-purple-500/10 border-purple-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🖊️</span>
                      <span
                        className={`text-sm font-semibold ${AGENT_COLORS[streamingAgent] || ""}`}
                      >
                        {streamingAgent}
                      </span>
                      <Badge variant="outline" className="text-[10px] animate-pulse">
                        創作中...
                      </Badge>
                    </div>
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed font-mono">
                      {streamingContent} ▌
                    </pre>
                  </motion.div>
                )}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function CreationEventMessage({ event }: { event: CreationEvent }) {
  const icon = EVENT_ICONS[event.type] || "";
  const bg = EVENT_COLORS[event.type] || "bg-muted/50 border-muted";
  const agentColor = AGENT_COLORS[event.agentName] || "";

  // Revenue distribution event
  if (event.type === "revenue-distributed" && event.revenueDetails) {
    return (
      <motion.div
        className={`rounded-lg border p-4 ${bg}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span>{icon}</span>
          <span className="text-sm font-semibold">報酬分配</span>
        </div>
        <div className="space-y-2">
          {event.revenueDetails.map((detail, i) => (
            <div key={i} className="flex items-center justify-between text-sm px-2 py-1.5 bg-background/50 rounded">
              <div className="flex items-center gap-2">
                <span
                  className={`font-semibold ${AGENT_COLORS[detail.recipientAgent] || ""}`}
                >
                  {detail.recipientAgent}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${detail.type === "derivative-royalty" ? "border-orange-500/50 text-orange-600" : "border-green-500/50 text-green-600"}`}
                >
                  {detail.type === "derivative-royalty"
                    ? "ロイヤリティ (30%)"
                    : "販売収益 (70%)"}
                </Badge>
              </div>
              <span className="font-bold text-green-500">
                +{detail.amount.toFixed(1)} tokens
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Purchase events
  if (event.type === "purchase-complete" && event.revenueDetails) {
    return (
      <motion.div
        className={`rounded-lg border p-4 ${bg}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span>{icon}</span>
          <span className={`text-sm font-semibold ${agentColor}`}>
            {event.agentName}
          </span>
          <Badge variant="outline" className="text-[10px]">
            購入完了
          </Badge>
          {event.price && (
            <span className="text-xs text-green-500 font-bold ml-auto">
              {event.price} tokens
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{event.content}</p>
      </motion.div>
    );
  }

  // Creation/derivative complete
  if (
    event.type === "creation-complete" ||
    event.type === "derivative-complete"
  ) {
    return (
      <motion.div
        className={`rounded-lg border p-4 ${bg}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span>{icon}</span>
          <span className={`text-sm font-semibold ${agentColor}`}>
            {event.agentName}
          </span>
          <Badge variant="outline" className="text-[10px]">
            {event.type === "creation-complete" ? "創作完了" : "二次創作完了"}
          </Badge>
        </div>
        <p className="text-sm font-medium">{event.artworkTitle}</p>
        {event.content && (
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed mt-2 font-mono bg-background/50 rounded p-2 max-h-40 overflow-y-auto">
            {event.content}
          </pre>
        )}
        {event.musicMetadata && (
          <div className="flex items-center gap-2 mt-2 text-xs px-2 py-1.5 bg-pink-500/10 rounded">
            <span>♪</span>
            <span>{event.musicMetadata.genre}</span>
            <span>/</span>
            <span>{event.musicMetadata.bpm} BPM</span>
            <span>/</span>
            <span>Key: {event.musicMetadata.key}</span>
            <span>/</span>
            <span>{event.musicMetadata.duration}s</span>
          </div>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {event.price && <span>価格: {event.price} tokens</span>}
          {event.artworkId && <span>ID: #{event.artworkId}</span>}
        </div>
      </motion.div>
    );
  }

  // Music generation events
  if (
    event.type === "music-generation-start" ||
    event.type === "music-generation-complete"
  ) {
    return (
      <motion.div
        className={`rounded-lg border p-3 ${bg}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className={`text-sm font-semibold ${agentColor}`}>
            {event.agentName}
          </span>
          <Badge variant="outline" className="text-[10px] border-pink-500/50 text-pink-600">
            ACE-Step 1.5
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{event.content}</p>
        {event.musicMetadata && (
          <div className="flex items-center gap-2 mt-2 text-xs px-2 py-1.5 bg-pink-500/10 rounded">
            <span>♪</span>
            <span>{event.musicMetadata.genre}</span>
            <span>/</span>
            <span>{event.musicMetadata.bpm} BPM</span>
            <span>/</span>
            <span>Key: {event.musicMetadata.key}</span>
          </div>
        )}
      </motion.div>
    );
  }

  // Default event display
  return (
    <motion.div
      className={`rounded-lg border p-3 ${bg}`}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <span className={`text-sm font-semibold ${agentColor}`}>
          {event.agentName}
        </span>
        {event.artworkTitle && (
          <span className="text-xs text-muted-foreground">
            「{event.artworkTitle}」
          </span>
        )}
      </div>
      {event.content && (
        <p className="text-sm text-muted-foreground mt-1">{event.content}</p>
      )}
    </motion.div>
  );
}
