# Web4 PoC — 改善計画

## PoCの目的

ERC-8004 "Trustless Agents" の **完全な信頼ライフサイクル** を実証する:

> AIエージェントがオンチェーンにアイデンティティを登録し、サービスエンドポイントを公開し、
> 発見され、実際のプロトコル (A2A/MCP) で対話が行われ、オンチェーンのレピュテーション
> フィードバックが記録され、信頼スコアが発見・選択に反映される。

「UIにデータを表示するだけ」ではなく、**オンチェーンの信頼シグナルがエージェント選択の意思決定に実際に影響する**ことを証明する。

---

## 現状のギャップ分析サマリー

13件のギャップを検出 (CRITICAL: 4, HIGH: 5, MEDIUM: 3, LOW: 1)

### 最も深刻な問題

1. **エンドポイント不在** (GAP-3): デモエージェントに `services[].endpoint` がなく、ERC-8004の「発見→接続」フローが完全にバイパスされている
2. **登録ファイル非準拠** (GAP-1/2): `type`, `supportedTrust` フィールドが欠落
3. **模擬対話** (GAP-3関連): `/api/interact` がハードコードプロンプト + OpenRouter で応答し、エージェントのサービスエンドポイントを一切使わない
4. **サービスフィールド反転** (GAP-12): `AgentService.type/name` の意味が仕様と異なる

詳細は `docs/ERC-8004-OVERVIEW.md` の「本PoCとの対応関係」セクション参照。

---

## アーキテクチャ方針

### エンドポイント実装: Next.js API Routes (統一サーバー)

3体のデモエージェントのA2A/MCPエンドポイントを **Next.js API Routes として実装**する。

理由:
- プロセス管理不要 — `next dev` で全て起動
- エンドポイントURLが `http://localhost:3000/api/agents/{id}/invoke` で自然に解決
- 既存の OpenRouter 統合をそのまま活用
- localhost のみ — 外部公開不要

### プロトコル選択

| エージェント | プロトコル | 理由 |
|-------------|----------|------|
| OracleBot | MCP (JSON-RPC `tools/call`) | ツール呼び出しモデルが価格取得に最適 |
| TranslateAgent | A2A (`message/send`) | メッセージ交換パターンが翻訳に自然 |
| AnalystAgent | A2A (`message/send`) | レポート生成はメッセージベース |

---

## 実装計画

### Phase 1: 型システム & データ基盤

#### `src/lib/erc8004/types.ts` — 型定義の仕様準拠

```typescript
export interface AgentMetadata {
  type?: string;                    // NEW: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1"
  name: string;
  description: string;
  image?: string;
  services: AgentService[];
  tags: string[];
  supportedTrust?: string[];        // NEW: ["onchain-reputation", "validation"]
  owner?: `0x${string}`;
}

export interface AgentService {
  type: "MCP" | "A2A";
  name: string;
  description: string;
  endpoint: string;                 // REQUIRED に変更
  version?: string;                 // NEW: "1.0.0"
}
```

#### `src/lib/agents/seed-data.ts` — デモエージェントにエンドポイント追加

3体全てに以下を追加:
- `endpoint`: `http://localhost:3000/api/agents/{id}/invoke`
- `version`: `"1.0.0"`
- `supportedTrust`: `["onchain-reputation"]`

#### `src/app/api/agents/[id]/metadata/route.ts` — レスポンス形式の仕様準拠

新フィールド (`type`, `supportedTrust`, `endpoint`, `version`) をレスポンスに含める。

### Phase 2: エージェントエンドポイント (コア)

#### OracleBot MCP エンドポイント
**ファイル**: `src/app/api/agents/1/invoke/route.ts` (~60行)

```
Request:  { jsonrpc: "2.0", method: "tools/call", params: { name: "get_price", arguments: { pair: "ETH/USD" } } }
Response: { jsonrpc: "2.0", result: { content: [{ type: "text", text: "ETH/USD: $3,245.67 (+2.3% 24h)" }] } }
```

OpenRouter (Gemini Flash) で構造化された価格データを生成。

#### TranslateAgent A2A エンドポイント
**ファイル**: `src/app/api/agents/2/invoke/route.ts` (~50行)

```
Request:  { jsonrpc: "2.0", method: "message/send", params: { message: { role: "user", parts: [{ type: "text", text: "..." }] } } }
Response: { jsonrpc: "2.0", result: { status: { state: "completed" }, artifacts: [{ parts: [{ type: "text", text: "..." }] }] } }
```

OpenRouter (DeepSeek) で実際に翻訳を実行。

#### AnalystAgent A2A エンドポイント
**ファイル**: `src/app/api/agents/3/invoke/route.ts` (~55行)

TranslateAgent と同じ A2A 形式。OpenRouter (Qwen) で市場分析レポートを生成。

### Phase 3: エンドポイントクライアント & 対話フロー統合

#### `src/lib/agents/endpoint-client.ts` — プロトコル対応クライアント (~80行)

```
callAgentEndpoint(endpoint, serviceType, serviceName, userMessage) → string
```

- `serviceType === "MCP"` → JSON-RPC `tools/call` リクエスト
- `serviceType === "A2A"` → JSON-RPC `message/send` リクエスト

