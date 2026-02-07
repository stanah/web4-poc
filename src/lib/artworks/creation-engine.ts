import { streamText } from "ai";
import { getModel } from "@/lib/ai/provider";
import { getAgentById } from "@/lib/agents/seed-data";
import { addArtwork, purchaseArtwork, getArtworkById } from "./store";
import type { ArtworkStyle, LicenseType, MusicMetadata } from "./types";
import {
  generateMusic,
  checkAceStepHealth,
  parseGenreFromPrompt,
  MusicGenerationError,
} from "./music-client";

const STYLE_PROMPTS: Record<ArtworkStyle, string> = {
  poem: "自由詩の形式で作品を作成してください。改行と余白を活かし、リズム感のある詩にしてください。",
  haiku: "俳句（五七五）の形式で作品を作成してください。複数の俳句を連ねても構いません。季語を含めてください。",
  "ascii-art":
    "ASCIIアートの形式で作品を作成してください。テキスト文字だけで視覚的な表現を行ってください。",
  "short-story":
    "短編小説の形式で作品を作成してください。200字以内の短い物語にしてください。",
  "code-art":
    "プログラムコードの形式で芸術的な作品を作成してください。コードそのものが美しい視覚表現になるようにしてください。",
  "generative-svg":
    "SVGコードで視覚アートを作成してください。幾何学的パターンや抽象的な表現を使ってください。viewBox='0 0 400 300'で作成してください。",
  music:
    "楽曲の歌詞を作成してください。[verse], [chorus], [bridge] などのセクションタグを使い、楽曲構成を明確にしてください。",
};

export type CreationEventType =
  | "creation-start"
  | "creation-delta"
  | "creation-complete"
  | "music-generation-start"
  | "music-generation-complete"
  | "purchase-start"
  | "purchase-complete"
  | "derivative-start"
  | "derivative-delta"
  | "derivative-complete"
  | "revenue-distributed"
  | "simulation-complete"
  | "error";

export interface CreationEvent {
  type: CreationEventType;
  agentName: string;
  artworkTitle?: string;
  artworkId?: number;
  content?: string;
  price?: number;
  revenueDetails?: {
    recipientAgent: string;
    amount: number;
    type: "sale" | "derivative-royalty";
  }[];
  musicMetadata?: MusicMetadata;
  timestamp: string;
}

interface CreateArtworkParams {
  creatorAgentId: number;
  theme: string;
  style: ArtworkStyle;
  license?: LicenseType;
  tags?: string[];
}

interface CreateMusicParams {
  creatorAgentId: number;
  theme: string;
  musicPrompt: string;
  duration?: number;
  license?: LicenseType;
  tags?: string[];
}

interface CreateDerivativeParams {
  creatorAgentId: number;
  parentArtworkId: number;
  style?: ArtworkStyle;
  transformDescription: string;
  tags?: string[];
}

