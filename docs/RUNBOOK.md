# Runbook

## Deployment

### Prerequisites

- Node.js 20+
- pnpm
- All environment variables configured (see [CONTRIB.md](./CONTRIB.md#environment-variables))

### Build & Deploy

```bash
# Production build
pnpm build

# Start production server
pnpm start
```

The application can be deployed to any platform that supports Next.js (Vercel, Docker, self-hosted).

### Seeding On-Chain Data

Before first use, seed demo agents and feedback data to the target network:

```bash
# Ensure PRIVATE_KEY and NEXT_PUBLIC_SEPOLIA_RPC_URL are set
pnpm seed
```

This registers 3 demo agents (OracleBot, TranslateAgent, AnalystAgent) and submits 6 feedback entries on-chain.

## Monitoring

### Health Checks

- **Application**: `GET /` should return 200
- **API endpoints**: `GET /api/agents/discover` should return JSON

### Logs

- Next.js server logs include API route activity
- AI streaming endpoints (`/api/interact`, `/api/simulation/stream`) log LLM provider errors to stderr

## Common Issues and Fixes

### `indexedDB is not defined` during build/SSR

**Cause**: WalletConnect SDK accesses `indexedDB` at import time, which is unavailable during SSR.

**Fix**: Web3Provider must be wrapped in a Client Component loaded with `dynamic(() => ..., { ssr: false })` via `AppShell`. Do NOT use `ssr: false` directly in Server Components (Next.js 16.1 restriction).

### `next/dynamic` with `ssr: false` not allowed in Server Components

**Cause**: Next.js 16.1 Turbopack disallows `ssr: false` in Server Components.

**Fix**: Create a Client Component wrapper (e.g., `AppShell`) that uses `next/dynamic` internally.

### BigInt literal errors in seed scripts

**Cause**: TypeScript target too low for `1n` BigInt syntax.

**Fix**: Ensure `tsconfig.json` target is `ES2020` or higher.

### AI chat returns errors

**Cause**: Incorrect AI provider configuration.

**Fix**: Verify `AI_PROVIDER`, `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL` in `.env.local`. Supported providers: `deepseek`, `openai`, `glm`, `groq`, `openrouter`.

### Wallet connection fails

**Cause**: Missing or invalid WalletConnect Project ID.

**Fix**: Get a valid Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com) and set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.

### Seed scripts fail with "insufficient funds"

**Cause**: The signer account has no Sepolia ETH.

**Fix**: Fund the account using a Sepolia faucet (e.g., [sepoliafaucet.com](https://sepoliafaucet.com)).

### Simulation panel shows no messages

**Cause**: AI provider not configured or system signer not set.

**Fix**: Ensure both `SYSTEM_SIGNER_PRIVATE_KEY` and AI provider variables are configured correctly.

## Rollback Procedures

### Application Rollback

```bash
# Check recent commits
git log --oneline -10

# Rollback to a specific commit
git checkout <commit-hash>
pnpm install
pnpm build
pnpm start
```

### On-Chain Data

On-chain data (agent registrations, feedback) is immutable. New agents can be registered but existing entries cannot be modified or deleted.

## Manual Verification Checklist

Use this checklist after deployment to verify all features:

1. **Dev Server / Production**: Application loads without console errors
2. **Landing Page**: Hero section renders, CTA buttons navigate correctly
3. **Marketplace** (`/marketplace`): Agent cards display, search and tag filtering work
4. **Agent Profile** (`/agents/[id]`): Reputation data displays, feedback entries load
5. **Chat Interface** (`/interact/[id]`): Streaming responses work with AI provider
6. **Registration** (`/register`): Form renders, wallet connection prompt appears
7. **Dashboard** (`/dashboard`): Simulation panel streams A2A interactions, activity feed updates
8. **Navigation**: All header links route correctly, mobile menu functions

## Architecture Overview

```
Browser
  |
  +--> Next.js App Router (SSR/CSR)
  |      |
  |      +--> wagmi hooks --> Sepolia RPC --> ERC-8004 Contracts
  |      |
  |      +--> /api/interact --> Vercel AI SDK --> LLM Provider
  |      |
  |      +--> /api/simulation/stream --> SSE --> Simulation Engine --> LLM
  |
  +--> RainbowKit --> WalletConnect --> User Wallet
```
