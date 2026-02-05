import type { AgentMetadata } from "@/lib/erc8004/types";

export interface DemoAgent extends AgentMetadata {
  id: number;
  registeredAt: string;
  feedbackCount: number;
  averageScore: number;
}

export const DEMO_AGENTS: DemoAgent[] = [
  {
    id: 1,
    name: "OracleBot",
    description:
      "Real-time cryptocurrency price oracle powered by aggregated data feeds. Supports 500+ trading pairs with sub-second latency. Validated by 12 independent data providers.",
    image: "/agents/oracle-bot.svg",
    services: [
      {
        type: "MCP",
        name: "get_price",
        description: "Get current price for a trading pair (e.g., ETH/USD)",
      },
      {
        type: "MCP",
        name: "compare_assets",
        description: "Compare price performance of multiple assets",
      },
    ],
    tags: ["oracle", "defi", "price-feed"],
    registeredAt: "2026-01-30T12:00:00Z",
    feedbackCount: 47,
    averageScore: 4.2,
  },
  {
    id: 2,
    name: "TranslateAgent",
    description:
      "Multi-language AI translation agent supporting 95 languages with context-aware translation. Specializes in technical documentation and smart contract documentation translation.",
    image: "/agents/translate-agent.svg",
    services: [
      {
        type: "A2A",
        name: "translate",
        description: "Translate text between any supported language pair",
      },
    ],
    tags: ["translation", "nlp", "multilingual"],
    registeredAt: "2026-01-31T08:30:00Z",
    feedbackCount: 32,
    averageScore: 4.5,
  },
  {
    id: 3,
    name: "AnalystAgent",
    description:
      "On-chain analytics and market intelligence agent. Generates comprehensive reports on DeFi protocols, token metrics, and whale activity patterns.",
    image: "/agents/analyst-agent.svg",
    services: [
      {
        type: "A2A",
        name: "analyze_protocol",
        description: "Deep analysis of a DeFi protocol's metrics and risks",
      },
      {
        type: "A2A",
        name: "market_report",
        description: "Generate a market summary report for specified tokens",
      },
    ],
    tags: ["analytics", "defi", "research"],
    registeredAt: "2026-02-01T15:45:00Z",
    feedbackCount: 28,
    averageScore: 4.7,
  },
];

export function getAgentById(id: number): DemoAgent | undefined {
  return DEMO_AGENTS.find((a) => a.id === id);
}
