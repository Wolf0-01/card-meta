import type { Card as PrismaCard } from "@prisma/client";

import { normalizeDuelFormat } from "@/lib/duelFormat";

import { normalizeBanlistStatus } from "@/lib/banlist";

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

    format: normalizeDuelFormat(card.format),

    type: card.type ?? "",

    banlistStatus: normalizeBanlistStatus(
      card.banlistStatus
    ),

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
    "linkMarkers" | "format" | "banlistStatus"
  > & {
    format: string;

    linkMarkers: unknown;

    banlistStatus?: unknown;
  }
): CardPreviewData {
  return {
    ...card,

    format: normalizeDuelFormat(card.format),

    banlistStatus: normalizeBanlistStatus(
      card.banlistStatus
    ),

    linkMarkers: Array.isArray(card.linkMarkers)
      ? (card.linkMarkers as LinkMarker[])
      : null,
  };
}
