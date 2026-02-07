import { NextResponse } from "next/server";
import { getOrCreatePlayer } from "@/lib/openfort/server";

/**
 * POST /api/openfort/player
 *
 * Create or retrieve an Openfort player (smart account) for a wallet address.
 * Requires a valid Ethereum address format and API secret as proof of authorization.
 * Body: { walletAddress: string }
 */
export async function POST(request: Request) {
  try {
    // Verify the request comes from our own frontend via shared secret
    const apiSecret = process.env.OPENFORT_API_ROUTE_SECRET;
    if (apiSecret) {
      const authHeader = request.headers.get("x-api-secret");
      if (authHeader !== apiSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
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
