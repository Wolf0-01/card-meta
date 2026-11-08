import type { Card as PrismaCard } from "@prisma/client";

import type {
  Card,
  CardObtainEntry,
  LinkMarker,
} from "@/types/card";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

// ======================================
// Helpers
// ======================================

function normalizeObtain(
  value: unknown
): CardObtainEntry[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const entries: CardObtainEntry[] = [];

  for (const item of value) {
    if (
      !item ||
      typeof item !== "object"
    ) {
      continue;
    }

    const record = item as Record<
      string,
      unknown
    >;

    const name =
      typeof record.name === "string"
        ? record.name.trim()
        : "";

    if (!name) {
      continue;
    }

    entries.push({
      name,

      type:
        typeof record.type === "string"
          ? record.type
          : null,

      amount:
        typeof record.amount === "number"
          ? record.amount
          : null,
    });
  }

  return entries.length > 0
    ? entries
    : null;
}

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

    obtain: normalizeObtain(card.obtain),
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
