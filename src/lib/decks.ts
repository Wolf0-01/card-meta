import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import {
  normalizeDuelFormat,
  type DuelFormat,
} from "@/lib/duelFormat";

import { mapPrismaDeck } from "@/lib/mappers/deckMapper";

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

  if (term) {
    where.OR = [
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
    ];
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