import { NextResponse } from "next/server";
import { getOrCreatePlayer } from "@/lib/openfort/server";

/**
 * POST /api/openfort/player
 *
 * Create or retrieve an Openfort player (smart account) for a wallet address.
 * Requires a valid Ethereum address format as proof of intent.
 * Body: { walletAddress: string }
 */
export async function POST(request: Request) {
  try {
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
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
