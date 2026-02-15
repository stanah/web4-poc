# Data Sources Guide

本プロジェクトでは **実データ (ブロックチェーン/外部API)** と **ダミーデータ (ハードコード/インメモリ)** が混在している。
この文書はどのページ・機能がどちらのデータを使っているかを明確にする。

## 実データ (Live / On-chain)

| 機能 | データソース | 格納先 | 備考 |
|------|-------------|--------|------|
| マーケットプレイスのエージェント一覧 | Sepolia IdentityRegistry (ERC-721) | Ponder indexer → `/api/agents/discover` | `totalSupply` + `tokenURI` でオンチェーン読み取り |
| ダッシュボードのエージェント総数 | 同上 | `/api/agents/discover` | サーバーサイドで RPC 呼び出し |
| フィードバック・レピュテーション | Sepolia ReputationRegistry | Ponder → Supabase → `/api/feedback/aggregate` | 現在 0 件（実フィードバック未投稿） |
| バリデーション | Sepolia ValidationRegistry | Ponder → Supabase | 現在 0 件 |
| Openfort Player | Openfort API | `/api/openfort/player` | アカウントアブストラクション用 |

### コントラクトアドレス (Sepolia)

- IdentityRegistry: `0x8004A818BFB912233c491871b3d84c89A494BD9e`
- ReputationRegistry: `0x8004B663056A597Dffe9eCcC1965A193B7388713`
- ValidationRegistry: `0x8004Cb1BF31DAf7788923b405b754f57acEB4272`

## ダミーデータ (Seed / In-memory)

| 機能 | データソース | ファイル | 備考 |
|------|-------------|----------|------|
| AI 作品 8 件 | ハードコード | `src/lib/artworks/seed-data.ts` → `SEED_ARTWORKS` | 詩、ASCII アート、俳句、短編小説、SVG、楽曲 |
| 作品購入履歴 6 件 | ハードコード | 同ファイル → `SEED_PURCHASES` | |
| 収益・ロイヤリティデータ 8 件 | ハードコード | 同ファイル → `SEED_REVENUE` | |
| 収益ランキング | シードデータから算出 | `src/lib/artworks/store.ts` | インメモリストア |
| A2A エコノミーシミュレーション | モックロジック | `src/lib/ai/simulation-engine.ts` | ダッシュボードの「シミュレーション開始」 |
| AI 自律創作シミュレーション | モックロジック | `src/lib/artworks/creation-engine.ts` | AI 作品ページの「シミュレーション開始」 |

### ダミーデータの特性

- **永続化なし**: サーバー再起動でシードデータに初期化される
- **DB 未連携**: Supabase やオンチェーンには保存されない
- **シミュレーション中の購入・創作**: インメモリに追加されるが再起動で消える

## ページ別まとめ

```
/                → 統計値は実データ (オンチェーン totalSupply)
/marketplace     → 実データ (Ponder indexer / オンチェーン RPC)
/dashboard       → 実データ (サーバーサイド API) + シミュレーションはモック
/register        → 実データ (ウォレット接続 → オンチェーン mint)
/artworks        → ダミーデータ (seed-data.ts)
/artworks/[id]   → ダミーデータ (seed-data.ts)
/interact/[id]   → 実データ (エージェント情報) + チャットはモック
```

## 今後の移行計画

AI 作品機能を実データに移行する場合、以下が必要:

1. Supabase にアートワーク用テーブルを追加
2. `src/lib/artworks/store.ts` のインメモリストアを DB 操作に置き換え
3. 購入・収益をオンチェーンまたは DB に永続化
4. `seed-data.ts` をマイグレーション用のシードスクリプトに転用
