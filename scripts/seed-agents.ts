/**
 * Seed script: Register demo agents on Sepolia testnet
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx tsx scripts/seed-agents.ts
 *
 * Requires:
 *   - Sepolia ETH in the wallet for gas
 *   - A valid private key with Sepolia funds
 */

import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

const abi = [
  {
    inputs: [{ name: "agentURI", type: "string" }],
    name: "register",
    outputs: [{ name: "agentId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const agents = [
  { name: "OracleBot", uri: `${BASE_URL}/api/agents/1/metadata` },
  { name: "TranslateAgent", uri: `${BASE_URL}/api/agents/2/metadata` },
  { name: "AnalystAgent", uri: `${BASE_URL}/api/agents/3/metadata` },
];

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("Error: PRIVATE_KEY environment variable required");
    process.exit(1);
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: sepolia,
    transport: http(RPC_URL),
  });
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  console.log(`Registering agents from: ${account.address}`);

  for (const agent of agents) {
    console.log(`\nRegistering ${agent.name}...`);
    try {
      const hash = await client.writeContract({
        address: IDENTITY_REGISTRY as `0x${string}`,
        abi,
        functionName: "register",
        args: [agent.uri],
      });
      console.log(`  Tx: ${hash}`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`  Status: ${receipt.status}`);
      console.log(`  Block: ${receipt.blockNumber}`);
    } catch (err) {
      console.error(`  Error: ${err}`);
    }
  }
}

main().catch(console.error);
