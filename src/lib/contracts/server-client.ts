import { createWalletClient, createPublicClient, http, encodePacked } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { reputationRegistryAbi } from "./abis/reputation-registry";
import { validationRegistryAbi } from "./abis/validation-registry";
import { CONTRACT_ADDRESSES } from "./addresses";
import { tagToBytes32 } from "@/lib/erc8004/types";

const rpcUrl =
  process.env.SEPOLIA_RPC_URL ||
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  "https://rpc.sepolia.org";

function getSystemAccount() {
  const key = process.env.SYSTEM_SIGNER_PRIVATE_KEY;
  if (!key) throw new Error("SYSTEM_SIGNER_PRIVATE_KEY is not set");
  return privateKeyToAccount(key as `0x${string}`);
}

function getWalletClient() {
  return createWalletClient({
    account: getSystemAccount(),
    chain: sepolia,
    transport: http(rpcUrl),
  });
}

export function getPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl),
  });
}

/**
 * Write feedback on-chain via ReputationRegistry.giveFeedback().
 * Returns the transaction hash.
 */
export async function writeFeedbackOnChain(
  agentId: number,
  value: number,
  tag1: string,
  tag2: string,
): Promise<string> {
  const client = getWalletClient();
  const scaledValue = BigInt(Math.round(value * 100));

  const hash = await client.writeContract({
    address: CONTRACT_ADDRESSES.sepolia.reputationRegistry,
    abi: reputationRegistryAbi,
    functionName: "giveFeedback",
    args: [
      BigInt(agentId),
      scaledValue,
      2, // decimals
      tagToBytes32(tag1),
      tagToBytes32(tag2),
    ],
  });

  return hash;
}

/**
 * Write validation on-chain via ValidationRegistry.validate().
 * Returns the transaction hash.
 */
export async function writeValidationOnChain(
  agentId: number,
  validationType: string,
  score: number,
): Promise<string> {
  const client = getWalletClient();
  const validationData = encodePacked(
    ["string"],
    [`score:${score.toFixed(2)}`],
  );

  const hash = await client.writeContract({
    address: CONTRACT_ADDRESSES.sepolia.validationRegistry,
    abi: validationRegistryAbi,
    functionName: "validate",
    args: [BigInt(agentId), validationType, validationData],
  });

  return hash;
}
