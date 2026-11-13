import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { getCardImageSrc } from "@/lib/cards/image";

import { getDeckArchetypeLabel } from "@/lib/decks/archetypeLabel";

import { pickDeckEmblem } from "@/lib/decks/emblem";

import {
  normalizeDuelFormat,
  type DuelFormat,
} from "@/lib/duelFormat";

import { mapPrismaDeck } from "@/lib/mappers/deckMapper";

import { getTierList } from "@/lib/tier-list";

import type { MetaDeck } from "@/types/meta";

const deckInclude = Prisma.validator<Prisma.DeckInclude>()({
  archetype: true,

  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
    },
  },

  cards: {
    include: {
      card: true,
    },

    orderBy: [
      {
        zone: "asc",
      },
      {
        card: {
          type: "asc",
        },
      },
      {
        card: {
          name: "asc",
        },
      },
    ],
  },
});

type DeckWithRelations =
  Prisma.DeckGetPayload<{
    include: typeof deckInclude;
  }>;

interface GetDecksOptions {
  page?: number;
  pageSize?: number;
}

async function findDeck(
  args: Prisma.DeckFindUniqueArgs
) {
  return prisma.deck.findUnique({
    ...args,
    include: deckInclude,
  });
}

async function findDecks(
  args: Prisma.DeckFindManyArgs
) {
  return prisma.deck.findMany({
    ...args,
    include: deckInclude,
  });
}

// =================================
// TODOS LOS DECKS
// =================================

export async function getAllDecks() {
  const decks = await findDecks({
    where: {
      isPublic: true,
    },

    orderBy: [
      {
        tierOrder: "asc",
      },
      {
        popularity: "desc",
      },
      {
        tournamentResults: "desc",
      },
    ],
  });

  return decks.map(mapPrismaDeck);
}

// =================================
// TIER LIST
// =================================

export async function getTierDecks() {
  const decks = await findDecks({
    where: {
      isPublic: true,

      tier: {
        not: null,
      },
    },

    orderBy: [
      {
        tierOrder: "asc",
      },
      {
        popularity: "desc",
      },
    ],
  });

  return decks.map(mapPrismaDeck);
}

// =================================
// FEATURED
// =================================

export async function getFeaturedDecks() {
  const decks = await findDecks({
    where: {
      isPublic: true,
    },

    take: 6,

    orderBy: [
      {
        popularity: "desc",
      },
      {
        tournamentResults: "desc",
      },
      {
        wins: "desc",
      },
    ],
  });

  return decks.map(mapPrismaDeck);
}

// =================================
// TOP DECKS
// =================================

export async function getTopDecks() {
  const decks = await findDecks({
    where: {
      isPublic: true,
    },

    take: 10,

    orderBy: [
      {
        tournamentResults: "desc",
      },
      {
        popularity: "desc",
      },
      {
        wins: "desc",
      },
    ],
  });

  return decks.map(mapPrismaDeck);
}

// =================================
// POR IDENTIFIER
// =================================

export async function getDeckByIdentifier(
  identifier: string,
  viewerId: string | null = null
) {
  if (!identifier) {
    return null;
  }

  const deck = await findDeck({
    where: {
      identifier,
    },
  });

  if (!deck) {
    return null;
  }

  const isOwner =
    viewerId !== null &&
    deck.authorId === viewerId;

  if (!deck.isPublic && !isOwner) {
    return null;
  }

  return mapPrismaDeck(deck);
}

// =================================
// POR SLUG
// =================================

