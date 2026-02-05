export interface AgentMetadata {
  name: string;
  description: string;
  image?: string;
  services: AgentService[];
  tags: string[];
  owner?: `0x${string}`;
}

export interface AgentService {
  type: "MCP" | "A2A";
  name: string;
  description: string;
  endpoint?: string;
}

export interface AgentRegistration {
  agentId: bigint;
  uri: string;
  owner: `0x${string}`;
  metadata?: AgentMetadata;
}

export interface FeedbackEntry {
  from: `0x${string}`;
  value: bigint;
  decimals: number;
  tag1: `0x${string}`;
  tag2: `0x${string}`;
  timestamp: bigint;
}

export interface ReputationSummary {
  totalFeedback: bigint;
  averageValue: bigint;
  averageDecimals: number;
}

export const FEEDBACK_TAGS = {
  accuracy: "accuracy",
  speed: "speed",
  reliability: "reliability",
  creativity: "creativity",
  helpfulness: "helpfulness",
} as const;

export type FeedbackTag = keyof typeof FEEDBACK_TAGS;

export function tagToBytes32(tag: string): `0x${string}` {
  const hex = Buffer.from(tag.padEnd(32, "\0")).toString("hex");
  return `0x${hex}` as `0x${string}`;
}

export function bytes32ToTag(bytes: `0x${string}`): string {
  const hex = bytes.slice(2);
  const buf = Buffer.from(hex, "hex");
  return buf.toString("utf8").replace(/\0+$/, "");
}
