import { cache } from "react";

import { getCardImageSrc } from "@/lib/cards/image";

import { prisma } from "@/lib/prisma";

import { getTierEntriesForFormat } from "@/lib/tier-entries/service";

import type { TierEntryTier } from "@/lib/tier-entries/editor";

export type TierBandKey =
  | "tier-1"
  | "tier-2"
  | "tier-3"
  | "high-potential";

export type DuelFormat = "speed" | "rush";

export interface TierListArchetype {
  key: string;

  /** Id de la entrada editable de la Tier List. */
  entryId: string;

  name: string;

  /** Término que se envía a /decks?q= para abrir sus listas. */
  searchTerm: string;

  tier: TierBandKey;

  /** Puntuación 0-100 definida por el staff. */
  powerScore: number;

  /** Mazos públicos registrados para este arquetipo. */
  deckCount: number;

  /** Cartas del arquetipo disponibles en el catálogo. */
  cardCount: number;

  image: string | null;

  signatureName: string | null;

  /** Nota editorial del staff. */
  notes: string | null;
}

export interface TierListBand {
  key: TierBandKey;

  archetypes: TierListArchetype[];
}

export interface TierListData {
  format: DuelFormat;

  updatedAt: string;

  totalPublicDecks: number;

  totalArchetypes: number;

  hasData: boolean;

  bands: TierListBand[];
}

const TIER_ORDER: TierBandKey[] = [
  "tier-1",
  "tier-2",
  "tier-3",
  "high-potential",
];

const BAND_BY_TIER: Record<
  TierEntryTier,
  TierBandKey
> = {
  TIER_1: "tier-1",
  TIER_2: "tier-2",
  TIER_3: "tier-3",
  HIGH_POTENTIAL: "high-potential",
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function isRushFormat(format: string): boolean {
  return format.toLowerCase().includes("rush");
}

interface DeckForTierList {
  name: string;

  format: string;

  archetype: {
    name: string;
  } | null;
}

/**
 * Construye la Tier List competitiva a partir de las
 * entradas reales que mantiene el staff en PostgreSQL.
 *
 * Los contadores de mazos y cartas se calculan con el
 * catálogo público; el orden y el Power Score son
 * editoriales y se editan desde /tier-list.
 */
export const getTierList = cache(
  async (
    format: DuelFormat = "speed"
  ): Promise<TierListData> => {
    const entries =
      await getTierEntriesForFormat(format);

    const [decks, cardCountRows] =
      await Promise.all([
        prisma.deck.findMany({
          where: {
            isPublic: true,
          },

          select: {
            name: true,

            format: true,

            archetype: {
              select: {
                name: true,
              },
            },
          },
        }),

        prisma.card.groupBy({
          by: ["archetype"],

          where: {
            format,
          },

          _count: {
            _all: true,
          },
        }),
      ]);

    const formatDecks: DeckForTierList[] =
      decks.filter((deck) =>
        format === "rush"
          ? isRushFormat(deck.format)
          : !isRushFormat(deck.format)
      );

    const cardCounts = new Map(
      cardCountRows.map((row) => [
        normalize(row.archetype ?? ""),
        row._count._all,
      ])
    );

    const ygoproIds = entries.flatMap(
      (entry) =>
        entry.ygoproId ? [entry.ygoproId] : []
    );

    const cardNames = entries.flatMap(
      (entry) =>
        entry.cardName ? [entry.cardName] : []
    );

    const cards =
      ygoproIds.length > 0 ||
      cardNames.length > 0
        ? await prisma.card.findMany({
            where: {
              OR: [
                ...(ygoproIds.length > 0
                  ? [
                      {
                        ygoproId: {
                          in: ygoproIds,
                        },
                      },
                    ]
                  : []),

                ...(cardNames.length > 0
                  ? [
                      {
                        name: {
                          in: cardNames,
                        },
                      },
                    ]
                  : []),
              ],
            },

            select: {
              name: true,
              ygoproId: true,
              image: true,
            },
          })
        : [];

    const cardsById = new Map(
      cards.flatMap((card) =>
        card.ygoproId
          ? [[card.ygoproId, card] as const]
          : []
      )
    );

    const cardsByName = new Map(
      cards.map((card) => [
        card.name,
        card,
      ])
    );

    const archetypes: TierListArchetype[] =
      entries.map((entry) => {
        const normalizedArchetype = normalize(
          entry.archetype
        );

        const deckCount = formatDecks.filter(
          (deck) => {
            const relation =
              deck.archetype?.name;

            if (
              relation &&
              normalize(relation).includes(
                normalizedArchetype
              )
            ) {
              return true;
            }

            return normalize(deck.name).includes(
              normalizedArchetype
            );
          }
        ).length;

        const signature =
          (entry.ygoproId
            ? cardsById.get(entry.ygoproId)
            : undefined) ??
          (entry.cardName
            ? cardsByName.get(entry.cardName)
            : undefined);

        const image =
          getCardImageSrc(signature) ??
          (entry.ygoproId
            ? `/cards/${entry.ygoproId}.jpg`
            : null);

        return {
          key: entry.id,

          entryId: entry.id,

          name: entry.archetype,

          searchTerm: entry.archetype,

          tier: BAND_BY_TIER[entry.tier],

          powerScore: entry.powerScore,

          deckCount,

          cardCount:
            cardCounts.get(normalizedArchetype) ??
            0,

          image,

          signatureName:
            entry.cardName ??
            signature?.name ??
            null,

          notes: entry.notes,
        };
      });

    const bands: TierListBand[] = TIER_ORDER.map(
      (key) => ({
        key,

        archetypes: archetypes
          .filter(
            (archetype) =>
              archetype.tier === key
          )
          .sort(
            (a, b) =>
              b.powerScore - a.powerScore ||
              b.deckCount - a.deckCount ||
              a.name.localeCompare(b.name)
          ),
      })
    );

    const latestUpdate = entries.reduce(
      (latest, entry) => {
        const time = new Date(
          entry.updatedAt
        ).getTime();

        return time > latest ? time : latest;
      },
      0
    );

    return {
      format,

      updatedAt: new Date(
        latestUpdate || Date.now()
      ).toISOString(),

      totalPublicDecks: formatDecks.length,

      totalArchetypes: archetypes.length,

      hasData: archetypes.length > 0,

      bands,
    };
  }
);