export async function getDecksBySlug(
  slug: string
) {
  if (!slug) {
    return [];
  }

  const decks = await findDecks({
    where: {
      slug,
      isPublic: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return decks.map(mapPrismaDeck);
}

// =================================
// RELATED
// =================================

export async function getRelatedDecks(
archetypeId: string,
excludeIdentifier: string,
limit = 6
) {
const decks = await findDecks({
where: {
archetypeId,

  isPublic: true,

  NOT: {
    identifier: excludeIdentifier,
  },
},

take: limit,

orderBy: [
  {
    tierOrder: "asc",
  },
  {
    popularity: "desc",
  },
  {
    tournamentResults: "desc",
  },
],

});

return decks.map(mapPrismaDeck);
}


// =================================
// PAGINACIÓN
// =================================

export async function getDecks({
  page = 1,
  pageSize = 20,
}: GetDecksOptions = {}) {
  const skip = (page - 1) * pageSize;

  const [decks, total] = await Promise.all([
    findDecks({
      where: {
        isPublic: true,
      },

      skip,

      take: pageSize,

      orderBy: [
        {
          tierOrder: "asc",
        },
        {
          popularity: "desc",
        },
      ],
    }),

    prisma.deck.count({
      where: {
        isPublic: true,
      },
    }),
  ]);

  return {
    items: decks.map(mapPrismaDeck),

    total,

    page,

    pageSize,

    totalPages: Math.ceil(
      total / pageSize
    ),
  };
}

// =================================
// EXPLORADOR PÚBLICO
// =================================

export interface PublicDeckExplorerOptions {
  search?: string;

  skill?: string;

  format?: DuelFormat;

  /** Nombre del arquetipo seleccionado en la cuadrícula. */
  archetype?: string;

  page?: number;

  pageSize?: number;
}

export interface PublicDeckExplorerResult {
  items: MetaDeck[];

  total: number;

  page: number;

  pageSize: number;

  totalPages: number;

  skills: string[];
}

export async function getPublicDeckExplorer({
  search,
  skill,
  format = "speed",
  archetype,
  page = 1,
  pageSize = 24,
}: PublicDeckExplorerOptions = {}): Promise<PublicDeckExplorerResult> {
  const normalizedFormat =
    normalizeDuelFormat(format);

  const safePage = Math.max(
    Math.floor(page),
    1
  );

  const safePageSize = Math.min(
    Math.max(Math.floor(pageSize), 1),
    60
  );

  const where: Prisma.DeckWhereInput = {
    isPublic: true,

    format: normalizedFormat,
  };

  const term = search?.trim();

  const archetypeTerm = archetype?.trim();

  const conditions: Prisma.DeckWhereInput[] = [];

  if (term) {
    conditions.push({
      OR: [
        {
          name: {
            contains: term,
            mode: "insensitive",
          },
        },
        {
          archetype: {
            name: {
              contains: term,
              mode: "insensitive",
            },
          },
        },
        {
          cards: {
            some: {
              zone: "main",
              card: {
                archetype: {
                  contains: term,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ],
    });
  }

  if (archetypeTerm) {
    conditions.push({
      OR: [
        {
          name: {
            contains: archetypeTerm,
            mode: "insensitive",
          },
        },
        {
          archetype: {
            name: {
              contains: archetypeTerm,
              mode: "insensitive",
            },
          },
        },
        {
          cards: {
            some: {
              zone: "main",
              card: {
                archetype: {
                  contains: archetypeTerm,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      ],
    });
  }

  if (conditions.length > 0) {
    where.AND = conditions;
  }

  const selectedSkill = skill?.trim();

  if (selectedSkill) {
    where.skill = selectedSkill;
  }

  const [decks, total, skillRows] =
    await Promise.all([
      findDecks({
        where,

        skip:
          (safePage - 1) * safePageSize,

        take: safePageSize,

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.deck.count({
        where,
      }),

      prisma.deck.findMany({
        where: {
          isPublic: true,

          format: normalizedFormat,

          skill: {
            not: null,
          },
        },

        select: {
          skill: true,
        },

        distinct: ["skill"],

        orderBy: {
          skill: "asc",
        },
      }),
    ]);

  return {
    items: decks.map(mapPrismaDeck),

    total,

    page: safePage,

    pageSize: safePageSize,

    totalPages: Math.max(
      1,
      Math.ceil(total / safePageSize)
    ),

    skills: skillRows
      .map((row) => row.skill)
      .filter(
        (value): value is string =>
          Boolean(value)
      ),
  };
}

export interface PublicDeckArchetypeGroup {
  name: string;

  count: number;

  image: string | null;

  /** Etiqueta de Tier List cuando el arquetipo está rankeado. */
  tier: string | null;
}

const TIER_BAND_LABELS: Record<string, string> = {
  "tier-1": "Tier 1",
  "tier-2": "Tier 2",
  "tier-3": "Tier 3",
  "high-potential": "High Potential",
};

/**
 * Agrupa los mazos públicos de un formato por arquetipo.
 *
 * El nombre se deduce del arquetipo de las cartas cuando el
 * mazo no tiene una relación explícita, de modo que la
 * cuadrícula siempre refleja mazos reales y no etiquetas
 * "Unknown".
 */
export async function getPublicDeckArchetypeGroups(
  format: DuelFormat = "speed"
): Promise<PublicDeckArchetypeGroup[]> {
  const normalizedFormat =
    normalizeDuelFormat(format);

  const [deckRows, tierList] =
    await Promise.all([
      findDecks({
        where: {
          isPublic: true,

          format: normalizedFormat,
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      getTierList(normalizedFormat),
    ]);

  const decks = deckRows.map(mapPrismaDeck);

  const tierByArchetype =
    new Map<string, string>();

  for (const band of tierList.bands) {
    const label =
      TIER_BAND_LABELS[band.key] ?? band.key;

    for (const archetype of band.archetypes) {
      tierByArchetype.set(
        archetype.name.trim().toLowerCase(),
        label
      );
    }
  }

  const groups = new Map<
    string,
    {
      name: string;

      decks: MetaDeck[];
    }
  >();

  for (const deck of decks) {
    const name = getDeckArchetypeLabel(deck);

    const key = name.toLowerCase();

    const group = groups.get(key) ?? {
      name,

      decks: [],
    };

    group.decks.push(deck);

    groups.set(key, group);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const representative = group.decks[0];

      return {
        name: group.name,

        count: group.decks.length,

        image: getCardImageSrc(
          pickDeckEmblem(representative)?.card
        ),

        tier: tierByArchetype.get(key) ?? null,
      };
    })
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.name.localeCompare(b.name)
    );
}

export async function getRecentPublicDecks(
  limit = 6
) {
  const decks = await findDecks({
    where: {
      isPublic: true,
    },

    take: Math.max(Math.floor(limit), 1),

    orderBy: {
      createdAt: "desc",
    },
  });

  return decks.map(mapPrismaDeck);
}

// =================================
// META SUMMARY
// =================================

export async function getMetaSummary() {
  const decks = await getTierDecks();

  const totalDecks = decks.length;

  const averageWinRate =
    totalDecks > 0
      ? Math.round(
          decks.reduce(
            (sum, deck) => sum + deck.winRate,
            0
          ) / totalDecks
        )
      : 0;

  const tournaments = decks.reduce(
    (sum, deck) =>
      sum + (deck.tournamentResults ?? 0),
    0
  );

  const totalPlayers = decks.reduce(
    (sum, deck) =>
      sum + (deck.popularity ?? 0),
    0
  );

  return {
    totalDecks,

    averageWinRate,

    tournaments,

    totalPlayers,

    format: "Speed Duel",

    lastUpdate: new Date()
      .toISOString()
      .split("T")[0],
  };
}

export type {
  DeckWithRelations,
};