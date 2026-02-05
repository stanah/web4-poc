"use client";

import { Badge } from "@/components/ui/badge";

interface ReputationBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getScoreColor(score: number): string {
  if (score >= 4.5) return "bg-green-600 text-white";
  if (score >= 3.5) return "bg-blue-600 text-white";
  if (score >= 2.5) return "bg-yellow-600 text-white";
  return "bg-red-600 text-white";
}

function getScoreLabel(score: number): string {
  if (score >= 4.5) return "Excellent";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Average";
  return "Poor";
}

export function ReputationBadge({ score, size = "md" }: ReputationBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <Badge className={`${getScoreColor(score)} ${sizeClasses[size]}`}>
      {score.toFixed(1)} — {getScoreLabel(score)}
    </Badge>
  );
}
