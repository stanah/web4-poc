import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getOrCreatePlayer } from "@/lib/openfort/server";

/**
 * POST /api/openfort/player
 *
 * Create or retrieve an Openfort player (smart account) for a wallet address.
 * Protected by Origin header verification to ensure requests come from our frontend.
 * Body: { walletAddress: string }
 *
 * Security: Origin header verification provides CSRF protection.
 * TODO(production): Add wallet signature verification (EIP-191/EIP-712)
 * and per-IP rate limiting before deploying outside PoC.
 */
export async function POST(request: Request) {
  try {
    // Verify the request originates from our own frontend (CSRF protection)
    const headersList = await headers();
    const origin = headersList.get("origin");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl && origin && origin !== appUrl) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { walletAddress } = await request.json();

    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 },
      );
    }

    // Validate Ethereum address format
    if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 },
      );
    }

    const player = await getOrCreatePlayer(walletAddress);

    return NextResponse.json({
      playerId: player.id,
      smartAccountAddress: player.smartAccountAddress,
    });
  } catch (err) {
    console.error("[openfort/player] Error:", err);
    return NextResponse.json(
      { error: "Failed to create or retrieve player" },
      { status: 500 },
    );
  }
}
