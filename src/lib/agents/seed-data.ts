import type { AgentMetadata } from "@/lib/erc8004/types";
import type { ModelConfig } from "@/lib/ai/provider";

export interface AgentPersonality {
  emoji: string;
  tagline: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  category: "creator" | "derivative" | "curator" | "fan" | "infra";
  examplePrompts: string[];
}

export interface DemoAgent extends AgentMetadata {
  id: number;
  registeredAt: string;
  feedbackCount: number;
  averageScore: number;
  model?: ModelConfig;
  supportedTrust: string[];
}

// --- Model presets (cost-optimized for demo) ---
const MODELS = {
  geminiFlash: { provider: "openrouter", modelId: "google/gemini-2.0-flash-001" } as ModelConfig,
  deepseek: { provider: "openrouter", modelId: "deepseek/deepseek-chat" } as ModelConfig,
  qwen: { provider: "openrouter", modelId: "qwen/qwen3-235b-a22b" } as ModelConfig,
};

export const DEMO_AGENTS: DemoAgent[] = [
  // =============================================
  // Original Creators (8)
  // =============================================
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
        endpoint: "http://localhost:3000/api/agents/1/invoke",
        version: "1.0.0",
      },
      {
        type: "MCP",
        name: "compare_assets",
        description: "複数資産の価格パフォーマンスを比較",
        endpoint: "http://localhost:3000/api/agents/1/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["oracle", "defi", "price-feed"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-01-30T12:00:00Z",
    feedbackCount: 47,
    averageScore: 4.2,
  },
  {
    id: 4,
    name: "IllustratorBot",
    description:
      "デジタルイラスト専門のAIクリエイター。色彩理論と構図の知識を活かし、コンセプトアートからキャラクターデザインまで幅広い画風で制作。線の一本一本に魂を込める情熱派。",
    services: [
      {
        type: "A2A",
        name: "create_illustration",
        description: "テーマやコンセプトに基づくイラスト制作の提案・コンセプト設計",
        endpoint: "http://localhost:3000/api/agents/4/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["illustration", "art", "creativity"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-01-28T09:15:00Z",
    feedbackCount: 38,
    averageScore: 4.6,
  },
  {
    id: 5,
    name: "ComposerAgent",
    description:
      "楽曲制作AIエージェント。クラシックからエレクトロニカまで多彩なジャンルに対応。メロディ、ハーモニー、リズムの三要素を緻密に構成し、感情を揺さぶる音楽を創出。",
    services: [
      {
        type: "A2A",
        name: "compose_music",
        description: "テーマやムードに基づく楽曲コンセプトの提案・作曲",
        endpoint: "http://localhost:3000/api/agents/5/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["music", "composition", "creativity"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-01-29T14:30:00Z",
    feedbackCount: 29,
    averageScore: 4.4,
  },
  {
    id: 6,
    name: "PoetryBot",
    description:
      "詩と短歌を紡ぐAIポエット。日本の伝統的な韻律から現代自由詩まで、言葉の響きとリズムにこだわる。季語や情景描写を大切にし、読む人の心に余韻を残す作品を目指す。",
    services: [
      {
        type: "A2A",
        name: "write_poetry",
        description: "テーマや季節に基づく詩・短歌の創作",
        endpoint: "http://localhost:3000/api/agents/6/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["poetry", "literature", "creativity"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-01-27T11:00:00Z",
    feedbackCount: 42,
    averageScore: 4.5,
  },
  {
    id: 7,
    name: "PixelArtist",
    description:
      "レトロゲーム風ピクセルアート専門のクリエイター。限られたピクセル数で最大限の表現力を追求。ドット絵のキャラクター、背景、アイコンデザインを手がける。",
    services: [
      {
        type: "A2A",
        name: "create_pixel_art",
        description: "ピクセルアートのコンセプト設計・ドット絵の提案",
        endpoint: "http://localhost:3000/api/agents/7/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["pixel-art", "retro", "creativity"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-01T08:00:00Z",
    feedbackCount: 19,
    averageScore: 4.3,
  },
  {
    id: 8,
    name: "StoryWeaver",
    description:
      "短編小説とナラティブを紡ぐストーリーテラー。SF、ファンタジー、ミステリーなど多様なジャンルで、読者を物語の世界に引き込む。キャラクター造形と世界観構築が得意。",
    services: [
      {
        type: "A2A",
        name: "write_story",
        description: "テーマやジャンルに基づく短編小説・ナラティブの創作",
        endpoint: "http://localhost:3000/api/agents/8/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["story", "narrative", "creativity"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-01-26T16:20:00Z",
    feedbackCount: 35,
    averageScore: 4.7,
  },
  {
    id: 9,
    name: "CalligraphyBot",
    description:
      "書道とレタリングを極めるAIアーティスト。筆の運びと墨の濃淡で情感を表現。伝統的な書体から創作フォントまで、文字そのものをアートに昇華する。",
    services: [
      {
        type: "A2A",
        name: "create_calligraphy",
        description: "書道作品やレタリングデザインの提案・コンセプト設計",
        endpoint: "http://localhost:3000/api/agents/9/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["calligraphy", "typography", "art"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-02T10:45:00Z",
    feedbackCount: 14,
    averageScore: 4.1,
  },
  {
    id: 10,
    name: "SoundDesigner",
    description:
      "環境音と効果音のスペシャリスト。自然の音風景からサイバーパンクなSFXまで、空間を音で満たすサウンドスケープを設計。映像作品やゲームの音響演出を支援。",
    services: [
      {
        type: "A2A",
        name: "design_sound",
        description: "環境音・効果音のコンセプト設計と音響演出の提案",
        endpoint: "http://localhost:3000/api/agents/10/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["sound-design", "audio", "creativity"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-03T13:00:00Z",
    feedbackCount: 11,
    averageScore: 4.0,
  },

  // =============================================
  // Derivative / Remix (4)
  // =============================================
  {
    id: 11,
    name: "RemixMaster",
    description:
      "楽曲リミックスの達人。オリジナル作品のエッセンスを残しつつ、新たなビートやアレンジで全く異なる表情を与える。ジャンルの壁を越えた再解釈が持ち味。",
    services: [
      {
        type: "A2A",
        name: "remix_music",
        description: "既存楽曲のリミックスコンセプト提案・アレンジ設計",
        endpoint: "http://localhost:3000/api/agents/11/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["remix", "music", "derivative"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-02-01T11:30:00Z",
    feedbackCount: 22,
    averageScore: 4.3,
  },
  {
    id: 12,
    name: "FanArtCreator",
    description:
      "ファンアート二次創作のクリエイター。原作への深い敬意を持ちながら、独自の解釈と画風で新たな魅力を引き出す。キャラクターの新しい一面を見せることに情熱を注ぐ。",
    services: [
      {
        type: "A2A",
        name: "create_fan_art",
        description: "ファンアート・二次創作のコンセプト設計・提案",
        endpoint: "http://localhost:3000/api/agents/12/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["fan-art", "illustration", "derivative"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-02T15:00:00Z",
    feedbackCount: 26,
    averageScore: 4.4,
  },
  {
    id: 13,
    name: "MashupAgent",
    description:
      "異ジャンル融合のスペシャリスト。絵画と音楽、詩と映像など、異なる表現形式を大胆に組み合わせて予想外の化学反応を起こす。ボーダーレスな創作の可能性を追求。",
    services: [
      {
        type: "A2A",
        name: "create_mashup",
        description: "異ジャンル融合作品のコンセプト設計・提案",
        endpoint: "http://localhost:3000/api/agents/13/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["mashup", "fusion", "derivative"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-02-04T09:00:00Z",
    feedbackCount: 15,
    averageScore: 4.2,
  },
  {
    id: 14,
    name: "CoverArtist",
    description:
      "カバー・アレンジの専門家。原曲の魂を尊重しながら、異なるジャンルや楽器編成で新たな命を吹き込む。アコースティックからオーケストラまで幅広いアレンジが可能。",
    services: [
      {
        type: "A2A",
        name: "create_cover",
        description: "楽曲カバー・アレンジのコンセプト提案",
        endpoint: "http://localhost:3000/api/agents/14/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["cover", "arrangement", "music"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-03T17:30:00Z",
    feedbackCount: 18,
    averageScore: 4.1,
  },

  // =============================================
  // Curators / Critics (4)
  // =============================================
  {
    id: 15,
    name: "ArtCritic",
    description:
      "辛口だが愛のある芸術評論家AI。美術史の膨大な知識を背景に、作品の技術的完成度と表現の独自性を多角的に評価。厳しい批評の中にも必ず成長へのヒントを添える。",
    services: [
      {
        type: "A2A",
        name: "critique_art",
        description: "芸術作品の批評・評価・改善提案",
        endpoint: "http://localhost:3000/api/agents/15/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["critique", "art", "evaluation"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-01-29T10:00:00Z",
    feedbackCount: 31,
    averageScore: 3.9,
  },
  {
    id: 16,
    name: "CuratorBot",
    description:
      "展示企画と作品選定のキュレーターAI。テーマ性と文脈を重視し、作品群の中に物語を紡ぐ。バーチャルギャラリーの企画から作品解説まで、鑑賞体験全体をデザイン。",
    services: [
      {
        type: "A2A",
        name: "curate_exhibition",
        description: "展示企画・作品選定・ギャラリー構成の提案",
        endpoint: "http://localhost:3000/api/agents/16/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["curation", "exhibition", "art"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-01T14:00:00Z",
    feedbackCount: 20,
    averageScore: 4.5,
  },
  {
    id: 17,
    name: "TrendWatcher",
    description:
      "AI創作トレンドの分析官。作品の人気動向、ジャンルの盛衰、新興スタイルの兆候をリアルタイムで追跡。データに基づいたトレンドレポートでクリエイターの戦略立案を支援。",
    services: [
      {
        type: "A2A",
        name: "analyze_trends",
        description: "創作トレンドの分析・レポート生成",
        endpoint: "http://localhost:3000/api/agents/17/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["trend", "analytics", "market"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-02T08:30:00Z",
    feedbackCount: 24,
    averageScore: 4.3,
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
        endpoint: "http://localhost:3000/api/agents/3/invoke",
        version: "1.0.0",
      },
      {
        type: "A2A",
        name: "market_report",
        description: "指定トークンの市場サマリーレポートを生成",
        endpoint: "http://localhost:3000/api/agents/3/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["analytics", "defi", "research"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.qwen,
    registeredAt: "2026-02-01T15:45:00Z",
    feedbackCount: 28,
    averageScore: 4.7,
  },

  // =============================================
  // Fans / Consumers (4)
  // =============================================
  {
    id: 18,
    name: "CollectorAgent",
    description:
      "AI作品コレクターエージェント。審美眼と投資センスを兼ね備え、将来価値のある作品を見極める。コレクションのポートフォリオ管理と市場価値分析を提供。",
    services: [
      {
        type: "A2A",
        name: "evaluate_collection",
        description: "作品の収集価値評価・コレクション戦略の提案",
        endpoint: "http://localhost:3000/api/agents/18/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["collection", "investment", "evaluation"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-01-31T10:00:00Z",
    feedbackCount: 33,
    averageScore: 4.4,
  },
  {
    id: 19,
    name: "PatronBot",
    description:
      "AIアートのパトロン。優れたクリエイターを発掘し、制作を委託・支援する。作品の品質と独創性を重視し、クリエイターの成長を長期的に見守るメセナ精神の持ち主。",
    services: [
      {
        type: "A2A",
        name: "commission_work",
        description: "クリエイターへの制作委託・パトロネージ管理",
        endpoint: "http://localhost:3000/api/agents/19/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["patron", "commission", "support"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-01-28T16:00:00Z",
    feedbackCount: 41,
    averageScore: 4.6,
  },
  {
    id: 20,
    name: "PromoAgent",
    description:
      "作品プロモーションの専門家。クリエイターの作品を最適なオーディエンスに届けるマーケティング戦略を設計。SNS展開からプレスリリースまで、認知拡大を全面支援。",
    services: [
      {
        type: "A2A",
        name: "promote_work",
        description: "作品プロモーション戦略の立案・実行支援",
        endpoint: "http://localhost:3000/api/agents/20/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["promotion", "marketing", "strategy"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-03T11:00:00Z",
    feedbackCount: 16,
    averageScore: 4.0,
  },
  {
    id: 21,
    name: "FanClubBot",
    description:
      "熱狂的ファンコミュニティの盛り上げ役。推しクリエイターの新作情報をいち早くキャッチし、ファン同士の交流を促進。「素晴らしいです！！」が口癖の全力応援団長。",
    services: [
      {
        type: "A2A",
        name: "manage_fanclub",
        description: "ファンコミュニティの運営支援・イベント企画",
        endpoint: "http://localhost:3000/api/agents/21/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["fan-community", "community", "engagement"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-04T14:30:00Z",
    feedbackCount: 12,
    averageScore: 4.8,
  },

  // =============================================
  // Infrastructure / Support (5)
  // =============================================
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
        endpoint: "http://localhost:3000/api/agents/2/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["translation", "nlp", "multilingual"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-01-31T08:30:00Z",
    feedbackCount: 32,
    averageScore: 4.5,
  },
  {
    id: 22,
    name: "LicenseManager",
    description:
      "デジタル作品のライセンス管理エージェント。クリエイティブ・コモンズから商用ライセンスまで、権利関係を正確に管理。契約書のような厳密さで著作権を守る番人。",
    services: [
      {
        type: "MCP",
        name: "check_license",
        description: "作品のライセンス状況の確認・管理",
        endpoint: "http://localhost:3000/api/agents/22/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["license", "legal", "rights"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-01-30T09:00:00Z",
    feedbackCount: 25,
    averageScore: 4.3,
  },
  {
    id: 23,
    name: "RoyaltyTracker",
    description:
      "ロイヤリティ追跡と収益分配の管理エージェント。二次創作やリミックスの使用料を自動追跡し、オリジナルクリエイターへの公正な還元を保証。透明性の高い収益管理を実現。",
    services: [
      {
        type: "MCP",
        name: "track_royalty",
        description: "ロイヤリティの追跡・収益分配レポートの生成",
        endpoint: "http://localhost:3000/api/agents/23/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["royalty", "payment", "tracking"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-01T07:00:00Z",
    feedbackCount: 21,
    averageScore: 4.2,
  },
  {
    id: 24,
    name: "QualityAuditor",
    description:
      "作品の品質監査・検証エージェント。技術的完成度、オリジナリティ、著作権侵害リスクを多角的にチェック。品質基準を満たした作品にのみ認証を付与する厳格な審査官。",
    services: [
      {
        type: "A2A",
        name: "audit_quality",
        description: "作品の品質監査・検証・認証",
        endpoint: "http://localhost:3000/api/agents/24/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["quality", "audit", "verification"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.deepseek,
    registeredAt: "2026-02-02T12:00:00Z",
    feedbackCount: 17,
    averageScore: 4.1,
  },
  {
    id: 25,
    name: "StyleAdvisor",
    description:
      "クリエイティブスタイルのアドバイザー。作品の方向性やスタイルの改善提案を行い、クリエイターの個性を最大限に引き出す。トレンドを踏まえた実践的なアドバイスが強み。",
    services: [
      {
        type: "A2A",
        name: "advise_style",
        description: "クリエイティブスタイルの分析・改善提案",
        endpoint: "http://localhost:3000/api/agents/25/invoke",
        version: "1.0.0",
      },
    ],
    tags: ["style-advice", "consulting", "creativity"],
    supportedTrust: ["onchain-reputation"],
    model: MODELS.geminiFlash,
    registeredAt: "2026-02-04T16:00:00Z",
    feedbackCount: 9,
    averageScore: 4.0,
  },
];

export const AGENT_PERSONALITIES: Record<number, AgentPersonality> = {
  1: {
    emoji: "\u{1F52E}",
    tagline: "agentTagline.oracleBot",
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    category: "creator",
    examplePrompts: ["prompt.oracle.1", "prompt.oracle.2", "prompt.oracle.3"],
  },
  4: {
    emoji: "\u{1F3A8}",
    tagline: "agentTagline.illustratorBot",
    colorClass: "text-pink-500",
    bgClass: "bg-pink-500/10",
    borderClass: "border-pink-500/20",
    category: "creator",
    examplePrompts: ["prompt.illustrator.1", "prompt.illustrator.2", "prompt.illustrator.3"],
  },
  5: {
    emoji: "\u{1F3B5}",
    tagline: "agentTagline.composerAgent",
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/20",
    category: "creator",
    examplePrompts: ["prompt.composer.1", "prompt.composer.2", "prompt.composer.3"],
  },
  6: {
    emoji: "\u{1F4DD}",
    tagline: "agentTagline.poetryBot",
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/20",
    category: "creator",
    examplePrompts: ["prompt.poetry.1", "prompt.poetry.2", "prompt.poetry.3"],
  },
  7: {
    emoji: "\u{1F47E}",
    tagline: "agentTagline.pixelArtist",
    colorClass: "text-cyan-500",
    bgClass: "bg-cyan-500/10",
    borderClass: "border-cyan-500/20",
    category: "creator",
    examplePrompts: ["prompt.pixel.1", "prompt.pixel.2", "prompt.pixel.3"],
  },
  8: {
    emoji: "\u{1F4D6}",
    tagline: "agentTagline.storyWeaver",
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-500/10",
    borderClass: "border-indigo-500/20",
    category: "creator",
    examplePrompts: ["prompt.story.1", "prompt.story.2", "prompt.story.3"],
  },
  9: {
    emoji: "\u{1F58C}\uFE0F",
    tagline: "agentTagline.calligraphyBot",
    colorClass: "text-stone-500",
    bgClass: "bg-stone-500/10",
    borderClass: "border-stone-500/20",
    category: "creator",
    examplePrompts: ["prompt.calligraphy.1", "prompt.calligraphy.2", "prompt.calligraphy.3"],
  },
  10: {
    emoji: "\u{1F3A7}",
    tagline: "agentTagline.soundDesigner",
    colorClass: "text-teal-500",
    bgClass: "bg-teal-500/10",
    borderClass: "border-teal-500/20",
    category: "creator",
    examplePrompts: ["prompt.sound.1", "prompt.sound.2", "prompt.sound.3"],
  },
  11: {
    emoji: "\u{1F504}",
    tagline: "agentTagline.remixMaster",
    colorClass: "text-fuchsia-500",
    bgClass: "bg-fuchsia-500/10",
    borderClass: "border-fuchsia-500/20",
    category: "derivative",
    examplePrompts: ["prompt.remix.1", "prompt.remix.2", "prompt.remix.3"],
  },
  12: {
    emoji: "\u2728",
    tagline: "agentTagline.fanArtCreator",
    colorClass: "text-orange-500",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/20",
    category: "derivative",
    examplePrompts: ["prompt.fanart.1", "prompt.fanart.2", "prompt.fanart.3"],
  },
  13: {
    emoji: "\u{1F9E9}",
    tagline: "agentTagline.mashupAgent",
    colorClass: "text-lime-500",
    bgClass: "bg-lime-500/10",
    borderClass: "border-lime-500/20",
    category: "derivative",
    examplePrompts: ["prompt.mashup.1", "prompt.mashup.2", "prompt.mashup.3"],
  },
  14: {
    emoji: "\u{1F3A4}",
    tagline: "agentTagline.coverArtist",
    colorClass: "text-red-500",
    bgClass: "bg-red-500/10",
    borderClass: "border-red-500/20",
    category: "derivative",
    examplePrompts: ["prompt.cover.1", "prompt.cover.2", "prompt.cover.3"],
  },
  15: {
    emoji: "\u{1F9D0}",
    tagline: "agentTagline.artCritic",
    colorClass: "text-yellow-500",
    bgClass: "bg-yellow-500/10",
    borderClass: "border-yellow-500/20",
    category: "curator",
    examplePrompts: ["prompt.critic.1", "prompt.critic.2", "prompt.critic.3"],
  },
  16: {
    emoji: "\u{1F3DB}\uFE0F",
    tagline: "agentTagline.curatorBot",
    colorClass: "text-slate-500",
    bgClass: "bg-slate-500/10",
    borderClass: "border-slate-500/20",
    category: "curator",
    examplePrompts: ["prompt.curator.1", "prompt.curator.2", "prompt.curator.3"],
  },
  17: {
    emoji: "\u{1F4E1}",
    tagline: "agentTagline.trendWatcher",
    colorClass: "text-sky-500",
    bgClass: "bg-sky-500/10",
    borderClass: "border-sky-500/20",
    category: "curator",
    examplePrompts: ["prompt.trend.1", "prompt.trend.2", "prompt.trend.3"],
  },
  3: {
    emoji: "\u{1F4CA}",
    tagline: "agentTagline.analystAgent",
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
    category: "curator",
    examplePrompts: ["prompt.analyst.1", "prompt.analyst.2", "prompt.analyst.3"],
  },
  18: {
    emoji: "\u{1F48E}",
    tagline: "agentTagline.collectorAgent",
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
    category: "fan",
    examplePrompts: ["prompt.collector.1", "prompt.collector.2", "prompt.collector.3"],
  },
  19: {
    emoji: "\u{1F451}",
    tagline: "agentTagline.patronBot",
    colorClass: "text-yellow-600",
    bgClass: "bg-yellow-600/10",
    borderClass: "border-yellow-600/20",
    category: "fan",
    examplePrompts: ["prompt.patron.1", "prompt.patron.2", "prompt.patron.3"],
  },
  20: {
    emoji: "\u{1F4E2}",
    tagline: "agentTagline.promoAgent",
    colorClass: "text-orange-500",
    bgClass: "bg-orange-500/10",
    borderClass: "border-orange-500/20",
    category: "fan",
    examplePrompts: ["prompt.promo.1", "prompt.promo.2", "prompt.promo.3"],
  },
  21: {
    emoji: "\u{1F495}",
    tagline: "agentTagline.fanClubBot",
    colorClass: "text-pink-500",
    bgClass: "bg-pink-500/10",
    borderClass: "border-pink-500/20",
    category: "fan",
    examplePrompts: ["prompt.fanclub.1", "prompt.fanclub.2", "prompt.fanclub.3"],
  },
  2: {
    emoji: "\u{1F310}",
    tagline: "agentTagline.translateAgent",
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
    category: "infra",
    examplePrompts: ["prompt.translate.1", "prompt.translate.2", "prompt.translate.3"],
  },
  22: {
    emoji: "\u{1F4DC}",
    tagline: "agentTagline.licenseManager",
    colorClass: "text-gray-500",
    bgClass: "bg-gray-500/10",
    borderClass: "border-gray-500/20",
    category: "infra",
    examplePrompts: ["prompt.license.1", "prompt.license.2", "prompt.license.3"],
  },
  23: {
    emoji: "\u{1F4B0}",
    tagline: "agentTagline.royaltyTracker",
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    category: "infra",
    examplePrompts: ["prompt.royalty.1", "prompt.royalty.2", "prompt.royalty.3"],
  },
  24: {
    emoji: "\u2705",
    tagline: "agentTagline.qualityAuditor",
    colorClass: "text-green-500",
    bgClass: "bg-green-500/10",
    borderClass: "border-green-500/20",
    category: "infra",
    examplePrompts: ["prompt.quality.1", "prompt.quality.2", "prompt.quality.3"],
  },
  25: {
    emoji: "\u{1F4A1}",
    tagline: "agentTagline.styleAdvisor",
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    borderClass: "border-violet-500/20",
    category: "infra",
    examplePrompts: ["prompt.style.1", "prompt.style.2", "prompt.style.3"],
  },
};

export function getAgentById(id: number): DemoAgent | undefined {
  return DEMO_AGENTS.find((a) => a.id === id);
}
