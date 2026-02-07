import { NextResponse } from "next/server";
import { createTransactionIntent } from "@/lib/openfort/server";
import { OPENFORT_CONFIG } from "@/lib/openfort/config";

/**
 * POST /api/openfort/transaction
 *
 * Create a transaction intent for a gasless (sponsored) transaction.
 * The Openfort policy sponsors gas for whitelisted ERC-8004 contracts.
 *
 * Body: {
 *   playerId: string,
 *   chainId?: number,
 *   policyId?: string,
 *   interactions: [{ contract, functionName, functionArgs }]
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerId, interactions } = body;

    if (!playerId || !interactions?.length) {
      return NextResponse.json(
        { error: "playerId and interactions are required" },
        { status: 400 },
      );
    }

    // Verify all contracts are whitelisted for sponsorship
    const allowedContracts = OPENFORT_CONFIG.sponsoredContracts.map((c) =>
      c.toLowerCase(),
    );
    for (const interaction of interactions) {
      if (!allowedContracts.includes(interaction.contract.toLowerCase())) {
        return NextResponse.json(
          { error: `Contract ${interaction.contract} is not whitelisted for sponsorship` },
          { status: 403 },
        );
      }
    }

    const intent = await createTransactionIntent({
      player: playerId,
      chainId: body.chainId ?? OPENFORT_CONFIG.chainId,
      policy: body.policyId ?? OPENFORT_CONFIG.policyId,
      interactions,
    });

    return NextResponse.json({
      intentId: intent.id,
      userOperationHash: intent.userOperationHash,
      txHash: intent.response?.transactionHash ?? null,
    });
  } catch (err) {
    console.error("[openfort/transaction] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