#### `src/app/api/interact/route.ts` — エンドポイント経由の対話に変更

現在のフロー (バイパス):
```
Browser → /api/interact → seed-data lookup → OpenRouter → stream
```

新フロー (ERC-8004準拠):
```
Browser → /api/interact
  → メタデータ解決 (seed-data or on-chain tokenURI)
  → services[0].endpoint を抽出
  → endpoint-client で A2A/MCP リクエスト送信
  → レスポンスをブラウザに返却
```

フォールバック: メタデータ解決やエンドポイント呼び出しが失敗した場合、既存の直接LLM方式にフォールバック。

### Phase 4: 登録フロー & UI改善

#### `src/components/agents/registration-form.tsx` — data: URI で登録

フォームの入力内容から ERC-8004 準拠のメタデータ JSON を生成し、`data:application/json;base64,...` として `tokenURI` に直接格納。

```typescript
const metadata = {
  type: "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  name,
  description,
  services: [{ type: serviceType, name: "default", description, endpoint: "", version: "1.0.0" }],
  tags: selectedTags,
  supportedTrust: ["onchain-reputation"],
};
const metadataUri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
register(metadataUri);
```

#### `src/app/agents/[agentId]/page.tsx` — エンドポイント URL 表示

サービスカードにエンドポイント URL を表示し、プロトコルタイプ (MCP/A2A) とバージョンを明示。

---

## ファイル変更一覧

### 新規作成 (4ファイル)

| ファイル | 目的 | 行数目安 |
|---------|------|---------|
| `src/app/api/agents/1/invoke/route.ts` | OracleBot MCP エンドポイント | ~60 |
| `src/app/api/agents/2/invoke/route.ts` | TranslateAgent A2A エンドポイント | ~50 |
| `src/app/api/agents/3/invoke/route.ts` | AnalystAgent A2A エンドポイント | ~55 |
| `src/lib/agents/endpoint-client.ts` | プロトコル対応エンドポイントクライアント | ~80 |

### 修正 (6ファイル)

| ファイル | 変更内容 |
|---------|---------|
| `src/lib/erc8004/types.ts` | `type`, `supportedTrust`, `version` 追加、`endpoint` を必須化 |
| `src/lib/agents/seed-data.ts` | 3体のデモエージェントにエンドポイント等を追加 |
| `src/app/api/agents/[id]/metadata/route.ts` | レスポンスに新フィールドを含める |
| `src/app/api/interact/route.ts` | メタデータ解決 → エンドポイント呼び出しフローに変更 |
| `src/components/agents/registration-form.tsx` | data: URI でメタデータをオンチェーン格納 |
| `src/app/agents/[agentId]/page.tsx` | エンドポイント URL の表示 |

### 変更不要

- マーケットプレイス / ダッシュボード / AI作品ページ
- Ponder indexer / Supabase 同期
- wagmi設定 / Web3Provider
- フィードバック / レピュテーション hooks

---

## デモシナリオ (ユーザージャーニー)

### Act 1: 発見 (30秒)
マーケットプレイスでエージェントを閲覧。レピュテーションスコア、サービスタイプ (MCP/A2A) が表示される。タグでフィルタリング。

### Act 2: 詳細確認 (30秒)
OracleBot をクリック。オンチェーンID、サービスエンドポイント、レピュテーション、バリデーション状態を確認。

### Act 3: 対話 (60秒)
「対話する」→ チャット UI。ユーザーのメッセージが**実際に OracleBot の MCP エンドポイント**に送信され、構造化された価格データが返る。

### Act 4: フィードバック (30秒)
対話後、オンチェーンフィードバックを投稿 (4/5, tags: accuracy, speed)。Sepolia トランザクション確認後、プロフィールのスコアが更新。

### Act 5: エコノミー (60秒)
ダッシュボードでA2Aシミュレーション: AnalystAgent → OracleBot (価格取得) → TranslateAgent (翻訳)。各ステップがサービスエンドポイント経由。

---

## 技術的考慮事項

### SSRF対策
- 既存の `isPrivateUrl()` は localhost をブロックする
- `/api/interact` では、自アプリの `/api/agents/*/invoke` への内部呼び出しは**ホワイトリスト**で許可
- または、デモエージェント (ID 1-3) は内部ルートなので URL 検証をスキップ

### ストリーミング
- エージェントエンドポイントは完全な JSON レスポンスを返す (非ストリーム)
- `/api/interact` がレスポンスをブラウザへストリームする形式は維持可能
- シンプルな代替: 短い応答ではストリーミングを省略し、完全レスポンスを一括返却

### エラーハンドリング
- エンドポイントは JSON-RPC エラーオブジェクトを返す
- `/api/interact` はエンドポイント失敗時に既存の直接LLM方式にフォールバック
- タイムアウト: 30秒 (既存の `maxDuration` と一致)

---

## 将来の拡張 (PoCスコープ外)

- デモエージェントを Sepolia にオンチェーン登録
- IPFS でメタデータホスティング
- 外部の実エージェントとの相互運用
- バリデーション UI の実装
- AI 作品マーケットプレイスのオンチェーン化
- マルチチェーン対応 (グローバルエージェントID)
