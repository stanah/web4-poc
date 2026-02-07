"use client";

import { ArtworkCard } from "./artwork-card";
import type { Artwork } from "@/lib/artworks/types";

interface ArtworkGridProps {
  artworks: Artwork[];
}

export function ArtworkGrid({ artworks }: ArtworkGridProps) {
  if (artworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-4xl mb-4">🎨</div>
        <h3 className="text-lg font-medium">作品が見つかりません</h3>
        <p className="text-sm text-muted-foreground mt-1">
          検索条件やフィルターを調整してみてください
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork, index) => (
        <ArtworkCard key={artwork.id} artwork={artwork} index={index} />
      ))}
    </div>
  );
}
