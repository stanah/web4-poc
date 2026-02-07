"use client";

import { useReadContract } from "wagmi";
import { validationRegistryAbi } from "../abis/validation-registry";
import { CONTRACT_ADDRESSES } from "../addresses";

const address = CONTRACT_ADDRESSES.sepolia.validationRegistry;

export interface Validation {
  validator: `0x${string}`;
  validationType: string;
  validationData: `0x${string}`;
  timestamp: bigint;
}

export function useValidations(agentId: number | undefined) {
  return useReadContract({
    address,
    abi: validationRegistryAbi,
    functionName: "getValidations",
    args: agentId !== undefined ? [BigInt(agentId)] : undefined,
    query: { enabled: agentId !== undefined },
  });
}
