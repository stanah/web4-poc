"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimulationMessage } from "./simulation-message";
import { SCENARIOS } from "@/lib/ai/scenarios";
import type { SimulationEvent } from "@/lib/ai/simulation-engine";
import type { ActivityEvent } from "./activity-feed";

interface SimulationPanelProps {
  onActivityEvent?: (event: ActivityEvent) => void;
}

type SimulationStatus = "idle" | "running" | "complete" | "error";

export function SimulationPanel({ onActivityEvent }: SimulationPanelProps) {
  const [status, setStatus] = useState<SimulationStatus>("idle");
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [streamingContent, setStreamingContent] = useState<Record<number, string>>({});
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scenario = SCENARIOS[0];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, streamingContent]);

  const startSimulation = useCallback(async () => {
    setStatus("running");
    setEvents([]);
    setStreamingContent({});

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(
        `/api/simulation/stream?scenario=${scenario.id}`,
        { signal: controller.signal },
      );

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
            const event: SimulationEvent = JSON.parse(json);

            if (event.type === "agent-message-delta") {
              setStreamingContent((prev) => ({
                ...prev,
                [event.stepIndex]: (prev[event.stepIndex] || "") + (event.content || ""),
              }));
              continue;
            }

            if (event.type === "agent-message") {
              setStreamingContent((prev) => {
                const next = { ...prev };
                delete next[event.stepIndex];
                return next;
              });
              setEvents((prev) => [...prev, event]);
            } else if (event.type === "feedback-sent") {
              setEvents((prev) => [...prev, event]);
              onActivityEvent?.({
                id: `sim-feedback-${event.stepIndex}-${Date.now()}`,
                type: "simulation",
                agentName: event.from,
                description: `Paid ${event.to}: ${event.feedbackScore}/5 [${event.feedbackTags?.join(", ")}]`,
                timestamp: event.timestamp,
              });
            } else if (event.type === "simulation-complete") {
              setStatus("complete");
            } else if (event.type === "error") {
              setStatus("error");
            }
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
  }, [scenario.id, onActivityEvent]);

  const stopSimulation = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  // Build display items: finalized events + in-progress streaming
  const displayItems: SimulationEvent[] = [...events];
  for (const [stepIdx, content] of Object.entries(streamingContent)) {
    const step = scenario.steps[Number(stepIdx)];
    if (step) {
      displayItems.push({
        type: "agent-message",
        stepIndex: Number(stepIdx),
        from: step.action === "request" ? step.to : step.from,
        to: step.action === "request" ? step.from : step.to,
        action: step.action,
        content: content + " ▌",
        timestamp: new Date().toISOString(),
      });
    }
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">A2A Economy Simulation</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {scenario.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {status === "running" && (
              <Badge variant="default" className="bg-green-600 animate-pulse">
                Live
              </Badge>
            )}
            {status === "complete" && (
              <Badge variant="secondary">Complete</Badge>
            )}
            {status === "error" && (
              <Badge variant="destructive">Error</Badge>
            )}
            {status === "running" ? (
              <Button variant="outline" size="sm" onClick={stopSimulation}>
                Stop
              </Button>
            ) : (
              <Button size="sm" onClick={startSimulation}>
                {status === "idle" ? "Start Simulation" : "Restart"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
          {displayItems.length === 0 && status === "idle" ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <p className="text-4xl mb-4">🤖🔄🤖</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Watch AI agents collaborate in real-time. They request services
                from each other and pay with on-chain feedback.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {displayItems.map((event, i) => (
                  <SimulationMessage key={`${event.stepIndex}-${event.type}-${i}`} event={event} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
