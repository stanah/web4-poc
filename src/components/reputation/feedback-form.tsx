"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useGiveFeedback } from "@/lib/contracts/hooks/use-reputation";
import { FEEDBACK_TAGS, type FeedbackTag } from "@/lib/erc8004/types";
import { TxStatus } from "@/components/web3/tx-status";

interface FeedbackFormProps {
  agentId: number;
}

export function FeedbackForm({ agentId }: FeedbackFormProps) {
  const { isConnected } = useAccount();
  const { giveFeedback, hash, isPending, isConfirming, isSuccess, error } =
    useGiveFeedback();

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<FeedbackTag[]>([]);

  const toggleTag = (tag: FeedbackTag) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= 2) return [prev[1], tag];
      return [...prev, tag];
    });
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    const tag1 = selectedTags[0] || "";
    const tag2 = selectedTags[1] || "";
    giveFeedback(agentId, rating, tag1, tag2);
  };

  if (!isConnected) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">
            Connect wallet to leave feedback
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leave Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Star Rating */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transition-transform hover:scale-110"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <svg
                  className={`h-8 w-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground"
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Tags (select up to 2)
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(FEEDBACK_TAGS) as FeedbackTag[]).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          disabled={rating === 0 || isPending || isConfirming}
        >
          {isPending
            ? "Confirm in Wallet..."
            : isConfirming
              ? "Submitting..."
              : "Submit Feedback (On-chain)"}
        </Button>

        <TxStatus
          hash={hash}
          isPending={isPending}
          isConfirming={isConfirming}
          isSuccess={isSuccess}
          error={error}
          successMessage="Feedback submitted on-chain!"
        />
      </CardContent>
    </Card>
  );
}
