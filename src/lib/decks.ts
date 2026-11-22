import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { getCardImageSrc } from "@/lib/cards/image";

import { normalizeAchievement } from "@/lib/decks/achievements";

import {
  getDeckArchetypeLabel,
  slugifyArchetypeLabel,
} from "@/lib/decks/archetypeLabel";

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
      avatarUrl: true,
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

function decodeArchetypeTerm(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Condiciones compartidas para localizar los mazos de un
 * arquetipo: nombre del mazo, relación de arquetipo o
 * arquetipo de las cartas del Main Deck.
 *
 * El término puede llegar como nombre visible
 * ("Dark Magician") o como slug ("dark-magician"); ambos
 * se normalizan para que el Breakdown nunca devuelva 404.
 */
function buildArchetypeMatch(
  term: string
): Prisma.DeckWhereInput {
  const normalized = term
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const slug = slugifyArchetypeLabel(term);

  const conditions: Prisma.DeckWhereInput[] = [
    {
      name: {
        contains: normalized,
        mode: "insensitive",
      },
    },
    {
      archetype: {
        name: {
          contains: normalized,
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
              contains: normalized,
              mode: "insensitive",
            },
          },
        },
      },
    },
  ];

  if (slug) {
    conditions.push({
      archetype: {
        slug: {
          equals: slug,
          mode: "insensitive",
        },
      },
    });
  }

  return {
    OR: conditions,
  };
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
    conditions.push(
      buildArchetypeMatch(archetypeTerm)
    );
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

export interface ArchetypeBreakdownSkill {
  name: string;

  deckCount: number;

  percentage: number;
}

export interface ArchetypeBreakdownCard {
  /** Información completa para la miniatura y el tooltip. */
  card: MetaDeck["cards"][number]["card"];

  /** Número de mazos que incluyen al menos una copia. */
  deckCount: number;

  /** Porcentaje real de inclusión entre los mazos públicos. */
  percentage: number;

  /** Cantidad modal: 1x, 2x o 3x. */
  copies: number;
}

export interface ArchetypeBreakdown {
  archetype: string;

  deckCount: number;

  /** Media de cartas del Main Deck entre los mazos públicos. */
  averageSize: number;

  mainDeck: ArchetypeBreakdownCard[];

  extraDeck: ArchetypeBreakdownCard[];

  /** Ranking completo de Skills por uso. */
  skills: ArchetypeBreakdownSkill[];

  /** Mazo destacado para el bloque Sample Deck. */
  sampleDeck: MetaDeck | null;
}

const MAIN_DECK_BREAKDOWN_LIMIT = 18;

const EXTRA_DECK_BREAKDOWN_LIMIT = 8;

/**
 * Agrupa las cartas de una zona y calcula su cantidad modal
 * y su porcentaje real de inclusión.
 */
function buildCardBreakdown(
  decks: MetaDeck[],
  zone: "main" | "extra",
  limit: number
): ArchetypeBreakdownCard[] {
  const usage = new Map<
    number,
    {
      card: MetaDeck["cards"][number]["card"];

      deckCount: number;

      quantityCounts: Map<number, number>;
    }
  >();

  for (const deck of decks) {
    const quantities = new Map<
      number,
      {
        card: MetaDeck["cards"][number]["card"];

        quantity: number;
      }
    >();

    for (const deckCard of deck.cards) {
      if (deckCard.zone !== zone) {
        continue;
      }

      const current = quantities.get(
        deckCard.card.id
      );

      if (current) {
        current.quantity += deckCard.quantity;
      } else {
        quantities.set(deckCard.card.id, {
          card: deckCard.card,

          quantity: deckCard.quantity,
        });
      }
    }

    for (const [cardId, { card, quantity }] of quantities) {
      const current = usage.get(cardId);

      if (current) {
        current.deckCount += 1;

        current.quantityCounts.set(
          quantity,
          (current.quantityCounts.get(quantity) ??
            0) + 1
        );

        continue;
      }

      usage.set(cardId, {
        card,

        deckCount: 1,

        quantityCounts: new Map([[quantity, 1]]),
      });
    }
  }

  return [...usage.values()]
    .sort(
      (a, b) =>
        b.deckCount - a.deckCount ||
        a.card.name.localeCompare(b.card.name)
    )
    .slice(0, limit)
    .map(({ card, deckCount, quantityCounts }) => {
      /*
       * Cantidad modal. En caso de empate se prefiere la
       * cantidad mayor para reflejar la lista más completa.
       */
      const copies =
        [...quantityCounts.entries()].sort(
          (a, b) =>
            b[1] - a[1] ||
            b[0] - a[0]
        )[0]?.[0] ?? 1;

      return {
        card,

        deckCount,

        percentage: Math.round(
          (deckCount / decks.length) * 100
        ),

        copies,
      };
    });
}

