"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface TxStatusProps {
  hash?: `0x${string}`;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
  successMessage?: string;
}

export function TxStatus({
  hash,
  isPending,
  isConfirming,
  isSuccess,
  error,
  successMessage,
}: TxStatusProps) {
  const t = useTranslations("TxStatus");

  if (!hash && !isPending && !error) return null;

  return (
    <div className="rounded-lg border p-4 space-y-2">
      {isPending && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-sm">{t("waitingWallet")}</span>
        </div>
      )}

      {isConfirming && hash && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-sm">{t("confirming")}</span>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            {t("viewOnEtherscan")}
          </a>
        </div>
      )}

      {isSuccess && hash && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600">
              {t("confirmed")}
            </Badge>
            <span className="text-sm">{successMessage}</span>
          </div>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            {t("viewTransaction")}
          </a>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2">
          <Badge variant="destructive">{t("error")}</Badge>
          <span className="text-sm text-destructive">
            {error.message.slice(0, 100)}
          </span>
        </div>
      )}
    </div>
  );
}
