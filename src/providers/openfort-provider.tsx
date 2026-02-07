"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAccount } from "wagmi";

interface OpenfortContextValue {
  /** Openfort player ID (smart account owner) */
  playerId: string | null;
  /** Smart account address derived from Openfort */
  smartAccountAddress: string | null;
  /** Whether the smart account is being initialized */
  isInitializing: boolean;
  /** Whether a smart account has been set up */
  hasSmartAccount: boolean;
  /** Initialize the Openfort smart account for the connected wallet */
  initSmartAccount: () => Promise<void>;
  /** Send a gasless transaction via Openfort */
  sendSponsoredTx: (params: {
    contract: string;
    functionName: string;
    functionArgs: unknown[];
  }) => Promise<{ intentId: string; txHash: string | null }>;
  /** Error from the last operation */
  error: string | null;
}

const OpenfortContext = createContext<OpenfortContextValue | null>(null);

export function OpenfortProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null,
  );
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initSmartAccount = useCallback(async () => {
    if (!address) {
      setError("Wallet not connected");
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      const res = await fetch("/api/openfort/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });

      if (!res.ok) {
        throw new Error(`Failed to init smart account: ${res.status}`);
      }

      const data = await res.json();
      setPlayerId(data.playerId);
      setSmartAccountAddress(data.smartAccountAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsInitializing(false);
    }
  }, [address]);

  const sendSponsoredTx = useCallback(
    async (params: {
      contract: string;
      functionName: string;
      functionArgs: unknown[];
    }) => {
      if (!playerId) {
        throw new Error("Smart account not initialized. Call initSmartAccount first.");
      }

      const res = await fetch("/api/openfort/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId,
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
        const text = await res.text();
        throw new Error(`Sponsored tx failed: ${res.status} ${text}`);
      }

      return res.json();
    },
    [playerId],
  );

  return (
    <OpenfortContext.Provider
      value={{
        playerId,
        smartAccountAddress,
        isInitializing,
        hasSmartAccount: !!playerId,
        initSmartAccount,
        sendSponsoredTx,
        error,
      }}
    >
      {children}
    </OpenfortContext.Provider>
  );
}

export function useOpenfort() {
  const context = useContext(OpenfortContext);
  if (!context) {
    throw new Error("useOpenfort must be used within an OpenfortProvider");
  }
  return context;
}
