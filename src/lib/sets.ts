import { cache } from "react";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { mapPrismaCardPreview } from "@/lib/mappers/cardMapper";

import {
  normalizeRarity,
  type CardRarity,
} from "@/components/cards/cardRarity";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import { slugifySetName } from "./setSlug";

export interface CardSetSummary {
  name: string;

  slug: string;

  type: string | null;

  cardCount: number;
}

export interface CardSetGroup {
  rarity: CardRarity;

  cards: CardPreviewData[];
}

const RARITY_ORDER: CardRarity[] = [
  "UR",
  "SR",
  "R",
  "N",
];

/**
 * El catálogo de sets cambia solo cuando se ejecutan los
 * scripts de datos. Se mantiene en memoria durante un
 * minuto para no repetir el escaneo JSONB en cada visita.
 */
const SETS_CACHE_TTL_MS = 60_000;

let setsCache: {
  data: CardSetSummary[];

  expiresAt: number;
} | null = null;

const setCardsSelect =
  Prisma.validator<Prisma.CardSelect>()({
    id: true,

    ygoproId: true,

    name: true,

    slug: true,

    format: true,

    image: true,

    type: true,

    attribute: true,

    race: true,

    rarity: true,

    archetype: true,

    level: true,

    linkRating: true,

    linkMarkers: true,

    scale: true,

    attack: true,

    defense: true,

    frameType: true,

    description: true,
  });

/**
 * Devuelve todas las cajas/sets presentes en el campo
 * JSON `obtain` de las cartas.
 *
 * Se calcula una sola vez por petición gracias a cache()
 * de React, de modo que generateMetadata y la página
 * comparten el mismo resultado.
 */
async function loadCardSets(): Promise<
  CardSetSummary[]
> {
  if (
    setsCache &&
    setsCache.expiresAt > Date.now()
  ) {
    return setsCache.data;
  }

  const rows = await prisma.$queryRaw<
    {
      name: string;

      type: string | null;

      count: number;
    }[]
  >`
    SELECT
      elem->>'name' AS name,
      MAX(elem->>'type') AS type,
      COUNT(*)::int AS count
    FROM "Card" AS c
    CROSS JOIN LATERAL jsonb_array_elements(c."obtain") AS elem
    WHERE c."obtain" IS NOT NULL
      AND jsonb_typeof(c."obtain") = 'array'
      AND NULLIF(elem->>'name', '') IS NOT NULL
    GROUP BY elem->>'name'
    ORDER BY elem->>'name' ASC
  `;

  const sets = rows.map((row) => ({
    name: row.name,

    slug: slugifySetName(row.name),

    type: row.type,

    cardCount: Number(row.count),
  }));

  setsCache = {
    data: sets,

    expiresAt:
      Date.now() + SETS_CACHE_TTL_MS,
  };

  return sets;
}

export const getCardSets = cache(
  loadCardSets
);

/**
 * Busca un set por su slug canónico. La comparación es
 * insensible a mayúsculas para tolerar enlaces externos.
 */
export const getCardSetBySlug = cache(
  async (
    slug: string
  ): Promise<CardSetSummary | null> => {
    const normalized = slug
      .trim()
      .toLowerCase();

    const sets = await getCardSets();

    return (
      sets.find(
        (set) => set.slug === normalized
      ) ?? null
    );
  }
);

export interface CardSetMeta {
  slug: string;

  name: string;

  bannerUrl: string | null;

  releasedAt: Date | null;
}

export interface LatestSet {
  slug: string;

  name: string;

  bannerUrl: string;

  releasedAt: Date | null;
}

/**
 * Metadatos editoriales del set (banner promocional,
 * nombre canónico, etc.). Se rellena desde Duel Links
 * Meta con scripts/syncSetMeta.ts.
 */
export const getSetMetaBySlug = cache(
  async (
    slug: string
  ): Promise<CardSetMeta | null> => {
    const normalized = slug
      .trim()
      .toLowerCase();

    return prisma.setMeta.findUnique({
      where: {
        slug: normalized,
      },

      select: {
        slug: true,

        name: true,

        bannerUrl: true,

        releasedAt: true,
      },
    });
  }
);

/**
 * Expansiones con banner ordenadas por fecha oficial de
 * lanzamiento. La más reciente aparece primero.
 */
export const getLatestSetsWithBanners = cache(
  async (limit = 6): Promise<LatestSet[]> => {
    const rows = await prisma.setMeta.findMany({
      where: {
        bannerUrl: {
          not: null,
        },

        releasedAt: {
          not: null,
        },
      },

      orderBy: [
        {
          releasedAt: "desc",
        },
        {
          name: "asc",
        },
      ],

      take: Math.max(limit, 1),

      select: {
        slug: true,

        name: true,

        bannerUrl: true,

        releasedAt: true,
      },
    });

    return rows.flatMap((row) =>
      row.bannerUrl
        ? [
            {
              slug: row.slug,

              name: row.name,

              bannerUrl: row.bannerUrl,

              releasedAt: row.releasedAt,
            },
          ]
        : []
    );
  }
);

/**
 * Todas las expansiones con banner. Las que no tienen
 * fecha se colocan al final para no romper el orden.
 */
export const getAllSetsWithBanners = cache(
  async (): Promise<LatestSet[]> => {
    const rows = await prisma.setMeta.findMany({
      where: {
        bannerUrl: {
          not: null,
        },
      },

      orderBy: [
        {
          releasedAt: {
            sort: "desc",
            nulls: "last",
          },
        },
        {
          name: "asc",
        },
      ],

      select: {
        slug: true,

        name: true,

        bannerUrl: true,

        releasedAt: true,
      },
    });

    return rows.flatMap((row) =>
      row.bannerUrl
        ? [
            {
              slug: row.slug,

              name: row.name,

              bannerUrl: row.bannerUrl,

              releasedAt: row.releasedAt,
            },
          ]
        : []
    );
  }
);

/**
 * Devuelve todas las cartas que contienen la caja
 * indicada dentro de su arreglo JSON `obtain`.
 */
export const getCardsForSet = cache(
  async (
    setName: string
  ): Promise<CardPreviewData[]> => {
    const cards = await prisma.card.findMany({
      where: {
        obtain: {
          array_contains: [
            {
              name: setName,
            },
          ],
        },
      },

      select: setCardsSelect,

      orderBy: {
        name: "asc",
      },
    });

    return cards.map(mapPrismaCardPreview);
  }
);

/**
 * Agrupa las cartas en el orden oficial de rarezas:
 * UR → SR → R → N.
 */
export function groupCardsByRarity(
  cards: CardPreviewData[]
): CardSetGroup[] {
  const groups = new Map<
    CardRarity,
    CardPreviewData[]
  >();

  for (const card of cards) {
    const rarity = normalizeRarity(
      card.rarity
    );

    const current = groups.get(rarity);

    if (current) {
      current.push(card);

      continue;
    }

    groups.set(rarity, [card]);
  }

  return RARITY_ORDER.filter((rarity) =>
    groups.has(rarity)
  ).map((rarity) => ({
    rarity,

    cards: groups.get(rarity) ?? [],
  }));
}
