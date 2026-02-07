"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Artwork, Purchase } from "@/lib/artworks/types";
import { ARTWORK_STYLES, LICENSE_LABELS } from "@/lib/artworks/types";
import type { DemoAgent } from "@/lib/agents/seed-data";

interface ArtworkDetailResponse {
  artwork: Artwork;
  creator: DemoAgent;
  derivatives: Artwork[];
  purchases: Purchase[];
  ancestryChain: Artwork[];
}

export default function ArtworkDetailPage() {
  const params = useParams();
  const [data, setData] = useState<ArtworkDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/artworks/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) fetchData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-xl font-bold">作品が見つかりません</h2>
        <p className="text-muted-foreground mt-2">
          ID #{params.id} の作品は存在しません
        </p>
        <Button asChild className="mt-4">
          <Link href="/artworks">マーケットプレイスに戻る</Link>
        </Button>
      </div>
    );
  }

  const { artwork, creator, derivatives, purchases, ancestryChain } = data;

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/artworks"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← マーケットプレイスに戻る
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold">{artwork.title}</h1>
            <p className="text-muted-foreground mt-1">
              by{" "}
              <Link
                href={`/agents/${creator?.id}`}
                className="text-primary hover:underline"
              >
                {creator?.name || `Agent #${artwork.creatorAgentId}`}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{ARTWORK_STYLES[artwork.style]}</Badge>
            <Badge
              variant="outline"
              className={
                artwork.license === "open"
                  ? "border-green-500/50 text-green-600"
                  : artwork.license === "exclusive"
                    ? "border-red-500/50 text-red-600"
                    : "border-blue-500/50 text-blue-600"
              }
            >
              {LICENSE_LABELS[artwork.license]}
            </Badge>
            {artwork.parentArtworkId !== null && (
              <Badge
                variant="outline"
                className="border-orange-500/50 text-orange-600"
              >
                二次創作
              </Badge>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{artwork.description}</p>
      </motion.div>

      {/* Ancestry chain */}
      {ancestryChain.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">作品の系譜</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 flex-wrap">
                {ancestryChain.map((a, i) => (
                  <div key={a.id} className="flex items-center gap-2">
                    {i > 0 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                    <Link
                      href={`/artworks/${a.id}`}
                      className={`text-sm px-2 py-1 rounded ${
                        a.id === artwork.id
                          ? "bg-primary/10 text-primary font-medium"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {a.title}
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">作品内容</CardTitle>
            </CardHeader>
            <CardContent>
              {artwork.style === "generative-svg" ? (
                <div
                  className="rounded-lg overflow-hidden bg-black/90"
                  dangerouslySetInnerHTML={{ __html: artwork.content }}
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/50 rounded-lg p-4 overflow-x-auto">
                  {artwork.content}
                </pre>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Price & Stats */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {artwork.price} tokens
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  作品価格
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-semibold">
                    {artwork.purchaseCount}
                  </p>
                  <p className="text-xs text-muted-foreground">購入数</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {artwork.totalRevenue}
                  </p>
                  <p className="text-xs text-muted-foreground">総売上</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    {artwork.derivativeCount}
                  </p>
                  <p className="text-xs text-muted-foreground">二次創作</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {artwork.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                作成日:{" "}
                {new Date(artwork.createdAt).toLocaleDateString("ja-JP")}
              </p>
            </CardContent>
          </Card>

          {/* Revenue distribution info */}
          {artwork.parentArtworkId !== null && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium text-sm mb-3">
                  報酬分配（この作品が売れた場合）
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      二次創作者 (70%)
                    </span>
                    <span className="font-medium text-green-500">
                      {(artwork.price * 0.7).toFixed(0)} tokens
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      原作者ロイヤリティ (30%)
                    </span>
                    <span className="font-medium text-orange-500">
                      {(artwork.price * 0.3).toFixed(0)} tokens
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Derivatives */}
      {derivatives.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-4">
            二次創作 ({derivatives.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {derivatives.map((d) => (
              <Link key={d.id} href={`/artworks/${d.id}`}>
                <Card className="hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="font-medium text-sm">{d.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {d.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {ARTWORK_STYLES[d.style]}
                      </Badge>
                      <span className="text-xs text-primary font-medium">
                        {d.price} tokens
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Purchase history */}
      {purchases.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h2 className="text-xl font-semibold mb-4">
            購入履歴 ({purchases.length})
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {purchases.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Agent #{p.buyerAgentId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.purpose}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-500">
                        {p.price} tokens
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.timestamp).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
