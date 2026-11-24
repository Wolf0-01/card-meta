import { prisma } from "@/lib/prisma";

import { getCardImageSrc } from "@/lib/cards/image";

import {
  getRecentPublicDecks,
  getTierDecks,
} from "@/lib/decks";

import { pickDeckEmblem } from "@/lib/decks/emblem";

import { formatNumber } from "@/lib/format";

import {
  getNewsCategory,
  newsCategoryKeyFromEnum,
} from "@/lib/newsCategories";

import { parseTournamentStandings } from "@/lib/tournaments";

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

export type HomeFeedLabel =
  | "TOURNAMENTS"
  | "UPDATES"
  | "EVENTS"
  | "BOXES"
  | "BANLIST";

export interface HomeFeedItem {
  id: string;

  label: HomeFeedLabel;

  title: string;

  summary: string | null;

  date: string;

  href: string;

  image: string | null;
}

export interface HomeData {
  speedDeckCount: number;

  rushDeckCount: number;

  feed: HomeFeedItem[];

  tierArt: string | null;

  speedDeckArt: string | null;

  rushDeckArt: string | null;

  tournamentArt: string | null;

  newsArt: string | null;

  guidesArt: string | null;
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

function normalizeArchetype(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

/**
 * Agrupa en una sola llamada todos los datos reales que
 * alimentan la portada: contadores por formato, arte de
 * fondo y el feed combinado de torneos y noticias.
 */
export async function getHomeData(): Promise<HomeData> {
  const [
    speedDeckCount,
    rushDeckCount,
    recentDecks,
    tierDecks,
    artRows,
    tournaments,
    newsArticles,
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

    prisma.tournament.findMany({
      orderBy: {
        date: "desc",
      },

      take: 8,
    }),

    prisma.newsArticle.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 8,
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

  const guidesArt =
    findArt(artRows, "Dark Magician") ?? tierArt;

  const championArchetypes = Array.from(
    new Set(
      tournaments.flatMap((tournament) => {
        const champion =
          parseTournamentStandings(
            tournament.standings
          )[0];

        return champion
          ? [champion.archetype]
          : [];
      })
    )
  );

  const archetypeCards =
    championArchetypes.length > 0
      ? await prisma.card.findMany({
          where: {
            archetype: {
              in: championArchetypes,
            },
          },

          select: {
            archetype: true,
            image: true,
            ygoproId: true,
          },

          orderBy: {
            name: "asc",
          },
        })
      : [];

  const artByArchetype = new Map<
    string,
    string
  >();

  for (const card of archetypeCards) {
    if (!card.archetype) {
      continue;
    }

    const key = normalizeArchetype(
      card.archetype
    );

    if (artByArchetype.has(key)) {
      continue;
    }

    const image = getCardImageSrc(card);

    if (image) {
      artByArchetype.set(key, image);
    }
  }

  const tournamentFeed: HomeFeedItem[] =
    tournaments.map((tournament) => {
      const champion =
        parseTournamentStandings(
          tournament.standings
        )[0];

      const championArt = champion
        ? artByArchetype.get(
            normalizeArchetype(
              champion.archetype
            )
          )
        : undefined;

      return {
        id: `tournament-${tournament.id}`,

        label: "TOURNAMENTS",

        title: tournament.name,

        summary: champion
          ? `${champion.player} won with ${champion.archetype}`
          : `${formatNumber(
              tournament.playerCount
            )} players · ${tournament.format}`,

        date: tournament.date.toISOString(),

        href: `/tournaments/${tournament.slug}`,

        image: championArt ?? tournamentArt,

      };
    });

  const newsFeed: HomeFeedItem[] =
    newsArticles.map((article) => {
      const category = getNewsCategory(
        newsCategoryKeyFromEnum(
          article.category
        )
      );

      return {
        id: `news-${article.id}`,

        label: category.label.toUpperCase() as HomeFeedLabel,

        title: article.title,

        summary: article.summary,

        date: article.createdAt.toISOString(),

        href: `/news/${article.slug}`,

        image: article.coverUrl || newsArt,
      };
    });

  const feed = [
    ...tournamentFeed,
    ...newsFeed,
  ]
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    )
    .slice(0, 8);

  return {
    speedDeckCount,

    rushDeckCount,

    feed,

    tierArt,

    speedDeckArt,

    rushDeckArt,

    tournamentArt,

    newsArt,

    guidesArt,
  };
}
