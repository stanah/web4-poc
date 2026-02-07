# Web4 PoC

ERC-8004 に基づく AI エージェント経済圏のプルーフ・オブ・コンセプト。

AI エージェントを NFT として登録し、オンチェーンでレピュテーションを管理し、エージェント同士が自律的に取引・評価するマーケットプレイスを構築する。

## コンセプト

**Web4 = Web3（ブロックチェーン） + AI エージェント**

従来の Web3 はトークンと DeFi が中心だが、Web4 では AI エージェントが経済主体になる。ERC-8004 は AI エージェントのアイデンティティ・レピュテーション・バリデーションをオンチェーンで標準化する規格。

### ERC-8004 の 3 つのレジストリ

| レジストリ | 役割 |
|---|---|
| **IdentityRegistry** | エージェントを ERC-721 NFT として登録。`tokenURI` でメタデータ（名前、説明、能力タグ）を公開 |
| **ReputationRegistry** | エージェントへのフィードバック（スコア + タグ）をオンチェーンに記録。集計・フィルタリング可能 |
| **ValidationRegistry** | エージェントの能力やサービス品質を第三者が検証・証明 |

### このPoCで実現していること

- **エージェント登録**: ウォレット接続 → フォーム入力 → NFT ミント
- **マーケットプレイス**: オンチェーンからエージェント一覧を取得、検索・タグフィルタリング
- **レピュテーション表示**: フィードバックスコアの集計、個別フィードバック一覧
- **エージェントとのチャット**: Vercel AI SDK によるストリーミング LLM 応答
- **A2A シミュレーション**: エージェント同士が自律的にタスク依頼・交渉・評価を行うデモ

## アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│                                                  │
│  RainbowKit ──→ WalletConnect ──→ User Wallet   │
│                                                  │
│  Next.js App Router (SSR/CSR)                    │
│  ├── wagmi hooks ──→ Sepolia RPC ──→ ERC-8004   │
│  ├── /api/interact ──→ AI SDK ──→ LLM Provider  │
│  └── /api/simulation/stream ──→ SSE ──→ LLM     │
└─────────────────────────────────────────────────┘

ERC-8004 Contracts (Sepolia)
├── IdentityRegistry   0x8004A818...BD9e
├── ReputationRegistry 0x8004B663...8713
└── ValidationRegistry 0x8004Cb1B...4272
```

**データフロー**:
1. ブラウザ → wagmi hooks → Sepolia RPC でオンチェーンデータを読み取り
2. エージェント登録/フィードバック送信 → ウォレット署名 → トランザクション発行
3. チャット → `/api/interact` → Vercel AI SDK → LLM（ストリーミング応答）
4. シミュレーション → `/api/simulation/stream` → SSE でリアルタイム配信

## テックスタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16.1.6 (App Router, Turbopack) |
| 言語 | TypeScript 5.9.3 |
| スタイリング | Tailwind CSS 4.1.18 + shadcn/ui (radix-ui) |
| Web3 | wagmi 2.19.5, viem 2.45.1, RainbowKit 2.2.10 |
| AI | Vercel AI SDK 6.x（OpenAI 互換プロバイダー対応） |
| アニメーション | framer-motion 12.33.0 |
| i18n | next-intl 4.8.2 |

## クイックスタート

```bash
# 依存関係インストール
pnpm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集（詳細は docs/CONTRIB.md 参照）

# 開発サーバー起動
pnpm dev

# (別ターミナル) ローカルチェーン起動 + デモデータ投入
pnpm anvil
pnpm seed
```

http://localhost:3000 でアクセス。

## プロジェクト構造

```
src/
├── app/
│   ├── page.tsx                      # ランディングページ
│   ├── dashboard/page.tsx            # ダッシュボード（シミュレーション）
│   ├── marketplace/page.tsx          # エージェントマーケットプレイス
│   ├── register/page.tsx             # エージェント登録（NFTミント）
│   ├── agents/[agentId]/page.tsx     # エージェントプロフィール
│   ├── interact/[agentId]/page.tsx   # チャットインターフェース
│   └── api/
│       ├── interact/route.ts         # LLM チャット（ストリーミング）
│       ├── simulation/stream/route.ts # A2A シミュレーション（SSE）
│       ├── agents/discover/route.ts  # エージェント検索
│       ├── agents/[id]/metadata/     # メタデータ API
│       └── feedback/aggregate/       # フィードバック集計
├── components/                       # UI コンポーネント
├── lib/
│   ├── ai/                           # プロバイダー設定、シナリオ、シミュレーションエンジン
│   ├── contracts/
│   │   ├── abis/                     # ERC-8004 コントラクト ABI
│   │   └── hooks/                    # wagmi hooks（identity, reputation, agents）
│   └── erc8004/                      # 型定義・ユーティリティ
├── providers/                        # Web3Provider（wagmi + RainbowKit）
└── messages/                         # i18n メッセージファイル
scripts/
├── seed-agents.ts                    # デモエージェント登録スクリプト
└── seed-feedback.ts                  # デモフィードバック投入スクリプト
```

## コントラクト (Sepolia)

| コントラクト | アドレス |
|---|---|
| IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| ReputationRegistry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |
| ValidationRegistry | `0x8004Cb1BF31DAf7788923b405b754f57acEB4272` |

## ドキュメント

- [docs/CONTRIB.md](./docs/CONTRIB.md) — 環境構築、スクリプト一覧、開発ワークフロー
- [docs/RUNBOOK.md](./docs/RUNBOOK.md) — デプロイ手順、トラブルシューティング、検証チェックリスト
