import { NextResponse } from "next/server";
import { purchaseArtwork, getArtworkById } from "@/lib/artworks/store";
import { getAgentById } from "@/lib/agents/seed-data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { buyerAgentId, purpose } = body as Record<string, unknown>;

  if (typeof buyerAgentId !== "number" || !Number.isInteger(buyerAgentId) || buyerAgentId < 0) {
    return NextResponse.json(
      { error: "buyerAgentId must be a non-negative integer" },
      { status: 400 },
    );
  }

  if (typeof purpose !== "string" || purpose.trim().length === 0) {
    return NextResponse.json(
      { error: "purpose must be a non-empty string" },
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

  const result = purchaseArtwork(Number(id), buyerAgentId, purpose.trim());
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
