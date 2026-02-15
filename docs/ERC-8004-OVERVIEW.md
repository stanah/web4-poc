# ERC-8004: Trustless Agents — 仕様概要

> 参照: [EIP-8004](https://eips.ethereum.org/EIPS/eip-8004) / [Ethereum Magicians Discussion](https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098)

ERC-8004 は MetaMask (Marco De Rossi)、Ethereum Foundation (Davide Crapis)、Google (Jordan Ellis)、Coinbase (Erik Reppel) の共著による提案で、自律的な AI エージェントの発見・信頼構築のための最小限のオンチェーンインフラを定義する。

## ERC-8004 が定義するもの

### 3 つのオンチェーンレジストリ

#### 1. Identity Registry (アイデンティティ)

ERC-721 ベースのエージェント登録。各エージェントはグローバルID (`eip155:{chainId}:{registryAddress}:{tokenId}`) を持つ。

主な機能:
- `register(agentURI, metadata[])` — エージェント NFT を発行し、登録ファイルの URI を紐付け
- `setAgentURI(agentId, newURI)` — 登録ファイルの URI を更新
- `setAgentWallet(agentId, newWallet, deadline, signature)` — 支払先アドレス設定 (EIP-712 署名必須)
- `tokenURI(tokenId)` — 登録ファイルの URI を返す

#### 2. Reputation Registry (レピュテーション)

クライアントからエージェントへのフィードバックを記録・集計する。

主な機能:
- `giveFeedback(agentId, value, decimals, tag1, tag2, endpoint, feedbackURI, hash)` — フィードバック投稿
- `revokeFeedback(agentId, feedbackIndex)` — フィードバック取り消し
- `appendResponse(agentId, client, index, responseURI, hash)` — エージェントからの応答
- `getSummary(agentId, clients[], tag1, tag2)` — 集計値の取得

フィードバック値は `int128` (符号付き) + `decimals` (0-18) の固定小数点。タグによる分類が可能。

#### 3. Validation Registry (バリデーション)

第三者バリデーターによる検証リクエスト/レスポンスを管理する。

主な機能:
- `validationRequest(validator, agentId, requestURI, hash)` — 検証リクエスト
- `validationResponse(requestHash, response, responseURI, hash, tag)` — 検証結果 (0-100 スケール)
- `getSummary(agentId, validators[], tag)` — 検証統計の集計

信頼モデルはプラガブル: レピュテーション、暗号経済的セキュリティ (ステーク + 再実行)、zkML、TEE アテステーションなど。

### オフチェーン: JSON 登録ファイル (Registration File)

`agentURI` が指す JSON ファイルがエージェントの「名刺」として機能する。URI スキームは `https://`, `ipfs://`, `data:` (Base64) のいずれも可。

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "MyAgent",
  "description": "What this agent does",
  "image": "https://...",
  "services": [
    { "name": "A2A", "endpoint": "https://agent.example.com/a2a", "version": "0.3.0" },
    { "name": "MCP", "endpoint": "https://agent.example.com/mcp", "version": "2025-06-18" },
    { "name": "web", "endpoint": "https://agent.example.com" }
  ],
  "supportedTrust": ["reputation", "crypto-economic", "tee-attestation"]
}
```

サポートされるサービスタイプ: **Web**, **A2A**, **MCP**, **OASF**, **ENS**, **DID**, **email**

## 想定されるエージェント対話フロー

```
1. クライアント → Identity Registry: tokenURI(agentId) で agentURI を取得
2. agentURI を解決 → JSON 登録ファイルを取得
3. services[] からエンドポイントを発見
4. A2A / MCP プロトコルでエンドポイントに接続し対話
5. 対話後 → Reputation Registry: giveFeedback() で評価を記録
6. 必要に応じ → Validation Registry: validationRequest() で第三者検証
```

重要: **ERC-8004 はエンドポイントの「発見」までを担当し、実際の対話プロトコル (A2A, MCP 等) は外部仕様に委ねている。**

## ERC-8004 が明示的に範囲外としているもの

| 範囲外の項目 | ERC-8004 の立場 |
|-------------|----------------|
| 支払い | "Payments are orthogonal to this protocol and not covered here" |
| バリデーターへのインセンティブ/スラッシング | 各検証プロトコル側の責任 |
| 能力の真正性保証 | 暗号学的には保証不可。登録ファイルとオンチェーンの対応は保証する |
| Sybil 攻撃防御 | シグナルの公開と共通スキーマの提供のみ。レピュテーションシステムは各自構築 |

## 本 PoC との対応関係

### 実装済み (実データ / オンチェーン)

| ERC-8004 機能 | 実装 | 備考 |
|--------------|------|------|
| Identity Registry (ERC-721) | Sepolia デプロイ済み | `0x8004A818...` / totalSupply ~1,000+ |
| `register()` → NFT ミント | `/register` ページ | ウォレット接続してミント可能 |
| `tokenURI()` → 登録ファイル解決 | Ponder indexer + discover API | メタデータ URI の取得とパース |
| Reputation Registry | Sepolia デプロイ済み | `0x8004B663...` / 現在フィードバック 0 件 |
| Validation Registry | Sepolia デプロイ済み | `0x8004Cb1B...` / 現在バリデーション 0 件 |

### 未実装・模擬実装 (ダミー)

| ERC-8004 機能 | 本 PoC の実装 | 差分 |
|--------------|-------------|------|
| 登録ファイルの `services[].endpoint` に接続して対話 | ローカルのシステムプロンプト + OpenRouter LLM で模擬対話 | **実エンドポイントへの接続なし** |
| 対話可能なエージェント | ハードコード 3 体のみ (`src/lib/agents/seed-data.ts`) | オンチェーンの ~1,000 体とは無関係 |
| フィードバック投稿 UI | wagmi hooks 実装済みだが未利用 | CORS エラーで一部動作不安定 |
| バリデーション UI | 未実装 | コントラクト連携のみ |

### 全く別物 (ERC-8004 無関係)

| 機能 | 説明 |
|------|------|
| AI 作品マーケットプレイス (`/artworks`) | ERC-8004 とは無関係のインメモリシードデータ |
| A2A エコノミーシミュレーション | ダッシュボードのデモ用モックロジック |
| Openfort 統合 | アカウントアブストラクション (ERC-4337) — ERC-8004 とは独立 |
