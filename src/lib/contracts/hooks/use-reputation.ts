"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { reputationRegistryAbi } from "../abis/reputation-registry";
import { CONTRACT_ADDRESSES } from "../addresses";
import { tagToBytes32 } from "@/lib/erc8004/types";

const address = CONTRACT_ADDRESSES.sepolia.reputationRegistry;

export function useGiveFeedback() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const giveFeedback = (
    agentId: number,
    value: number,
    tag1: string,
    tag2: string
  ) => {
    const scaledValue = BigInt(Math.round(value * 100));
    writeContract({
      address,
      abi: reputationRegistryAbi,
      functionName: "giveFeedback",
      args: [
        BigInt(agentId),
        scaledValue,
        2,
        tagToBytes32(tag1),
        tagToBytes32(tag2),
      ],
    });
  };

  return { giveFeedback, hash, isPending, isConfirming, isSuccess, error };
}

export function useReputationSummary(
  agentId: number | undefined,
  options?: { refetchInterval?: number },
) {
  return useReadContract({
    address,
    abi: reputationRegistryAbi,
    functionName: "getSummary",
    args:
      agentId !== undefined
        ? [BigInt(agentId), [], "", ""]
        : undefined,
    query: {
      enabled: agentId !== undefined,
      ...(options?.refetchInterval ? { refetchInterval: options.refetchInterval } : {}),
    },
  });
}

export function useAllFeedback(
  agentId: number | undefined,
  offset = 0,
  limit = 20
) {
  return useReadContract({
    address,
    abi: reputationRegistryAbi,
    functionName: "readAllFeedback",
    args:
      agentId !== undefined
        ? [BigInt(agentId), BigInt(offset), BigInt(limit)]
        : undefined,
    query: { enabled: agentId !== undefined },
  });
}
