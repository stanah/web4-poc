import { NextResponse } from "next/server";
import { purchaseArtwork, getArtworkById } from "@/lib/artworks/store";
import { getAgentById } from "@/lib/agents/seed-data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { buyerAgentId, purpose } = body;

  if (!buyerAgentId || !purpose) {
    return NextResponse.json(
      { error: "buyerAgentId and purpose are required" },
      { status: 400 },
    );
  }

  const artwork = getArtworkById(Number(id));
  if (!artwork) {
    return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
  }

  if (artwork.creatorAgentId === buyerAgentId) {
    return NextResponse.json(
      { error: "Cannot purchase own artwork" },
      { status: 400 },
    );
  }

  const result = purchaseArtwork(Number(id), buyerAgentId, purpose);
  if (!result) {
    return NextResponse.json({ error: "Purchase failed" }, { status: 500 });
  }

  const buyer = getAgentById(buyerAgentId);
  const creator = getAgentById(artwork.creatorAgentId);

  return NextResponse.json({
    purchase: result.purchase,
    revenueDistribution: result.revenueEntries,
    buyer: buyer?.name,
    creator: creator?.name,
  });
}
