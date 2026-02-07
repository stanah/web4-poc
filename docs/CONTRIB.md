# Contributing Guide

## Prerequisites

- Node.js 20+
- pnpm (package manager)
- A WalletConnect Project ID ([cloud.walletconnect.com](https://cloud.walletconnect.com))
- A funded Sepolia testnet wallet (for on-chain operations)

## Environment Setup

1. Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd web4-poc
pnpm install
```

2. Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Yes | Ethereum RPC URL for Sepolia testnet (default: `https://rpc.sepolia.org`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Application URL, used by seed scripts for tokenURI (default: `http://localhost:3000`) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect Project ID for wallet connections |
| `SYSTEM_SIGNER_PRIVATE_KEY` | Yes | Private key for server-side on-chain writes during simulation |
| `PRIVATE_KEY` | Yes | Private key for seed scripts (`seed-agents.ts`, `seed-feedback.ts`) |
| `AI_PROVIDER` | Yes | AI provider name: `deepseek`, `openai`, `glm`, `groq`, or `openrouter` |
| `AI_BASE_URL` | Yes | Base URL for the AI provider API |
| `AI_API_KEY` | Yes | API key for the AI provider |
| `AI_MODEL` | Yes | Model name to use (e.g., `deepseek-chat`) |

> For local development with Anvil, use the default Anvil account private key:
> `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `pnpm dev` | Start Next.js development server with Turbopack |
| `build` | `pnpm build` | Create production build |
| `start` | `pnpm start` | Start production server |
| `lint` | `pnpm lint` | Run ESLint |
| `anvil` | `pnpm anvil` | Start local Anvil node forking Sepolia |
| `seed` | `pnpm seed` | Run both seed scripts (agents + feedback) |
| `seed:agents` | `pnpm seed:agents` | Register 3 demo agents on-chain via `scripts/seed-agents.ts` |
| `seed:feedback` | `pnpm seed:feedback` | Submit 6 demo feedback entries on-chain via `scripts/seed-feedback.ts` |

## Development Workflow

1. Start the dev server:

```bash
pnpm dev
```

2. (Optional) For local blockchain development, start Anvil in a separate terminal:

```bash
pnpm anvil
```

3. Seed demo data on-chain:

```bash
pnpm seed
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    page.tsx                    # Landing page
    dashboard/page.tsx          # Dashboard with simulation panel
    marketplace/page.tsx        # Agent marketplace with search/filter
    register/page.tsx           # Agent registration (ERC-721 mint)
    agents/[agentId]/page.tsx   # Agent profile with reputation
    interact/[agentId]/page.tsx # Chat interface for agent interaction
    api/
      interact/route.ts         # Streaming LLM chat endpoint
      simulation/stream/route.ts # SSE endpoint for A2A simulation
      agents/discover/route.ts  # Agent discovery with filtering
      agents/[id]/metadata/route.ts # Agent metadata endpoint
      feedback/aggregate/route.ts   # Feedback aggregation endpoint
  components/                   # React components (layout, dashboard, interaction)
  lib/
    ai/                         # AI provider config, scenarios, simulation engine
    agents/                     # Seed data definitions
    contracts/
      abis/                     # ERC-8004 contract ABIs
      hooks/                    # wagmi hooks (identity, reputation, agents list)
    erc8004/                    # ERC-8004 type definitions and utilities
  providers/                    # Web3Provider (wagmi + RainbowKit)
scripts/
  seed-agents.ts               # On-chain agent registration script
  seed-feedback.ts             # On-chain feedback submission script
```

## ERC-8004 Contracts (Sepolia)

| Contract | Address |
|---|---|
| IdentityRegistry | `0x8004A818BFB912233c491871b3d84c89A494BD9e` |
| ReputationRegistry | `0x8004B663056A597Dffe9eCcC1965A193B7388713` |
| ValidationRegistry | `0x8004Cb1BF31DAf7788923b405b754f57acEB4272` |

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, Turbopack)
- **Language**: TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.18 + shadcn/ui (radix-ui)
- **Web3**: wagmi 2.19.5, viem 2.45.1, RainbowKit 2.2.10
- **AI**: Vercel AI SDK 6.x with OpenAI-compatible providers
- **Animation**: framer-motion 12.33.0
- **i18n**: next-intl 4.8.2

## Testing

No test suite is currently configured. Manual verification should be performed against the [verification checklist](../docs/RUNBOOK.md#manual-verification-checklist).
