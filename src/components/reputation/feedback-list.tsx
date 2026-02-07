"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAllFeedback } from "@/lib/contracts/hooks/use-reputation";
import { bytes32ToTag } from "@/lib/erc8004/types";
import { useTranslations } from "next-intl";
import { useTagLabel } from "@/lib/i18n/tag-utils";

const MOCK_FEEDBACK: Record<number, { from: string; rating: number; tags: string[]; timestamp: string }[]> = {
  1: [
    { from: "0x1234...abcd", rating: 4, tags: ["accuracy", "speed"], timestamp: "2026-02-05T10:30:00Z" },
    { from: "0x5678...efgh", rating: 5, tags: ["reliability"], timestamp: "2026-02-04T14:20:00Z" },
    { from: "0x9abc...ijkl", rating: 4, tags: ["accuracy", "reliability"], timestamp: "2026-02-03T09:15:00Z" },
    { from: "0xdef0...mnop", rating: 3, tags: ["speed"], timestamp: "2026-02-02T18:45:00Z" },
    { from: "0x2345...qrst", rating: 5, tags: ["accuracy", "helpfulness"], timestamp: "2026-02-01T11:00:00Z" },
  ],
  2: [
    { from: "0xaaaa...1111", rating: 5, tags: ["accuracy", "helpfulness"], timestamp: "2026-02-05T08:00:00Z" },
    { from: "0xbbbb...2222", rating: 4, tags: ["speed", "reliability"], timestamp: "2026-02-04T16:30:00Z" },
    { from: "0xcccc...3333", rating: 5, tags: ["creativity"], timestamp: "2026-02-03T12:00:00Z" },
  ],
  3: [
    { from: "0xdddd...4444", rating: 5, tags: ["accuracy", "creativity"], timestamp: "2026-02-05T14:00:00Z" },
    { from: "0xeeee...5555", rating: 5, tags: ["helpfulness", "reliability"], timestamp: "2026-02-04T10:00:00Z" },
    { from: "0xffff...6666", rating: 4, tags: ["accuracy"], timestamp: "2026-02-03T09:00:00Z" },
    { from: "0x1111...7777", rating: 5, tags: ["speed", "reliability"], timestamp: "2026-02-02T15:30:00Z" },
  ],
};

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-3.5 w-3.5 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

function shortenAddress(addr: string): string {
  if (addr.length <= 13) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface FeedbackListProps {
  agentId: number;
}

export function FeedbackList({ agentId }: FeedbackListProps) {
  const { data: onChainFeedback, isLoading } = useAllFeedback(agentId);
  const t = useTranslations("FeedbackList");
  const getTagLabel = useTagLabel();

  // Convert on-chain feedback to display format
  const feedbacks = onChainFeedback && Array.isArray(onChainFeedback) && onChainFeedback.length > 0
    ? onChainFeedback.map((fb: { from: string; value: bigint; decimals: number; tag1: `0x${string}`; tag2: `0x${string}`; timestamp: bigint }) => {
        const rating = Math.round(Number(fb.value) / Math.pow(10, fb.decimals));
        const tags: string[] = [];
        const t1 = bytes32ToTag(fb.tag1 as `0x${string}`);
        const t2 = bytes32ToTag(fb.tag2 as `0x${string}`);
        if (t1) tags.push(t1);
        if (t2) tags.push(t2);
        return {
          from: shortenAddress(fb.from as string),
          rating: Math.min(5, Math.max(1, rating)),
          tags,
          timestamp: new Date(Number(fb.timestamp) * 1000).toISOString(),
        };
      })
    : MOCK_FEEDBACK[agentId] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <ScrollArea className="h-[350px]">
            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("noFeedback")}
                </p>
              ) : (
                feedbacks.map((fb, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-muted-foreground">
                        {fb.from}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(fb.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <StarDisplay rating={fb.rating} />
                      <div className="flex gap-1">
                        {fb.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {getTagLabel(tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