export async function* createArtworkAutonomously(
  params: CreateArtworkParams,
): AsyncGenerator<CreationEvent> {
  const agent = getAgentById(params.creatorAgentId);
  if (!agent) {
    yield {
      type: "error",
      agentName: "Unknown",
      content: "Agent not found",
      timestamp: new Date().toISOString(),
    };
    return;
  }

  yield {
    type: "creation-start",
    agentName: agent.name,
    content: `テーマ「${params.theme}」で${params.style}を創作中...`,
    timestamp: new Date().toISOString(),
  };

  const model = agent.model ? getModel(agent.model) : getModel();
  const stylePrompt = STYLE_PROMPTS[params.style];

  const result = streamText({
    model,
    system: `あなたは${agent.name}です。AIアーティストとして作品を創作します。
${agent.description}

以下のルールに従ってください：
- 作品のみを出力してください（説明や前置きは不要）
- ${stylePrompt}
- テーマに忠実に、独創的な作品を創作してください
- あなたのエージェントとしての専門性を活かした表現をしてください`,
    messages: [
      {
        role: "user",
        content: `テーマ: 「${params.theme}」\nスタイル: ${params.style}\n\nこのテーマで作品を創作してください。`,
      },
    ],
  });

  let fullContent = "";
  for await (const chunk of result.textStream) {
    fullContent += chunk;
    yield {
      type: "creation-delta",
      agentName: agent.name,
      content: chunk,
      timestamp: new Date().toISOString(),
    };
  }

  // Generate title using AI
  const titleResult = streamText({
    model,
    messages: [
      {
        role: "user",
        content: `以下の作品に短いタイトルを付けてください。タイトルのみを出力してください（15文字以内）。\n\n${fullContent.slice(0, 300)}`,
      },
    ],
  });

  let title = "";
  for await (const chunk of titleResult.textStream) {
    title += chunk;
  }
  title = title.trim().replace(/[「」『』]/g, "").slice(0, 30);

  const price = 20 + Math.floor(Math.random() * 60);
  const artwork = addArtwork({
    title,
    description: `${agent.name}が「${params.theme}」をテーマに自律的に創作した${params.style}作品。`,
    content: fullContent,
    style: params.style,
    creatorAgentId: params.creatorAgentId,
    createdAt: new Date().toISOString(),
    price,
    parentArtworkId: null,
    tags: params.tags || [params.style, params.theme],
    license: params.license || "commercial",
  });

  yield {
    type: "creation-complete",
    agentName: agent.name,
    artworkTitle: artwork.title,
    artworkId: artwork.id,
    content: fullContent,
    price: artwork.price,
    timestamp: new Date().toISOString(),
  };
}

export async function* createMusicAutonomously(
  params: CreateMusicParams,
): AsyncGenerator<CreationEvent> {
  const agent = getAgentById(params.creatorAgentId);
  if (!agent) {
    yield {
      type: "error",
      agentName: "Unknown",
      content: "Agent not found",
      timestamp: new Date().toISOString(),
    };
    return;
  }

  // Step 1: AI generates lyrics based on the theme
  yield {
    type: "creation-start",
    agentName: agent.name,
    content: `テーマ「${params.theme}」で楽曲を制作中... まず歌詞を生成します。`,
    timestamp: new Date().toISOString(),
  };

  const model = agent.model ? getModel(agent.model) : getModel();

  const lyricsResult = streamText({
    model,
    system: `あなたは${agent.name}です。AIミュージシャンとして楽曲の歌詞を作成します。
${agent.description}

以下のルールに従ってください：
- [verse], [chorus], [bridge], [outro] などのセクションタグを使用してください
- テーマに忠実で、感情的な深みのある歌詞を書いてください
- 歌詞のみを出力してください（説明や前置きは不要）`,
    messages: [
      {
        role: "user",
        content: `テーマ: 「${params.theme}」\n音楽スタイル: ${params.musicPrompt}\n\nこのテーマと音楽スタイルに合った歌詞を作成してください。`,
      },
    ],
  });

  let lyrics = "";
  for await (const chunk of lyricsResult.textStream) {
    lyrics += chunk;
    yield {
      type: "creation-delta",
      agentName: agent.name,
      content: chunk,
      timestamp: new Date().toISOString(),
    };
  }

  // Step 2: Generate music via ACE-Step 1.5
  yield {
    type: "music-generation-start",
    agentName: agent.name,
    content: `歌詞生成完了。ACE-Step 1.5で楽曲を生成中... (${params.duration || 60}秒)`,
    timestamp: new Date().toISOString(),
  };

  const { genre, key, bpm } = parseGenreFromPrompt(params.musicPrompt);
  let audioUrl = "";
  let actualDuration = params.duration || 60;

  const aceStepAvailable = await checkAceStepHealth();

  if (aceStepAvailable) {
    try {
      const musicResult = await generateMusic({
        prompt: params.musicPrompt,
        lyrics,
        duration: params.duration || 60,
        infer_steps: 60,
        guidance_scale: 15,
        scheduler_type: "euler",
        cfg_type: "apg",
      });

      audioUrl = musicResult.audioUrl;
      actualDuration = musicResult.duration;
    } catch (err) {
      const errMsg =
        err instanceof MusicGenerationError ? err.message : "Unknown error";
      yield {
        type: "error",
        agentName: agent.name,
        content: `ACE-Step楽曲生成エラー: ${errMsg}。歌詞のみで作品を登録します。`,
        timestamp: new Date().toISOString(),
      };
    }
  } else {
    yield {
      type: "music-generation-start",
      agentName: agent.name,
      content:
        "ACE-Stepサーバー未接続。歌詞と楽曲メタデータのみで作品を登録します。",
      timestamp: new Date().toISOString(),
    };
  }

  const musicMetadata: MusicMetadata = {
    genre,
    bpm,
    duration: actualDuration,
    key,
    lyrics,
    audioUrl,
  };

  yield {
    type: "music-generation-complete",
    agentName: agent.name,
    content: audioUrl
      ? `楽曲生成完了。${genre} / ${bpm}BPM / Key: ${key} / ${actualDuration}秒`
      : `楽曲メタデータ生成完了（オーディオ未生成）。${genre} / ${bpm}BPM / Key: ${key}`,
    musicMetadata,
    timestamp: new Date().toISOString(),
  };

  // Step 3: Generate title
  const titleResult = streamText({
    model,
    messages: [
      {
        role: "user",
        content: `以下は「${params.theme}」をテーマにした${genre}楽曲の歌詞です。この楽曲に短いタイトルを付けてください。タイトルのみを出力してください（15文字以内）。\n\n${lyrics.slice(0, 300)}`,
      },
    ],
  });

  let title = "";
  for await (const chunk of titleResult.textStream) {
    title += chunk;
  }
  title = title.trim().replace(/[「」『』]/g, "").slice(0, 30);

  const price = 40 + Math.floor(Math.random() * 60);
  const artwork = addArtwork({
    title,
    description: `${agent.name}がACE-Step 1.5を使用して「${params.theme}」をテーマに自律制作した${genre}楽曲。`,
    content: lyrics,
    style: "music",
    creatorAgentId: params.creatorAgentId,
    createdAt: new Date().toISOString(),
    price,
    parentArtworkId: null,
    tags: params.tags || ["music", genre, params.theme],
    license: params.license || "commercial",
    musicMetadata,
  });

  yield {
    type: "creation-complete",
    agentName: agent.name,
    artworkTitle: artwork.title,
    artworkId: artwork.id,
    content: lyrics,
    price: artwork.price,
    musicMetadata,
    timestamp: new Date().toISOString(),
  };
}

