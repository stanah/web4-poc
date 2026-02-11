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
  {
    id: "creative-chain",
    title: "オリジナル作品 → 二次創作 → 評価チェーン",
    description:
      "PatronBotがIllustratorBotにイラストを依頼し、FanArtCreatorが二次創作、ArtCriticが評論する創作エコノミーの一連の流れ。",
    steps: [
      {
        from: "PatronBot",
        to: "IllustratorBot",
        action: "request",
        prompt:
          "桜と未来都市をテーマにしたコンセプトイラストを依頼したいです。春の穏やかさとテクノロジーの融合を表現してほしい。",
      },
      {
        from: "IllustratorBot",
        to: "PatronBot",
        action: "respond",
        prompt:
          "PatronBotからの「桜と未来都市」のイラスト依頼に対して、コンセプトとカラーパレット、構図の提案を行ってください。情熱を込めて回答してください。",
      },
      {
        from: "PatronBot",
        to: "IllustratorBot",
        action: "feedback",
        prompt: "IllustratorBotのコンセプト提案へのフィードバック",
        feedbackScore: 5,
        feedbackTags: ["creativity", "helpfulness"],
      },
      {
        from: "FanArtCreator",
        to: "IllustratorBot",
        action: "request",
        prompt:
          "「桜と未来都市」の作品がとても素敵で感動しました！この作品をベースに二次創作をさせていただきたいのですが、許可をいただけますか？夜バージョンで描いてみたいです。",
      },
      {
        from: "IllustratorBot",
        to: "FanArtCreator",
        action: "respond",
        prompt:
          "FanArtCreatorから二次創作の許可リクエストが来ました。クリエイターとして許可を出し、ライセンス条件やアドバイスを伝えてください。",
      },
      {
        from: "ArtCritic",
        to: "FanArtCreator",
        action: "request",
        prompt:
          "「桜と未来都市・夜バージョン」の二次創作について評論させていただきます。原作との比較も含めて批評をお聞きになりたいですか？",
      },
      {
        from: "FanArtCreator",
        to: "ArtCritic",
        action: "respond",
        prompt:
          "ArtCriticが二次創作を評論したいとのことです。作品コンセプト（夜の未来都市に浮かぶネオン桜、原作の昼間の穏やかさとの対比）を説明してください。",
      },
      {
        from: "ArtCritic",
        to: "FanArtCreator",
        action: "feedback",
        prompt: "FanArtCreatorの二次創作へのフィードバック",
        feedbackScore: 4,
        feedbackTags: ["creativity", "reliability"],
      },
    ],
  },
  {
    id: "collab-translate-promo",
    title: "コラボ制作 → 翻訳 → プロモーション",
    description:
      "PoetryBotとComposerAgentのコラボ制作、TranslateAgentの翻訳、PromoAgentのプロモーション展開。",
    steps: [
      {
        from: "PoetryBot",
        to: "ComposerAgent",
        action: "request",
        prompt:
          "新しく書いた詩に曲をつけていただけませんか？テーマは「月夜の海辺」。静かだが力強い生命力を感じる詩です。五七五七七のリズムを活かした曲をお願いします。",
      },
      {
        from: "ComposerAgent",
        to: "PoetryBot",
        action: "respond",
        prompt:
          "PoetryBotの「月夜の海辺」の詩に曲をつけるリクエストです。テンポ、キー、コード進行、楽器編成を含むコンセプトを提案してください。",
      },
      {
        from: "PoetryBot",
        to: "ComposerAgent",
        action: "feedback",
        prompt: "ComposerAgentの楽曲コンセプトへのフィードバック",
        feedbackScore: 5,
        feedbackTags: ["creativity", "helpfulness"],
      },
      {
        from: "ComposerAgent",
        to: "TranslateAgent",
        action: "request",
        prompt:
          "「月夜の海辺」という詩の歌詞を英語に翻訳してください。五七五七七のリズム感をできるだけ保ちつつ、英語として自然な歌詞にしてほしいです。",
      },
      {
        from: "TranslateAgent",
        to: "ComposerAgent",
        action: "respond",
        prompt:
          "ComposerAgentから「月夜の海辺」の歌詞の英語翻訳リクエストです。日本語の韻律を意識しながら、英語として歌える歌詞に翻訳してください。",
      },
      {
        from: "ComposerAgent",
        to: "TranslateAgent",
        action: "feedback",
        prompt: "TranslateAgentの歌詞翻訳へのフィードバック",
        feedbackScore: 4,
        feedbackTags: ["accuracy", "speed"],
      },
      {
        from: "PromoAgent",
        to: "ComposerAgent",
        action: "request",
        prompt:
          "PoetryBotとのコラボ楽曲「月夜の海辺」、素晴らしい作品ですね！この作品のプロモーション戦略を提案させてください。SNS展開を含めた企画をご用意します。",
      },
      {
        from: "ComposerAgent",
        to: "PromoAgent",
        action: "respond",
        prompt:
          "PromoAgentがコラボ楽曲のプロモーションを提案したいとのことです。作品の概要と特徴を伝えてください。",
      },
      {
        from: "PromoAgent",
        to: "ComposerAgent",
        action: "feedback",
        prompt: "ComposerAgentの作品情報提供へのフィードバック",
        feedbackScore: 4,
        feedbackTags: ["helpfulness", "reliability"],
      },
    ],
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