/**
 * Elige el mazo del bloque Sample Deck: primero los
 * verificados de Torneo, después KoG y KC Cup, y como
 * último recurso el mazo público más reciente.
 */
function pickSampleDeck(
  decks: MetaDeck[]
): MetaDeck | null {
  if (decks.length === 0) {
    return null;
  }

  function score(deck: MetaDeck): number {
    if (!deck.verified) {
      return 0;
    }

    switch (normalizeAchievement(deck.achievement)) {
      case "TOURNAMENT":
        return 4;

      case "KOG":
        return 3;

      case "KC_MAX":
        return 2;

      default:
        return 1;
    }
  }

  let best = decks[0];

  let bestScore = score(best);

  for (const deck of decks.slice(1)) {
    const nextScore = score(deck);

    if (nextScore > bestScore) {
      best = deck;

      bestScore = nextScore;
    }
  }

  return best;
}

/**
 * Desglose estadístico de un arquetipo calculado con los
 * mazos públicos reales de PostgreSQL.
 *
 * Separa Main Deck y Extra Deck, calcula la cantidad modal
 * de cada carta, su porcentaje real de inclusión, la media
 * de tamaño del Main Deck y el ranking completo de Skills.
 * Los porcentajes se recalculan en cada petición.
 */
export async function getArchetypeBreakdown(
  format: DuelFormat = "speed",
  archetype = ""
): Promise<ArchetypeBreakdown | null> {
  const term = decodeArchetypeTerm(archetype)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!term) {
    return null;
  }

  const normalizedFormat =
    normalizeDuelFormat(format);

  const baseWhere: Prisma.DeckWhereInput = {
    isPublic: true,

    format: normalizedFormat,

    AND: [buildArchetypeMatch(term)],
  };

  /*
   * El Breakdown prioriza las listas recientes para reflejar
   * el meta actual. Si el arquetipo no tiene mazos en los
   * últimos 30 días, se usa su historial completo.
   */
  const recentSince = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );

  let rows = await findDecks({
    where: {
      ...baseWhere,

      createdAt: {
        gte: recentSince,
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  if (rows.length === 0) {
    rows = await findDecks({
      where: baseWhere,

      orderBy: {
        createdAt: "desc",
      },
    });
  }

  const decks = rows.map(mapPrismaDeck);

  const deckCount = decks.length;

  if (deckCount === 0) {
    return null;
  }

  const skillCounts = new Map<string, number>();

  let mainDeckTotal = 0;

  for (const deck of decks) {
    const skill = deck.skill?.trim();

    if (skill) {
      skillCounts.set(
        skill,
        (skillCounts.get(skill) ?? 0) + 1
      );
    }

    mainDeckTotal += deck.cards
      .filter(
        (deckCard) => deckCard.zone === "main"
      )
      .reduce(
        (total, deckCard) =>
          total + deckCard.quantity,
        0
      );
  }

  const skills: ArchetypeBreakdownSkill[] = [
    ...skillCounts.entries(),
  ]
    .map(([name, count]) => ({
      name,

      deckCount: count,

      percentage: Math.round(
        (count / deckCount) * 100
      ),
    }))
    .sort(
      (a, b) =>
        b.deckCount - a.deckCount ||
        a.name.localeCompare(b.name)
    );

  return {
    archetype: getDeckArchetypeLabel(decks[0]),

    deckCount,

    averageSize: Math.round(
      mainDeckTotal / deckCount
    ),

    mainDeck: buildCardBreakdown(
      decks,
      "main",
      MAIN_DECK_BREAKDOWN_LIMIT
    ),

    extraDeck: buildCardBreakdown(
      decks,
      "extra",
      EXTRA_DECK_BREAKDOWN_LIMIT
    ),

    skills,

    sampleDeck: pickSampleDeck(decks),
  };
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

/**
 * Mazos públicos creados por un jugador concreto, usados en
 * su perfil público (/user/[username]).
 */
export async function getPublicDecksByAuthor(
  authorId: string
) {
  const decks = await findDecks({
    where: {
      isPublic: true,

      authorId,
    },

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