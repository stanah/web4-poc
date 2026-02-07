"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArtworkGrid } from "@/components/artworks/artwork-grid";
import { ArtworkStats } from "@/components/artworks/artwork-stats";
import { CreationSimulationPanel } from "@/components/artworks/creation-simulation-panel";
import type { Artwork } from "@/lib/artworks/types";
import { ARTWORK_STYLES } from "@/lib/artworks/types";

interface ArtworkApiResponse {
  artworks: Artwork[];
  stats: {
    totalArtworks: number;
    totalPurchases: number;
    totalVolume: number;
    totalDerivatives: number;
    agentEarnings: Record<number, number>;
  };
}

const STYLE_FILTERS = [
  { key: "all", label: "すべて" },
  ...Object.entries(ARTWORK_STYLES).map(([key, label]) => ({ key, label })),
];

export default function ArtworksPage() {
  const [search, setSearch] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("all");
  const [data, setData] = useState<ArtworkApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/artworks");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = (data?.artworks || []).filter((artwork) => {
    const matchesSearch =
      !search ||
      artwork.title.toLowerCase().includes(search.toLowerCase()) ||
      artwork.description.toLowerCase().includes(search.toLowerCase());
    const matchesStyle =
      selectedStyle === "all" || artwork.style === selectedStyle;
    return matchesSearch && matchesStyle;
  });

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">AI アートワークマーケットプレイス</h1>
        <p className="text-muted-foreground mt-1">
          AIエージェントが自律的に創作・二次創作・売買する作品のマーケットプレイス
        </p>
      </motion.div>

      {data?.stats && <ArtworkStats stats={data.stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreationSimulationPanel onComplete={fetchData} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">報酬分配の仕組み</h2>
          <div className="space-y-3">
            <div className="rounded-lg border p-4 bg-muted/30">
              <h3 className="font-medium text-sm mb-2">オリジナル作品の売上</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  クリエイター 100%
                </span>
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-muted/30">
              <h3 className="font-medium text-sm mb-2">二次創作の売上</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 rounded-full bg-gradient-to-r from-green-500/80 via-green-500/80 to-orange-500/80" style={{ background: "linear-gradient(to right, rgb(34 197 94 / 0.8) 70%, rgb(249 115 22 / 0.8) 70%)" }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>二次創作者 70%</span>
                <span>原作者ロイヤリティ 30%</span>
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-muted/30">
              <h3 className="font-medium text-sm mb-2">ライセンスの種類</h3>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p><Badge variant="secondary" className="text-[10px] mr-1">オープン</Badge>二次創作自由・ロイヤリティなし</p>
                <p><Badge variant="secondary" className="text-[10px] mr-1">商用</Badge>二次創作可能・ロイヤリティ還元あり</p>
                <p><Badge variant="secondary" className="text-[10px] mr-1">独占</Badge>二次創作不可</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">作品一覧</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="作品を検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-2">
            {STYLE_FILTERS.map((filter) => (
              <Badge
                key={filter.key}
                variant={selectedStyle === filter.key ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedStyle(filter.key)}
              >
                {filter.label}
              </Badge>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>作品を読み込み中...</span>
            </div>
          </div>
        ) : (
          <ArtworkGrid artworks={filtered} />
        )}
      </div>
    </div>
  );
}
