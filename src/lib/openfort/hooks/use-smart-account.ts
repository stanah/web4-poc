"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAccount } from "wagmi";

interface SmartAccountState {
  playerId: string | null;
  smartAccountAddress: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to manage the user's Openfort smart account.
 * Creates or retrieves a smart account linked to the connected wallet.
 */
export function useSmartAccount() {
  const { address } = useAccount();
  const prevAddressRef = useRef(address);
  const [state, setState] = useState<SmartAccountState>({
    playerId: null,
    smartAccountAddress: null,
    isLoading: false,
    error: null,
  });

  // Reset state when wallet address changes (switch/disconnect)
  useEffect(() => {
    if (prevAddressRef.current !== address) {
      prevAddressRef.current = address;
      setState({
        playerId: null,
        smartAccountAddress: null,
        isLoading: false,
        error: null,
      });
    }
  }, [address]);

  const initSmartAccount = useCallback(async () => {
    if (!address) {
      setState((s) => ({ ...s, error: "Wallet not connected" }));
      return;
    }

    setState((s) => ({ ...s, isLoading: true, error: null }));

    try {
      const res = await fetch("/api/openfort/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!res.ok) {
        throw new Error(`Failed to create smart account: ${res.status}`);
      }

      const data = await res.json();

      setState({
        playerId: data.playerId,
        smartAccountAddress: data.smartAccountAddress,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  }, [address]);

  return {
    ...state,
    address,
    initSmartAccount,
    hasSmartAccount: !!state.playerId,
  };
}
