import { prisma } from "@/lib/prisma";

import { getCardImageSrc } from "@/lib/cards/image";

import {
  getRecentPublicDecks,
  getTierDecks,
} from "@/lib/decks";

import { pickDeckEmblem } from "@/lib/decks/emblem";

import {
  getLatestSetsWithBanners,
  type LatestSet,
} from "@/lib/sets";

import { querySkills } from "@/lib/skills/search";

import type { MetaDeck } from "@/types/meta";

const SHOWCASE_CARD_NAMES = [
  "Dark Magician",
  "Dark Magician Girl",
  "Blue-Eyes White Dragon",
];

interface ArtRow {
  name: string;

  image: string | null;

  ygoproId: number | null;
}

export interface HomeData {
  publicDeckCount: number;

  cardCount: number;

  skillCount: number;

  latestSet: LatestSet | null;

  recentDecks: MetaDeck[];

  tierArt: string | null;

  topDeckArt: string | null;

  catalogArt: string | null;

  skillsArt: string | null;

  myDecksArt: string | null;
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
 * alimentan la portada: contadores, set más reciente,
 * mazos de la comunidad y arte de fondo.
 */
export async function getHomeData(): Promise<HomeData> {
  const [
    publicDeckCount,
    cardCount,
    skillResult,
    latestSets,
    recentDecks,
    tierDecks,
    artRows,
  ] = await Promise.all([
    prisma.deck.count({
      where: {
        isPublic: true,
      },
    }),

    prisma.card.count(),

    querySkills({
      page: 1,
      limit: 1,
    }),

    getLatestSetsWithBanners(1),

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

  const topDeck: MetaDeck | null =
    recentDecks[0] ?? tierDeck;

  const tierArt = getCardImageSrc(
    pickDeckEmblem(tierDeck)?.card
  );

  const topDeckArt = getCardImageSrc(
    pickDeckEmblem(topDeck)?.card
  );

  const catalogArt = findArt(
    artRows,
    "Dark Magician"
  );

  const skillsArt =
    findArt(artRows, "Dark Magician Girl") ??
    catalogArt;

  const myDecksArt =
    findArt(
      artRows,
      "Blue-Eyes White Dragon"
    ) ?? catalogArt;

  return {
    publicDeckCount,

    cardCount,

    skillCount: skillResult.total,

    latestSet: latestSets[0] ?? null,

    recentDecks,

    tierArt,

    topDeckArt,

    catalogArt,

    skillsArt,

    myDecksArt,
  };
}