export async function* createDerivativeAutonomously(
  params: CreateDerivativeParams,
): AsyncGenerator<CreationEvent> {
  const agent = getAgentById(params.creatorAgentId);
  const parentArtwork = getArtworkById(params.parentArtworkId);

  if (!agent || !parentArtwork) {
    yield {
      type: "error",
      agentName: agent?.name || "Unknown",
      content: "Agent or parent artwork not found",
      timestamp: new Date().toISOString(),
    };
    return;
  }

  if (parentArtwork.license === "exclusive") {
    yield {
      type: "error",
      agentName: agent.name,
      content: `「${parentArtwork.title}」は独占ライセンスのため二次創作できません`,
      timestamp: new Date().toISOString(),
    };
    return;
  }

  // Step 1: Purchase the original
  yield {
    type: "purchase-start",
    agentName: agent.name,
    artworkTitle: parentArtwork.title,
    artworkId: parentArtwork.id,
    price: parentArtwork.price,
    content: `「${parentArtwork.title}」を購入中...`,
    timestamp: new Date().toISOString(),
  };

  const purchaseResult = purchaseArtwork(
    parentArtwork.id,
    params.creatorAgentId,
    `二次創作の原作として: ${params.transformDescription}`,
  );

  if (purchaseResult) {
    const parentCreator = getAgentById(parentArtwork.creatorAgentId);
    yield {
      type: "purchase-complete",
      agentName: agent.name,
      artworkTitle: parentArtwork.title,
      artworkId: parentArtwork.id,
      price: parentArtwork.price,
      revenueDetails: purchaseResult.revenueEntries.map((r) => ({
        recipientAgent: getAgentById(r.recipientAgentId)?.name || "Unknown",
        amount: r.amount,
        type: r.type,
      })),
      content: `購入完了。${parentCreator?.name}に${parentArtwork.price}トークン支払い。`,
      timestamp: new Date().toISOString(),
    };
  }

  // Step 2: Create derivative
  const style = params.style || parentArtwork.style;
  const stylePrompt = STYLE_PROMPTS[style];

  yield {
    type: "derivative-start",
    agentName: agent.name,
    artworkTitle: parentArtwork.title,
    content: `「${parentArtwork.title}」を基に二次創作中: ${params.transformDescription}`,
    timestamp: new Date().toISOString(),
  };

  const model = agent.model ? getModel(agent.model) : getModel();

  const result = streamText({
    model,
    system: `あなたは${agent.name}です。AIアーティストとして二次創作を行います。
${agent.description}

以下のルールに従ってください：
- 原作の要素を活かしながら、あなた独自の解釈と表現を加えてください
- ${stylePrompt}
- 作品のみを出力してください（説明や前置きは不要）
- 原作へのリスペクトを忘れずに`,
    messages: [
      {
        role: "user",
        content: `原作「${parentArtwork.title}」:\n\n${parentArtwork.content}\n\n---\n\n変換指示: ${params.transformDescription}\nスタイル: ${style}\n\nこの原作を基に二次創作してください。`,
      },
    ],
  });

  let fullContent = "";
  for await (const chunk of result.textStream) {
    fullContent += chunk;
    yield {
      type: "derivative-delta",
      agentName: agent.name,
      content: chunk,
      timestamp: new Date().toISOString(),
    };
  }

  const titleResult = streamText({
    model,
    messages: [
      {
        role: "user",
        content: `以下は「${parentArtwork.title}」の二次創作です。この二次創作に短いタイトルを付けてください。タイトルのみを出力してください（15文字以内）。\n\n${fullContent.slice(0, 300)}`,
      },
    ],
  });

  let title = "";
  for await (const chunk of titleResult.textStream) {
    title += chunk;
  }
  title = title.trim().replace(/[「」『』]/g, "").slice(0, 30);

  const price = Math.max(15, parentArtwork.price - 10 + Math.floor(Math.random() * 30));
  const artwork = addArtwork({
    title,
    description: `${agent.name}が「${parentArtwork.title}」を基に創作した二次創作。${params.transformDescription}`,
    content: fullContent,
    style,
    creatorAgentId: params.creatorAgentId,
    createdAt: new Date().toISOString(),
    price,
    parentArtworkId: parentArtwork.id,
    tags: [...new Set([...parentArtwork.tags, "derivative", style])],
    license: "commercial",
  });

  yield {
    type: "derivative-complete",
    agentName: agent.name,
    artworkTitle: artwork.title,
    artworkId: artwork.id,
    content: fullContent,
    price: artwork.price,
    timestamp: new Date().toISOString(),
  };
}

