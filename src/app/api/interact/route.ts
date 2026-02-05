import { NextResponse } from "next/server";

interface AgentResponse {
  message: string;
  data?: Record<string, unknown>;
  confidence?: number;
}

const AGENT_HANDLERS: Record<
  number,
  (message: string) => AgentResponse
> = {
  // OracleBot
  1: (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("eth") || lower.includes("ethereum")) {
      return {
        message:
          "Current ETH/USD price: **$3,847.52** (+2.3% 24h)\n\nData aggregated from 12 oracle providers with 99.7% consensus. Last updated 3 seconds ago.",
        data: {
          pair: "ETH/USD",
          price: 3847.52,
          change24h: 2.3,
          providers: 12,
          consensus: 99.7,
        },
        confidence: 0.997,
      };
    }
    if (lower.includes("btc") || lower.includes("bitcoin")) {
      return {
        message:
          "Current BTC/USD price: **$98,234.10** (+1.1% 24h)\n\nData aggregated from 12 oracle providers with 99.9% consensus.",
        data: {
          pair: "BTC/USD",
          price: 98234.1,
          change24h: 1.1,
          providers: 12,
          consensus: 99.9,
        },
        confidence: 0.999,
      };
    }
    if (lower.includes("compare")) {
      return {
        message:
          "**Asset Comparison (24h)**\n\n| Asset | Price | 24h Change |\n|-------|-------|------------|\n| ETH | $3,847.52 | +2.3% |\n| BTC | $98,234.10 | +1.1% |\n| SOL | $187.45 | +5.2% |",
        data: {
          assets: [
            { symbol: "ETH", price: 3847.52, change: 2.3 },
            { symbol: "BTC", price: 98234.1, change: 1.1 },
            { symbol: "SOL", price: 187.45, change: 5.2 },
          ],
        },
        confidence: 0.98,
      };
    }
    return {
      message:
        "I can help you with cryptocurrency prices! Try asking about:\n- ETH or Bitcoin prices\n- Compare multiple assets\n- Any trading pair (e.g., SOL/USD)",
    };
  },

  // TranslateAgent
  2: (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("hello") || lower.includes("hi")) {
      return {
        message:
          "Translation results:\n\n🇯🇵 Japanese: **こんにちは**\n🇫🇷 French: **Bonjour**\n🇪🇸 Spanish: **Hola**\n🇩🇪 German: **Hallo**\n🇨🇳 Chinese: **你好**",
        confidence: 0.99,
      };
    }
    if (
      lower.includes("smart contract") ||
      lower.includes("solidity")
    ) {
      return {
        message:
          '**Technical Translation (EN → JA)**\n\n"Smart contract" → **スマートコントラクト**\n"Immutable ledger" → **不変台帳**\n"Gas optimization" → **ガス最適化**\n"Reentrancy guard" → **リエントランシーガード**\n\n_Context: Ethereum/Solidity technical documentation_',
        confidence: 0.95,
      };
    }
    return {
      message:
        "I can translate text between 95 languages! Send me any text and I'll translate it. I specialize in:\n- Technical documentation\n- Smart contract documentation\n- Multi-language batch translation",
    };
  },

  // AnalystAgent
  3: (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("market") || lower.includes("report")) {
      return {
        message:
          "**Market Intelligence Report — Feb 6, 2026**\n\n📊 **Overview**: Crypto market cap at $4.2T (+3.1% WoW)\n\n🔥 **Top Movers**:\n- SOL: +12.4% (NFT volume surge)\n- ETH: +5.8% (EIP-8004 adoption)\n- LINK: +8.2% (oracle demand)\n\n⚠️ **Risk Signals**:\n- Funding rates elevated on ETH perps\n- BTC dominance declining (43.2%)\n\n📈 **Recommendation**: Moderate bullish bias with caution on leveraged positions.",
        confidence: 0.92,
      };
    }
    if (lower.includes("defi") || lower.includes("protocol")) {
      return {
        message:
          "**DeFi Protocol Analysis**\n\n🏦 **Total TVL**: $182.5B\n\n**Top Protocols by TVL**:\n1. Lido — $38.2B (Liquid Staking)\n2. Aave — $22.1B (Lending)\n3. Uniswap — $12.8B (DEX)\n4. MakerDAO — $11.5B (CDP)\n\n**Emerging Trend**: AI-powered DeFi agents (ERC-8004) showing 340% growth in registered agents this week.",
        confidence: 0.94,
      };
    }
    return {
      message:
        "I generate comprehensive market analysis and reports. Try asking about:\n- Market overview and reports\n- DeFi protocol analysis\n- Token metrics and whale activity\n- Risk assessment for specific assets",
    };
  },
};

export async function POST(request: Request) {
  const body = await request.json();
  const { agentId, message } = body as {
    agentId: number;
    message: string;
  };

  const handler = AGENT_HANDLERS[agentId];
  if (!handler) {
    return NextResponse.json(
      { error: "Agent not found" },
      { status: 404 }
    );
  }

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const response = handler(message);
  return NextResponse.json({
    agentId,
    response: response.message,
    data: response.data,
    confidence: response.confidence,
    timestamp: new Date().toISOString(),
  });
}
