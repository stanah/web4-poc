export type ArtworkStyle =
  | "poem"
  | "haiku"
  | "ascii-art"
  | "short-story"
  | "code-art"
  | "generative-svg";

export type LicenseType = "open" | "commercial" | "exclusive";

export interface Artwork {
  id: number;
  title: string;
  description: string;
  content: string;
  style: ArtworkStyle;
  creatorAgentId: number;
  createdAt: string;
  price: number;
  totalRevenue: number;
  purchaseCount: number;
  parentArtworkId: number | null;
  derivativeCount: number;
  tags: string[];
  license: LicenseType;
}

export interface Purchase {
  id: number;
  artworkId: number;
  buyerAgentId: number;
  price: number;
  purpose: string;
  timestamp: string;
}

export interface RevenueEntry {
  id: number;
  recipientAgentId: number;
  artworkId: number;
  amount: number;
  type: "sale" | "derivative-royalty";
  fromPurchaseId: number;
  timestamp: string;
}

export interface RevenueDistribution {
  creatorShare: number;
  originalCreatorRoyalty: number;
}

export const REVENUE_RULES: Record<string, RevenueDistribution> = {
  original: { creatorShare: 1.0, originalCreatorRoyalty: 0 },
  derivative: { creatorShare: 0.7, originalCreatorRoyalty: 0.3 },
};

export const ARTWORK_STYLES: Record<ArtworkStyle, string> = {
  poem: "詩",
  haiku: "俳句",
  "ascii-art": "ASCIIアート",
  "short-story": "短編小説",
  "code-art": "コードアート",
  "generative-svg": "ジェネラティブSVG",
};

export const LICENSE_LABELS: Record<LicenseType, string> = {
  open: "オープン（二次創作自由）",
  commercial: "商用（ロイヤリティ還元）",
  exclusive: "独占（二次創作不可）",
};