export async function* runArtworkSimulation(): AsyncGenerator<CreationEvent> {
  // Step 1: AnalystAgent creates an original poem about Web4
  const createGen = createArtworkAutonomously({
    creatorAgentId: 3,
    theme: "AIエージェントの自律経済",
    style: "poem",
    tags: ["web4", "ai-economy", "autonomous"],
  });

  let createdArtworkId: number | undefined;
  for await (const event of createGen) {
    yield event;
    if (event.type === "creation-complete") {
      createdArtworkId = event.artworkId;
    }
  }

  if (!createdArtworkId) return;

  // Brief pause
  await new Promise((r) => setTimeout(r, 500));

  // Step 2: TranslateAgent creates a derivative (haiku translation)
  const deriveGen = createDerivativeAutonomously({
    creatorAgentId: 2,
    parentArtworkId: createdArtworkId,
    style: "haiku",
    transformDescription: "原作の詩を多言語俳句に変換。日本語・英語・中国語の三言語で表現。",
    tags: ["multilingual", "haiku", "translation"],
  });

  let derivativeArtworkId: number | undefined;
  for await (const event of deriveGen) {
    yield event;
    if (event.type === "derivative-complete") {
      derivativeArtworkId = event.artworkId;
    }
  }

  await new Promise((r) => setTimeout(r, 500));

  // Step 3: OracleBot purchases the derivative
  if (derivativeArtworkId) {
    const derivativeArtwork = getArtworkById(derivativeArtworkId);
    if (derivativeArtwork) {
      yield {
        type: "purchase-start",
        agentName: "OracleBot",
        artworkTitle: derivativeArtwork.title,
        artworkId: derivativeArtwork.id,
        price: derivativeArtwork.price,
        content: `OracleBotが「${derivativeArtwork.title}」を購入中...`,
        timestamp: new Date().toISOString(),
      };

      const purchaseResult = purchaseArtwork(
        derivativeArtwork.id,
        1,
        "多言語データフィード用の表現参考として",
      );

      if (purchaseResult) {
        yield {
          type: "purchase-complete",
          agentName: "OracleBot",
          artworkTitle: derivativeArtwork.title,
          artworkId: derivativeArtwork.id,
          price: derivativeArtwork.price,
          revenueDetails: purchaseResult.revenueEntries.map((r) => ({
            recipientAgent: getAgentById(r.recipientAgentId)?.name || "Unknown",
            amount: r.amount,
            type: r.type,
          })),
          content: "購入完了。報酬が各クリエイターに分配されました。",
          timestamp: new Date().toISOString(),
        };

        yield {
          type: "revenue-distributed",
          agentName: "System",
          content: "報酬分配完了",
          revenueDetails: purchaseResult.revenueEntries.map((r) => ({
            recipientAgent: getAgentById(r.recipientAgentId)?.name || "Unknown",
            amount: r.amount,
            type: r.type,
          })),
          timestamp: new Date().toISOString(),
        };
      }
    }
  }

  await new Promise((r) => setTimeout(r, 500));

  // Step 4: OracleBot creates a music track inspired by the original poem (via ACE-Step 1.5)
  const musicGen = createMusicAutonomously({
    creatorAgentId: 1,
    theme: "AIエージェントの自律経済",
    musicPrompt:
      "electronic ambient, blockchain theme, futuristic, synth pads, 128 bpm, Am key, ethereal vocals",
    duration: 60,
    tags: ["music", "electronic", "ambient", "ai-economy"],
  });

  let musicArtworkId: number | undefined;
  for await (const event of musicGen) {
    yield event;
    if (event.type === "creation-complete") {
      musicArtworkId = event.artworkId;
    }
  }

  await new Promise((r) => setTimeout(r, 500));

  // Step 5: TranslateAgent purchases the music track
  if (musicArtworkId) {
    const musicArtwork = getArtworkById(musicArtworkId);
    if (musicArtwork) {
      yield {
        type: "purchase-start",
        agentName: "TranslateAgent",
        artworkTitle: musicArtwork.title,
        artworkId: musicArtwork.id,
        price: musicArtwork.price,
        content: `TranslateAgentが「${musicArtwork.title}」を購入中...`,
        timestamp: new Date().toISOString(),
      };

      const musicPurchaseResult = purchaseArtwork(
        musicArtwork.id,
        2,
        "多言語翻訳サービスのBGMおよび音響ブランディング素材として",
      );

      if (musicPurchaseResult) {
        yield {
          type: "purchase-complete",
          agentName: "TranslateAgent",
          artworkTitle: musicArtwork.title,
          artworkId: musicArtwork.id,
          price: musicArtwork.price,
          revenueDetails: musicPurchaseResult.revenueEntries.map((r) => ({
            recipientAgent: getAgentById(r.recipientAgentId)?.name || "Unknown",
            amount: r.amount,
            type: r.type,
          })),
          content: "購入完了。報酬がクリエイターに分配されました。",
          timestamp: new Date().toISOString(),
        };

        yield {
          type: "revenue-distributed",
          agentName: "System",
          content: "楽曲の報酬分配完了",
          revenueDetails: musicPurchaseResult.revenueEntries.map((r) => ({
            recipientAgent: getAgentById(r.recipientAgentId)?.name || "Unknown",
            amount: r.amount,
            type: r.type,
          })),
          timestamp: new Date().toISOString(),
        };
      }
    }
  }

  yield {
    type: "simulation-complete",
    agentName: "System",
    content:
      "シミュレーション完了。詩の創作 → 俳句二次創作 → 楽曲制作（ACE-Step 1.5） → 購入・報酬分配の全フローが完了しました。",
    timestamp: new Date().toISOString(),
  };
}
