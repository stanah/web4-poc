import type { AgentMetadata } from "@/lib/erc8004/types";
import type { ModelConfig } from "@/lib/ai/provider";

export interface DemoAgent extends AgentMetadata {
  id: number;
  registeredAt: string;
  feedbackCount: number;
  averageScore: number;
  model?: ModelConfig;
}

export const DEMO_AGENTS: DemoAgent[] = [
  {
    id: 1,
    name: "OracleBot",
    description:
      "集約データフィードによるリアルタイム暗号通貨価格オラクル。500以上の取引ペアをサブセカンドのレイテンシーでサポート。12の独立したデータプロバイダーにより検証済み。",
    image: "/agents/oracle-bot.svg",
    services: [
      {
        type: "MCP",
        name: "get_price",
        description: "取引ペアの現在価格を取得（例: ETH/USD）",
      },
      {
        type: "MCP",
        name: "compare_assets",
        description: "複数資産の価格パフォーマンスを比較",
      },
    ],
    tags: ["oracle", "defi", "price-feed"],
    model: { provider: "openrouter", modelId: "google/gemini-2.0-flash-001" },
    registeredAt: "2026-01-30T12:00:00Z",
    feedbackCount: 47,
    averageScore: 4.2,
  },
  {
    id: 2,
    name: "TranslateAgent",
    description:
      "95言語に対応した文脈対応翻訳を提供する多言語AI翻訳エージェント。技術文書やスマートコントラクトのドキュメント翻訳を専門とする。",
    image: "/agents/translate-agent.svg",
    services: [
      {
        type: "A2A",
        name: "translate",
        description: "サポートされている言語ペア間でテキストを翻訳",
      },
    ],
    tags: ["translation", "nlp", "multilingual"],
    model: { provider: "openrouter", modelId: "deepseek/deepseek-chat" },
    registeredAt: "2026-01-31T08:30:00Z",
    feedbackCount: 32,
    averageScore: 4.5,
  },
  {
    id: 3,
    name: "AnalystAgent",
    description:
      "オンチェーン分析・マーケットインテリジェンスエージェント。DeFiプロトコル、トークンメトリクス、ホエールアクティビティパターンに関する包括的なレポートを生成。",
    image: "/agents/analyst-agent.svg",
    services: [
      {
        type: "A2A",
        name: "analyze_protocol",
        description: "DeFiプロトコルのメトリクスとリスクの詳細分析",
      },
      {
        type: "A2A",
        name: "market_report",
        description: "指定トークンの市場サマリーレポートを生成",
      },
    ],
    tags: ["analytics", "defi", "research"],
    model: { provider: "openrouter", modelId: "qwen/qwen3-235b-a22b" },
    registeredAt: "2026-02-01T15:45:00Z",
    feedbackCount: 28,
    averageScore: 4.7,
  },
];

export function getAgentById(id: number): DemoAgent | undefined {
  return DEMO_AGENTS.find((a) => a.id === id);
}
