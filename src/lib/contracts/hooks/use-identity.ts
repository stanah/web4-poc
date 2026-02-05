"use client";

import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { identityRegistryAbi } from "../abis/identity-registry";
import { CONTRACT_ADDRESSES } from "../addresses";

const address = CONTRACT_ADDRESSES.sepolia.identityRegistry;

export function useRegisterAgent() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash });

  const register = (agentURI: string) => {
    writeContract({
      address,
      abi: identityRegistryAbi,
      functionName: "register",
      args: [agentURI],
    });
  };

  return { register, hash, isPending, isConfirming, isSuccess, error };
}

export function useAgentTokenURI(agentId: bigint | undefined) {
  return useReadContract({
    address,
    abi: identityRegistryAbi,
    functionName: "tokenURI",
    args: agentId !== undefined ? [agentId] : undefined,
    query: { enabled: agentId !== undefined },
  });
}

export function useAgentOwner(agentId: bigint | undefined) {
  return useReadContract({
    address,
    abi: identityRegistryAbi,
    functionName: "ownerOf",
    args: agentId !== undefined ? [agentId] : undefined,
    query: { enabled: agentId !== undefined },
  });
}

export function useTotalAgents() {
  return useReadContract({
    address,
    abi: identityRegistryAbi,
    functionName: "totalSupply",
  });
}
