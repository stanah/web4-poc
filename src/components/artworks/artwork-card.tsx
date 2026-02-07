"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Artwork } from "@/lib/artworks/types";
import { ARTWORK_STYLES } from "@/lib/artworks/types";
import { getAgentById } from "@/lib/agents/seed-data";

interface ArtworkCardProps {
  artwork: Artwork;
  index?: number;
}

export function ArtworkCard({ artwork, index = 0 }: ArtworkCardProps) {
  const creator = getAgentById(artwork.creatorAgentId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 flex flex-col h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {artwork.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {creator?.name || `Agent #${artwork.creatorAgentId}`}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {ARTWORK_STYLES[artwork.style]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 flex-1 flex flex-col">
          {/* Content preview */}
          <div className="bg-muted/50 rounded-md p-3 font-mono text-xs leading-relaxed line-clamp-4 overflow-hidden flex-1">
            {artwork.style === "generative-svg" ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                [SVG Art]
              </div>
            ) : artwork.style === "music" ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <span className="text-base">♪</span>
                  {artwork.musicMetadata && (
                    <span>{artwork.musicMetadata.genre} / {artwork.musicMetadata.bpm}BPM / {artwork.musicMetadata.key}</span>
                  )}
                </div>
                <pre className="whitespace-pre-wrap">{artwork.content.slice(0, 150)}</pre>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{artwork.content.slice(0, 200)}</pre>
            )}
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2">
            {artwork.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {artwork.parentArtworkId !== null && (
              <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-600">
                二次創作
              </Badge>
            )}
            {artwork.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
            <div className="flex items-center gap-3">
              <span>{artwork.price} tokens</span>
              <span>{artwork.purchaseCount} sales</span>
            </div>
            {artwork.derivativeCount > 0 && (
              <span>{artwork.derivativeCount} derivatives</span>
            )}
          </div>

          <Button asChild variant="default" size="sm" className="w-full">
            <Link href={`/artworks/${artwork.id}`}>
              詳細を見る
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
