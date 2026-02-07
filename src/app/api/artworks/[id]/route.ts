import { NextResponse } from "next/server";
import {
  getArtworkById,
  getDerivatives,
  getPurchasesByArtwork,
  getAncestryChain,
} from "@/lib/artworks/store";
import { getAgentById } from "@/lib/agents/seed-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const artwork = getArtworkById(Number(id));
  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  const derivatives = getDerivatives(artwork.id);
  const purchases = getPurchasesByArtwork(artwork.id);
  const ancestryChain = getAncestryChain(artwork.id);
  const creator = getAgentById(artwork.creatorAgentId);

  return NextResponse.json({
    artwork,
    creator,
    derivatives,
    purchases,
    ancestryChain,
  });
}
