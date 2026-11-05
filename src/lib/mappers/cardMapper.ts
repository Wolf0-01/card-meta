import type { Card as PrismaCard } from "@prisma/client";

import type {
  Card,
  LinkMarker,
} from "@/types/card";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

// ======================================
// Prisma Card -> Card
// ======================================

export function mapPrismaCard(
  card: PrismaCard
): Card {
  return {
    ...card,

    type: card.type ?? "",

    linkMarkers: Array.isArray(card.linkMarkers)
      ? (card.linkMarkers as LinkMarker[])
      : null,
  };
}

// ======================================
// Prisma Preview -> CardPreviewData
// ======================================

export function mapPrismaCardPreview(
  card: Omit<
    CardPreviewData,
    "linkMarkers"
  > & {
    linkMarkers: unknown;
  }
): CardPreviewData {
  return {
    ...card,

    linkMarkers: Array.isArray(card.linkMarkers)
      ? (card.linkMarkers as LinkMarker[])
      : null,
  };
}