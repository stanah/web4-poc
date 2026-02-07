import type { Artwork, Purchase, RevenueEntry } from "./types";
import { REVENUE_RULES } from "./types";
import { SEED_ARTWORKS, SEED_PURCHASES, SEED_REVENUE } from "./seed-data";

// In-memory store (simulating on-chain state)
const artworks: Artwork[] = [...SEED_ARTWORKS];
const purchases: Purchase[] = [...SEED_PURCHASES];
const revenue: RevenueEntry[] = [...SEED_REVENUE];
let nextArtworkId = SEED_ARTWORKS.length + 1;
let nextPurchaseId = SEED_PURCHASES.length + 1;
let nextRevenueId = SEED_REVENUE.length + 1;

// --- Artworks ---

export function getAllArtworks(): Artwork[] {
  return [...artworks];
}

export function getArtworkById(id: number): Artwork | undefined {
  return artworks.find((a) => a.id === id);
}

export function getArtworksByCreator(agentId: number): Artwork[] {
  return artworks.filter((a) => a.creatorAgentId === agentId);
}

export function getDerivatives(parentId: number): Artwork[] {
  return artworks.filter((a) => a.parentArtworkId === parentId);
}

export function getAncestryChain(artworkId: number): Artwork[] {
  const chain: Artwork[] = [];
  let current = getArtworkById(artworkId);
  while (current) {
    chain.unshift(current);
    if (current.parentArtworkId === null) break;
    current = getArtworkById(current.parentArtworkId);
  }
  return chain;
}

export function addArtwork(
  artwork: Omit<Artwork, "id" | "totalRevenue" | "purchaseCount" | "derivativeCount">,
): Artwork {
  const newArtwork: Artwork = {
    ...artwork,
    id: nextArtworkId++,
    totalRevenue: 0,
    purchaseCount: 0,
    derivativeCount: 0,
  };
  artworks.push(newArtwork);

  // Update parent's derivative count
  if (newArtwork.parentArtworkId !== null) {
    const parent = artworks.find((a) => a.id === newArtwork.parentArtworkId);
    if (parent) {
      parent.derivativeCount++;
    }
  }

  return newArtwork;
}

// --- Purchases ---

export function getAllPurchases(): Purchase[] {
  return [...purchases];
}

export function getPurchasesByArtwork(artworkId: number): Purchase[] {
  return purchases.filter((p) => p.artworkId === artworkId);
}

export function getPurchasesByBuyer(agentId: number): Purchase[] {
  return purchases.filter((p) => p.buyerAgentId === agentId);
}

export function purchaseArtwork(
  artworkId: number,
  buyerAgentId: number,
  purpose: string,
): { purchase: Purchase; revenueEntries: RevenueEntry[] } | null {
  const artwork = getArtworkById(artworkId);
  if (!artwork) return null;

  const purchase: Purchase = {
    id: nextPurchaseId++,
    artworkId,
    buyerAgentId,
    price: artwork.price,
    purpose,
    timestamp: new Date().toISOString(),
  };
  purchases.push(purchase);

  // Update artwork stats
  artwork.purchaseCount++;
  artwork.totalRevenue += artwork.price;

  // Distribute revenue
  const newRevenue = distributeRevenue(artwork, purchase);

  return { purchase, revenueEntries: newRevenue };
}

// --- Revenue ---

function distributeRevenue(artwork: Artwork, purchase: Purchase): RevenueEntry[] {
  const entries: RevenueEntry[] = [];
  const isDerivative = artwork.parentArtworkId !== null;
  const rules = isDerivative ? REVENUE_RULES.derivative : REVENUE_RULES.original;

  // Creator's share
  const creatorAmount = artwork.price * rules.creatorShare;
  entries.push({
    id: nextRevenueId++,
    recipientAgentId: artwork.creatorAgentId,
    artworkId: artwork.id,
    amount: creatorAmount,
    type: "sale",
    fromPurchaseId: purchase.id,
    timestamp: purchase.timestamp,
  });

  // Original creator royalty (if derivative)
  if (isDerivative && artwork.parentArtworkId !== null) {
    const parent = getArtworkById(artwork.parentArtworkId);
    if (parent) {
      const royaltyAmount = artwork.price * rules.originalCreatorRoyalty;
      entries.push({
        id: nextRevenueId++,
        recipientAgentId: parent.creatorAgentId,
        artworkId: artwork.id,
        amount: royaltyAmount,
        type: "derivative-royalty",
        fromPurchaseId: purchase.id,
        timestamp: purchase.timestamp,
      });
    }
  }

  revenue.push(...entries);
  return entries;
}

export function getAllRevenue(): RevenueEntry[] {
  return [...revenue];
}

export function getRevenueByAgent(agentId: number): RevenueEntry[] {
  return revenue.filter((r) => r.recipientAgentId === agentId);
}

export function getAgentRevenueStats(agentId: number) {
  const agentRevenue = getRevenueByAgent(agentId);
  const totalEarned = agentRevenue.reduce((sum, r) => sum + r.amount, 0);
  const salesCount = agentRevenue.filter((r) => r.type === "sale").length;
  const royaltiesCount = agentRevenue.filter((r) => r.type === "derivative-royalty").length;
  const royaltiesEarned = agentRevenue
    .filter((r) => r.type === "derivative-royalty")
    .reduce((sum, r) => sum + r.amount, 0);

  return { totalEarned, salesCount, royaltiesCount, royaltiesEarned };
}

// --- Marketplace Stats ---

export function getMarketplaceStats() {
  const totalArtworks = artworks.length;
  const totalPurchases = purchases.length;
  const totalVolume = revenue.reduce((sum, r) => sum + r.amount, 0);
  const totalDerivatives = artworks.filter((a) => a.parentArtworkId !== null).length;

  const agentEarnings: Record<number, number> = {};
  for (const r of revenue) {
    agentEarnings[r.recipientAgentId] = (agentEarnings[r.recipientAgentId] || 0) + r.amount;
  }

  return {
    totalArtworks,
    totalPurchases,
    totalVolume,
    totalDerivatives,
    agentEarnings,
  };
}
