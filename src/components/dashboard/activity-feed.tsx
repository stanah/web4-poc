"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ActivityEvent {
  id: string;
  type: "registration" | "feedback" | "interaction" | "validation";
  agentName: string;
  description: string;
  timestamp: string;
}

const SEED_EVENTS: ActivityEvent[] = [
  {
    id: "1",
    type: "registration",
    agentName: "OracleBot",
    description: "Registered as Agent #1",
    timestamp: "2026-02-06T03:00:00Z",
  },
  {
    id: "2",
    type: "registration",
    agentName: "TranslateAgent",
    description: "Registered as Agent #2",
    timestamp: "2026-02-06T03:01:00Z",
  },
  {
    id: "3",
    type: "registration",
    agentName: "AnalystAgent",
    description: "Registered as Agent #3",
    timestamp: "2026-02-06T03:02:00Z",
  },
  {
    id: "4",
    type: "feedback",
    agentName: "OracleBot",
    description: "Received 5-star feedback [accuracy, speed]",
    timestamp: "2026-02-06T03:05:00Z",
  },
  {
    id: "5",
    type: "interaction",
    agentName: "TranslateAgent",
    description: "Completed translation request",
    timestamp: "2026-02-06T03:06:00Z",
  },
  {
    id: "6",
    type: "feedback",
    agentName: "AnalystAgent",
    description: "Received 4-star feedback [reliability]",
    timestamp: "2026-02-06T03:07:00Z",
  },
  {
    id: "7",
    type: "validation",
    agentName: "OracleBot",
    description: "Validated by 0x1234...abcd",
    timestamp: "2026-02-06T03:08:00Z",
  },
];

const LIVE_EVENTS: ActivityEvent[] = [
  {
    id: "live-1",
    type: "interaction",
    agentName: "OracleBot",
    description: "Price query: ETH/USD",
    timestamp: new Date().toISOString(),
  },
  {
    id: "live-2",
    type: "feedback",
    agentName: "TranslateAgent",
    description: "Received 5-star feedback [helpfulness]",
    timestamp: new Date().toISOString(),
  },
  {
    id: "live-3",
    type: "interaction",
    agentName: "AnalystAgent",
    description: "Market report generated",
    timestamp: new Date().toISOString(),
  },
  {
    id: "live-4",
    type: "feedback",
    agentName: "OracleBot",
    description: "Received 4-star feedback [reliability, speed]",
    timestamp: new Date().toISOString(),
  },
];

const typeColors: Record<ActivityEvent["type"], string> = {
  registration: "bg-green-600",
  feedback: "bg-yellow-600",
  interaction: "bg-blue-600",
  validation: "bg-purple-600",
};

export function ActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>(SEED_EVENTS);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      const event = LIVE_EVENTS[index % LIVE_EVENTS.length];
      setEvents((prev) => [
        {
          ...event,
          id: `live-${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 19),
      ]);
      index++;
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Activity Feed</CardTitle>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div
                    className={`h-2 w-2 rounded-full mt-2 ${typeColors[event.type]}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {event.agentName}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {event.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {event.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
