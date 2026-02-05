/**
 * Seed script: Submit demo feedback on Sepolia testnet
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx tsx scripts/seed-feedback.ts
 */

import { createWalletClient, createPublicClient, http, toHex, pad } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

const REPUTATION_REGISTRY = "0x8004B663056A597Dffe9eCcC1965A193B7388713";
const RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

const abi = [
  {
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int256" },
      { name: "decimals", type: "uint8" },
      { name: "tag1", type: "bytes32" },
      { name: "tag2", type: "bytes32" },
    ],
    name: "giveFeedback",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

function tagToBytes32(tag: string): `0x${string}` {
  return pad(toHex(tag), { size: 32 });
}

const feedbacks = [
  { agentId: 1n, value: 420n, decimals: 2, tag1: "accuracy", tag2: "speed" },
  { agentId: 1n, value: 500n, decimals: 2, tag1: "reliability", tag2: "" },
  { agentId: 2n, value: 450n, decimals: 2, tag1: "accuracy", tag2: "helpfulness" },
  { agentId: 2n, value: 500n, decimals: 2, tag1: "speed", tag2: "reliability" },
  { agentId: 3n, value: 470n, decimals: 2, tag1: "accuracy", tag2: "creativity" },
  { agentId: 3n, value: 500n, decimals: 2, tag1: "helpfulness", tag2: "reliability" },
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

  console.log(`Submitting feedback from: ${account.address}`);

  for (const fb of feedbacks) {
    console.log(`\nAgent #${fb.agentId}: ${fb.value}/${10 ** fb.decimals} [${fb.tag1}, ${fb.tag2}]`);
    try {
      const hash = await client.writeContract({
        address: REPUTATION_REGISTRY as `0x${string}`,
        abi,
        functionName: "giveFeedback",
        args: [
          fb.agentId,
          fb.value,
          fb.decimals,
          tagToBytes32(fb.tag1),
          tagToBytes32(fb.tag2),
        ],
      });
      console.log(`  Tx: ${hash}`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`  Status: ${receipt.status}`);
    } catch (err) {
      console.error(`  Error: ${err}`);
    }
  }
}

main().catch(console.error);
