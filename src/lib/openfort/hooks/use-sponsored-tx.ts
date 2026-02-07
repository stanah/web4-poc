"use client";

import { useState, useCallback } from "react";
import { OPENFORT_CONFIG } from "../config";

interface SponsoredTxState {
  intentId: string | null;
  txHash: string | null;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
}

interface SponsoredTxParams {
  playerId: string;
  contract: string;
  functionName: string;
  functionArgs: unknown[];
}

/**
 * Hook for executing gasless (sponsored) transactions via Openfort.
 * Uses the Openfort policy to sponsor gas fees for whitelisted contracts.
 */
export function useSponsoredTransaction() {
  const [state, setState] = useState<SponsoredTxState>({
    intentId: null,
    txHash: null,
    isLoading: false,
    isSuccess: false,
    error: null,
  });

  const sendTransaction = useCallback(async (params: SponsoredTxParams) => {
    setState({
      intentId: null,
      txHash: null,
      isLoading: true,
      isSuccess: false,
      error: null,
    });

    try {
      const res = await fetch("/api/openfort/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: params.playerId,
          chainId: OPENFORT_CONFIG.chainId,
          policyId: OPENFORT_CONFIG.policyId,
          interactions: [
            {
              contract: params.contract,
              functionName: params.functionName,
              functionArgs: params.functionArgs,
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Transaction failed: ${res.status} ${errorText}`);
      }

      const data = await res.json();

      setState({
        intentId: data.intentId,
        txHash: data.txHash ?? null,
        isLoading: false,
        isSuccess: true,
        error: null,
      });

      return data;
    } catch (err) {
      setState((s) => ({
        ...s,
        isLoading: false,
        isSuccess: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      intentId: null,
      txHash: null,
      isLoading: false,
      isSuccess: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    sendTransaction,
    reset,
  };
}
