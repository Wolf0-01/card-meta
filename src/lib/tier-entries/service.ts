import { cache } from "react";

import type {
  TierEntry as PrismaTierEntry,
  TierEntryFormat,
  TierEntryTier as PrismaTierEntryTier,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import type { DuelFormat } from "@/lib/tier-list";

import type {
  TierEntryEditorData,
  TierEntryTier,
} from "./editor";

import { TierEntryError } from "./errors";

import {
  parseTierEntryCreate,
  parseTierEntryUpdate,
} from "./validation";

const FORMAT_TO_ENUM: Record<
  DuelFormat,
  TierEntryFormat
> = {
  speed: "SPEED",
  rush: "RUSH",
};

const ENUM_TO_FORMAT: Record<
  TierEntryFormat,
  DuelFormat
> = {
  SPEED: "speed",
  RUSH: "rush",
};

const TIER_ORDER: PrismaTierEntryTier[] = [
  "TIER_1",
  "TIER_2",
  "TIER_3",
  "HIGH_POTENTIAL",
];

function toEditorData(
  entry: PrismaTierEntry
): TierEntryEditorData {
  return {
    id: entry.id,

    format: ENUM_TO_FORMAT[entry.format],

    tier: entry.tier as TierEntryTier,

    archetype: entry.archetype,

    cardName: entry.cardName,

    ygoproId: entry.ygoproId,

    powerScore: entry.powerScore,

    notes: entry.notes,

    updatedAt: entry.updatedAt.toISOString(),
  };
}

function sortEntries(
  entries: PrismaTierEntry[]
): PrismaTierEntry[] {
  return [...entries].sort(
    (a, b) =>
      TIER_ORDER.indexOf(a.tier) -
        TIER_ORDER.indexOf(b.tier) ||
      b.powerScore - a.powerScore ||
      a.archetype.localeCompare(b.archetype)
  );
}

function isUniqueConstraintError(
  error: unknown
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code ===
      "P2002"
  );
}

function handlePrismaError(
  error: unknown
): never {
  if (isUniqueConstraintError(error)) {
    throw new TierEntryError(
      "CONFLICT",
      "This archetype is already in the tier list for that format"
    );
  }

  throw error;
}

/**
 * Entradas reales de la Tier List para el editor del staff.
 * La función se cachea por petición para que la página y la
 * capa de datos compartan la misma consulta.
 */
export const getTierEntriesForFormat = cache(
  async (
    format: DuelFormat
  ): Promise<TierEntryEditorData[]> => {
    const entries =
      await prisma.tierEntry.findMany({
        where: {
          format: FORMAT_TO_ENUM[format],
        },

        orderBy: {
          powerScore: "desc",
        },
      });

    return sortEntries(entries).map(
      toEditorData
    );
  }
);

export async function createTierEntry(
  body: unknown
): Promise<TierEntryEditorData> {
  const input = parseTierEntryCreate(body);

  try {
    const entry =
      await prisma.tierEntry.create({
        data: {
          format: input.format,

          tier: input.tier,

          archetype: input.archetype,

          cardName: input.cardName ?? null,

          ygoproId: input.ygoproId ?? null,

          powerScore: input.powerScore,

          notes: input.notes ?? null,
        },
      });

    return toEditorData(entry);
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function updateTierEntry(
  entryId: string,
  body: unknown
): Promise<TierEntryEditorData> {
  const patch = parseTierEntryUpdate(body);

  const existing =
    await prisma.tierEntry.findUnique({
      where: {
        id: entryId,
      },
    });

  if (!existing) {
    throw new TierEntryError(
      "NOT_FOUND",
      "The tier entry does not exist"
    );
  }

  try {
    const entry =
      await prisma.tierEntry.update({
        where: {
          id: existing.id,
        },

        data: {
          ...(patch.format !== undefined
            ? { format: patch.format }
            : {}),

          ...(patch.tier !== undefined
            ? { tier: patch.tier }
            : {}),

          ...(patch.archetype !== undefined
            ? { archetype: patch.archetype }
            : {}),

          ...(patch.cardName !== undefined
            ? { cardName: patch.cardName }
            : {}),

          ...(patch.ygoproId !== undefined
            ? { ygoproId: patch.ygoproId }
            : {}),

          ...(patch.powerScore !== undefined
            ? { powerScore: patch.powerScore }
            : {}),

          ...(patch.notes !== undefined
            ? { notes: patch.notes }
            : {}),
        },
      });

    return toEditorData(entry);
  } catch (error) {
    throw handlePrismaError(error);
  }
}

export async function deleteTierEntry(
  entryId: string
): Promise<TierEntryEditorData> {
  const existing =
    await prisma.tierEntry.findUnique({
      where: {
        id: entryId,
      },
    });

  if (!existing) {
    throw new TierEntryError(
      "NOT_FOUND",
      "The tier entry does not exist"
    );
  }

  await prisma.tierEntry.delete({
    where: {
      id: existing.id,
    },
  });

  return toEditorData(existing);
}
