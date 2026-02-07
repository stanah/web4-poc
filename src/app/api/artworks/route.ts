import { NextResponse } from "next/server";
import { getAllArtworks, getMarketplaceStats } from "@/lib/artworks/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get("creatorId");
  const style = searchParams.get("style");
  const tag = searchParams.get("tag");

  let artworks = getAllArtworks();

  if (creatorId) {
    artworks = artworks.filter((a) => a.creatorAgentId === Number(creatorId));
  }
  if (style) {
    artworks = artworks.filter((a) => a.style === style);
  }
  if (tag) {
    artworks = artworks.filter((a) => a.tags.includes(tag));
  }

  // Sort by newest first
  artworks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const stats = getMarketplaceStats();

  return NextResponse.json({ artworks, stats });
}
