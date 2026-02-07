/**
 * Openfort server-side operations.
 * Uses the secret key for privileged operations like creating
 * transaction intents and managing policies.
 */

const OPENFORT_API_BASE = "https://api.openfort.xyz";

function getHeaders() {
  const secretKey = process.env.OPENFORT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing OPENFORT_SECRET_KEY");
  }
  return {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json",
  };
}

export interface TransactionIntentRequest {
  /** The player (wallet owner) ID in Openfort */
  player: string;
  /** Chain ID */
  chainId: number;
  /** Policy ID for gas sponsorship */
  policy?: string;
  /** Contract interactions */
  interactions: {
    contract: string;
    functionName: string;
    functionArgs: unknown[];
  }[];
}

export interface TransactionIntentResponse {
  id: string;
  userOperationHash?: string;
  response?: {
    transactionHash: string;
  };
}

/**
 * Create a transaction intent for a gasless (sponsored) transaction.
 * The transaction will be executed via the user's smart account.
 */
export async function createTransactionIntent(
  request: TransactionIntentRequest,
): Promise<TransactionIntentResponse> {
  const res = await fetch(`${OPENFORT_API_BASE}/v1/transaction_intents`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      player: request.player,
      chain_id: request.chainId,
      policy: request.policy,
      interactions: request.interactions.map((i) => ({
        contract: i.contract,
        function_name: i.functionName,
        function_args: i.functionArgs,
      })),
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Openfort API error: ${res.status} ${error}`);
  }

  return res.json();
}

/**
 * Create or retrieve a player (smart account) for a wallet address.
 */
export async function getOrCreatePlayer(
  walletAddress: string,
  name?: string,
): Promise<{ id: string; smartAccountAddress: string }> {
  // Search for existing player by external wallet
  const searchRes = await fetch(
    `${OPENFORT_API_BASE}/v1/players?external_wallet=${walletAddress}`,
    { headers: getHeaders() },
  );

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.data?.length > 0) {
      const player = searchData.data[0];
      return {
        id: player.id,
        smartAccountAddress: player.accounts?.[0]?.address ?? "",
      };
    }
  }

  // Create new player
  const createRes = await fetch(`${OPENFORT_API_BASE}/v1/players`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: name ?? `web4-${walletAddress.slice(0, 8)}`,
    }),
  });

  if (!createRes.ok) {
    const error = await createRes.text();
    throw new Error(`Failed to create player: ${createRes.status} ${error}`);
  }

  const player = await createRes.json();
  return {
    id: player.id,
    smartAccountAddress: player.accounts?.[0]?.address ?? "",
  };
}
