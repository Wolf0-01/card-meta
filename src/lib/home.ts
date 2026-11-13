import { prisma } from "@/lib/prisma";

import { getCardImageSrc } from "@/lib/cards/image";

import {
  getRecentPublicDecks,
  getTierDecks,
} from "@/lib/decks";

import { pickDeckEmblem } from "@/lib/decks/emblem";

import type { MetaDeck } from "@/types/meta";

const SHOWCASE_CARD_NAMES = [
  "Dark Magician",
  "Dark Magician Girl",
  "Blue-Eyes White Dragon",
  "Elemental HERO Avian",
];

interface ArtRow {
  name: string;

  image: string | null;

  ygoproId: number | null;
}

export interface HomeData {
  speedDeckCount: number;

  rushDeckCount: number;

  recentDecks: MetaDeck[];

  tierArt: string | null;

  speedDeckArt: string | null;

  rushDeckArt: string | null;

  tournamentArt: string | null;

  newsArt: string | null;

  leaksArt: string | null;
}

function findArt(
  rows: ArtRow[],
  name: string
): string | null {
  const row = rows.find(
    (item) => item.name === name
  );

  return row ? getCardImageSrc(row) : null;
}

/**
 * Agrupa en una sola llamada todos los datos reales que
 * alimentan la portada: contadores por formato, mazos de la
 * comunidad y arte de fondo.
 */
export async function getHomeData(): Promise<HomeData> {
  const [
    speedDeckCount,
    rushDeckCount,
    recentDecks,
    tierDecks,
    artRows,
  ] = await Promise.all([
    prisma.deck.count({
      where: {
        isPublic: true,

        format: "speed",
      },
    }),

    prisma.deck.count({
      where: {
        isPublic: true,

        format: "rush",
      },
    }),

    getRecentPublicDecks(6),

    getTierDecks(),

    prisma.card.findMany({
      where: {
        name: {
          in: SHOWCASE_CARD_NAMES,
        },
      },

      select: {
        name: true,
        image: true,
        ygoproId: true,
      },
    }),
  ]);

  const tierDeck: MetaDeck | null =
    tierDecks[0] ?? recentDecks[0] ?? null;

  const speedDeck: MetaDeck | null =
    recentDecks.find(
      (deck) => deck.format === "speed"
    ) ?? tierDeck;

  const tierArt = getCardImageSrc(
    pickDeckEmblem(tierDeck)?.card
  );

  const speedDeckArt = getCardImageSrc(
    pickDeckEmblem(speedDeck)?.card
  );

  const rushDeckArt =
    findArt(artRows, "Elemental HERO Avian") ??
    tierArt;

  const tournamentArt =
    findArt(artRows, "Blue-Eyes White Dragon") ??
    tierArt;

  const newsArt =
    findArt(artRows, "Dark Magician Girl") ??
    tierArt;

  const leaksArt =
    findArt(artRows, "Dark Magician") ?? tierArt;

  return {
    speedDeckCount,

    rushDeckCount,

    recentDecks,

    tierArt,

    speedDeckArt,

    rushDeckArt,

    tournamentArt,

    newsArt,

    leaksArt,
  };
}
