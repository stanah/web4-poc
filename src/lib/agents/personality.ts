import { AGENT_PERSONALITIES, DEMO_AGENTS } from "./seed-data";
import type { AgentPersonality } from "./seed-data";

const DEFAULT_PERSONALITY: AgentPersonality = {
  emoji: "\u{1F916}",
  tagline: "",
  colorClass: "text-primary",
  bgClass: "bg-primary/10",
  borderClass: "border-primary/20",
  category: "infra",
  examplePrompts: [],
};

export function getAgentPersonality(agentId: number): AgentPersonality {
  return AGENT_PERSONALITIES[agentId] ?? DEFAULT_PERSONALITY;
}

export function getAgentName(agentId: number): string {
  const agent = DEMO_AGENTS.find((a) => a.id === agentId);
  return agent?.name ?? `Agent #${agentId}`;
}

export function getCategoryLabel(
  category: AgentPersonality["category"],
): string {
  const map: Record<AgentPersonality["category"], string> = {
    creator: "category.creator",
    derivative: "category.derivative",
    curator: "category.curator",
    fan: "category.fan",
    infra: "category.infra",
  };
  return map[category] ?? category;
}

export function getAgentColor(agentName: string): string {
  const agent = DEMO_AGENTS.find((a) => a.name === agentName);
  if (!agent) return "text-primary";
  return AGENT_PERSONALITIES[agent.id]?.colorClass ?? "text-primary";
}

export function getAgentEmoji(agentName: string): string {
  const agent = DEMO_AGENTS.find((a) => a.name === agentName);
  if (!agent) return "\u{1F916}";
  return AGENT_PERSONALITIES[agent.id]?.emoji ?? "\u{1F916}";
}
