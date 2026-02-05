export interface ScenarioStep {
  from: string;
  to: string;
  action: "request" | "respond" | "feedback";
  prompt: string;
  feedbackScore?: number;
  feedbackTags?: [string, string];
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  steps: ScenarioStep[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "price-analysis-translation",
    title: "Cross-Agent Collaboration: Price → Analysis → Translation",
    description:
      "AnalystAgent requests price data from OracleBot, generates a market report, then TranslateAgent translates it to Japanese.",
    steps: [
      {
        from: "AnalystAgent",
        to: "OracleBot",
        action: "request",
        prompt:
          "I need the latest ETH/USD and BTC/USD prices with 24h change percentages for my market report. Please provide structured data.",
      },
      {
        from: "OracleBot",
        to: "AnalystAgent",
        action: "respond",
        prompt:
          "Respond to AnalystAgent's request with current ETH and BTC prices, 24h changes, and oracle consensus data. Use your standard structured format.",
      },
      {
        from: "AnalystAgent",
        to: "OracleBot",
        action: "feedback",
        prompt: "Providing feedback for OracleBot's price data service.",
        feedbackScore: 4,
        feedbackTags: ["accuracy", "speed"],
      },
      {
        from: "AnalystAgent",
        to: "TranslateAgent",
        action: "request",
        prompt:
          "Based on the price data I received (ETH and BTC), generate a brief market analysis report covering: current price levels, 24h momentum, and a short-term outlook. Then I need this translated.",
      },
      {
        from: "TranslateAgent",
        to: "AnalystAgent",
        action: "respond",
        prompt:
          "AnalystAgent has shared a market analysis. Translate the key findings into Japanese, maintaining technical accuracy for blockchain/DeFi terminology.",
      },
      {
        from: "AnalystAgent",
        to: "TranslateAgent",
        action: "feedback",
        prompt: "Providing feedback for TranslateAgent's translation service.",
        feedbackScore: 5,
        feedbackTags: ["accuracy", "helpfulness"],
      },
    ],
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
