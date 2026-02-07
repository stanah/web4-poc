import { NextResponse } from "next/server";
import { createTransactionIntent } from "@/lib/openfort/server";
import { OPENFORT_CONFIG } from "@/lib/openfort/config";

/** Allowed functions per contract for gas sponsorship */
const ALLOWED_FUNCTIONS: Record<string, string[]> = {
  // IdentityRegistry
  "0x8004a818bfb912233c491871b3d84c89a494bd9e": ["register"],
  // ReputationRegistry
  "0x8004b663056a597dffe9eccc1965a193b7388713": ["giveFeedback"],
  // ValidationRegistry
  "0x8004cb1bf31daf7788923b405b754f57aceb4272": ["validate"],
};

/**
 * POST /api/openfort/transaction
 *
 * Create a transaction intent for a gasless (sponsored) transaction.
 * The Openfort policy sponsors gas for whitelisted ERC-8004 contracts.
 * Enforces both contract-level and function-level allowlists.
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

    // Verify all contracts and functions are whitelisted for sponsorship
    const allowedContracts = OPENFORT_CONFIG.sponsoredContracts.map((c) =>
      c.toLowerCase(),
    );
    for (const interaction of interactions) {
      const contract = String(interaction.contract).toLowerCase();

      if (!allowedContracts.includes(contract)) {
        return NextResponse.json(
          { error: `Contract ${interaction.contract} is not whitelisted for sponsorship` },
          { status: 403 },
        );
      }

      // Enforce function-level allowlist
      const allowedFns = ALLOWED_FUNCTIONS[contract];
      if (
        !allowedFns ||
        typeof interaction.functionName !== "string" ||
        !allowedFns.includes(interaction.functionName)
      ) {
        return NextResponse.json(
          { error: `Function ${interaction.functionName} is not allowed on contract ${interaction.contract}` },
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
