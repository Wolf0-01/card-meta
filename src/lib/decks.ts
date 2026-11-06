import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { mapPrismaDeck } from "@/lib/mappers/deckMapper";

const deckInclude = Prisma.validator<Prisma.DeckInclude>()({
  archetype: true,

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

    format: "Advanced",

    lastUpdate: new Date()
      .toISOString()
      .split("T")[0],
  };
}

export type {
  DeckWithRelations,
};