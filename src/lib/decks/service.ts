import { Prisma } from "@prisma/client";

import {
  normalizeDuelFormat,
  type DuelFormat,
} from "@/lib/duelFormat";

import { prisma } from "@/lib/prisma";

import {
  mapPrismaCardToDeckCardInfo,
} from "@/lib/mappers/deckMapper";

import type {
  DeckCardInfo,
  DeckZone,
} from "@/types/deck";

import { DeckError } from "./errors";

import {
  countDeckCards,
  normalizeDeckCards,
  parseDeckCreate,
  parseDeckUpdate,
  validateDeckCards,
  type DeckCounts,
  type NormalizedDeckCard,
} from "./validation";

import {
  generateUserDeckHash,
  slugifyDeckName,
} from "./slug";

const userDeckInclude = {
  archetype: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },

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

    orderBy: {
      cardId: "asc",
    },
  },
} satisfies Prisma.DeckInclude;

type PrismaUserDeck =
  Prisma.DeckGetPayload<{
    include: typeof userDeckInclude;
  }>;

export interface UserDeckCardDTO {
  id: string;

  cardId: number;

  quantity: number;

  zone: DeckZone;

  card: DeckCardInfo;
}

export interface UserDeckAuthorDTO {
  id: string;

  username: string;

  displayName: string | null;

  avatar: string | null;
}

export interface UserDeckDTO {
  id: string;

  name: string;

  slug: string;

  identifier: string;

  description: string | null;

  skill: string | null;

  format: string;

  isPublic: boolean;

  authorId: string | null;

  archetype: {
    id: string;
    name: string;
    slug: string;
  } | null;

  author: UserDeckAuthorDTO | null;

  cards: UserDeckCardDTO[];

  counts: DeckCounts;

  createdAt: string;

  updatedAt: string;
}

export interface UserDeckSummary {
  id: string;

  name: string;

  slug: string;

  identifier: string;

  description: string | null;

  skill: string | null;

  format: string;

  isPublic: boolean;

  archetype: {
    id: string;
    name: string;
    slug: string;
  } | null;

  counts: DeckCounts;

  createdAt: string;

  updatedAt: string;
}

function mapUserDeck(
  deck: PrismaUserDeck
): UserDeckDTO {
  const cards: UserDeckCardDTO[] =
    deck.cards.map((deckCard) => ({
      id: deckCard.id,

      cardId: deckCard.cardId,

      quantity: deckCard.quantity,

      zone: deckCard.zone as DeckZone,

      card: mapPrismaCardToDeckCardInfo(
        deckCard.card
      ),
    }));

  return {
    id: deck.id,

    name: deck.name,

    slug: deck.slug,

    identifier: deck.identifier,

    description: deck.description,

    skill: deck.skill,

    format: normalizeDuelFormat(deck.format),

    isPublic: deck.isPublic,

    authorId: deck.authorId,

    archetype: deck.archetype,

    author: deck.author,

    cards,

    counts: countDeckCards(cards),

    createdAt: deck.createdAt.toISOString(),

    updatedAt: deck.updatedAt.toISOString(),
  };
}

async function ensureCardsExist(
  cards: NormalizedDeckCard[],
  format: DuelFormat
) {
  const uniqueIds = [
    ...new Set(cards.map((card) => card.cardId)),
  ];

  if (uniqueIds.length === 0) {
    return;
  }

  const found = await prisma.card.findMany({
    where: {
      id: {
        in: uniqueIds,
      },
    },

    select: {
      id: true,
      name: true,
      format: true,
    },
  });

  const foundById = new Map(
    found.map((card) => [card.id, card])
  );

  const missing = uniqueIds.filter(
    (id) => !foundById.has(id)
  );

  if (missing.length > 0) {
    throw new DeckError(
      "VALIDATION",
      "Una o más cartas no existen",
      missing.slice(0, 10).map((id) => ({
        path: "cards",

        message: `La carta #${id} no existe`,
      }))
    );
  }

  const wrongFormat = found.filter(
    (card) => card.format !== format
  );

  if (wrongFormat.length > 0) {
    throw new DeckError(
      "VALIDATION",
      `El mazo contiene cartas que no pertenecen a ${
        format === "rush"
          ? "Rush Duel"
          : "Speed Duel"
      }`,
      wrongFormat.slice(0, 10).map((card) => ({
        path: "cards",

        message: `La carta "${card.name}" no está disponible en ${
          format === "rush"
            ? "Rush Duel"
            : "Speed Duel"
        }`,
      }))
    );
  }
}

async function resolveArchetypeId(
  archetypeId: string | null | undefined
) {
  if (!archetypeId) {
    return null;
  }

  const archetype =
    await prisma.archetype.findUnique({
      where: {
        id: archetypeId,
      },

      select: {
        id: true,
      },
    });

  if (!archetype) {
    throw new DeckError(
      "VALIDATION",
      "El arquetipo indicado no existe",
      [
        {
          path: "archetypeId",

          message:
            "El arquetipo indicado no existe",
        },
      ]
    );
  }

  return archetype.id;
}

function deckCardCreateData(
  cards: NormalizedDeckCard[]
) {
  return cards.map((card) => ({
    cardId: card.cardId,

    quantity: card.quantity,

    zone: card.zone,
  }));
}

function notFound() {
  return new DeckError(
    "NOT_FOUND",
    "El mazo no existe"
  );
}

function forbidden() {
  return new DeckError(
    "FORBIDDEN",
    "No tienes permiso para modificar este mazo"
  );
}

// ======================================
// CREATE
// ======================================

export async function createUserDeck(
  userId: string,
  body: unknown
): Promise<UserDeckDTO> {
  const input = parseDeckCreate(body);

  const cards = normalizeDeckCards(
    input.cards ?? []
  );

  const isPublic = input.isPublic ?? false;

  const format = normalizeDuelFormat(
    input.format
  );

  validateDeckCards(
    cards,
    isPublic,
    format
  );

  await ensureCardsExist(cards, format);

  const archetypeId = await resolveArchetypeId(
    input.archetypeId
  );

  const deck = await prisma.deck.create({
    data: {
      name: input.name,

      slug: slugifyDeckName(input.name),

      deckHash: generateUserDeckHash(
        userId,
        cards
      ),

      authorId: userId,

      isPublic,

      format,

      description: input.description ?? null,

      skill:
        format === "rush"
          ? null
          : input.skill?.trim() || null,

      archetypeId,

      cards: {
        create: deckCardCreateData(cards),
      },
    },

    include: userDeckInclude,
  });

  return mapUserDeck(deck);
}

// ======================================
// UPDATE
// ======================================

export async function updateUserDeck(
  userId: string,
  deckId: string,
  body: unknown
): Promise<UserDeckDTO> {
  const patch = parseDeckUpdate(body);

  const existing =
    await prisma.deck.findUnique({
      where: {
        id: deckId,
      },

      select: {
        id: true,

        authorId: true,

        name: true,

        description: true,

        skill: true,

        format: true,

        archetypeId: true,

        isPublic: true,

        cards: {
          select: {
            cardId: true,
            quantity: true,
            zone: true,
          },
        },
      },
    });

  if (!existing) {
    throw notFound();
  }

  if (existing.authorId !== userId) {
    throw forbidden();
  }

  const cards = patch.cards
    ? normalizeDeckCards(patch.cards)
    : existing.cards.map((card) => ({
        cardId: card.cardId,

        quantity: card.quantity,

        zone: card.zone as DeckZone,
      }));

  const isPublic =
    patch.isPublic ?? existing.isPublic;

  const format = normalizeDuelFormat(
    patch.format ?? existing.format
  );

  validateDeckCards(
    cards,
    isPublic,
    format
  );

  await ensureCardsExist(cards, format);

  const archetypeId =
    patch.archetypeId !== undefined
      ? await resolveArchetypeId(
          patch.archetypeId
        )
      : existing.archetypeId;

  const name = patch.name ?? existing.name;

  const description =
    patch.description !== undefined
      ? patch.description
      : existing.description;

  const skill =
    format === "rush"
      ? null
      : patch.skill !== undefined
        ? patch.skill?.trim() || null
        : existing.skill;

  const deck = await prisma.$transaction(
    async (tx) => {
      await tx.deckCard.deleteMany({
        where: {
          deckId,
        },
      });

      return tx.deck.update({
        where: {
          id: deckId,
        },

        data: {
          name,

          slug: slugifyDeckName(name),

          deckHash: generateUserDeckHash(
            userId,
            cards
          ),

          description,

          skill,

          format,

          isPublic,

          archetypeId,

          cards: {
            create: deckCardCreateData(cards),
          },
        },

        include: userDeckInclude,
      });
    }
  );

  return mapUserDeck(deck);
}

// ======================================
// DELETE
// ======================================

export async function deleteUserDeck(
  userId: string,
  deckId: string
) {
  const deck = await prisma.deck.findUnique({
    where: {
      id: deckId,
    },

    select: {
      authorId: true,
    },
  });

  if (!deck) {
    throw notFound();
  }

  if (deck.authorId !== userId) {
    throw forbidden();
  }

  await prisma.deck.delete({
    where: {
      id: deckId,
    },
  });
}

// ======================================
// READ
// ======================================

export async function getDeckForViewer(
  deckId: string,
  viewerId: string | null
): Promise<UserDeckDTO> {
  const deck = await prisma.deck.findUnique({
    where: {
      id: deckId,
    },

    include: userDeckInclude,
  });

  if (!deck) {
    throw notFound();
  }

  const isOwner =
    viewerId !== null &&
    deck.authorId === viewerId;

  if (!deck.isPublic && !isOwner) {
    throw new DeckError(
      "FORBIDDEN",
      "Este mazo es privado"
    );
  }

  return mapUserDeck(deck);
}

export async function listUserDecks(
  userId: string
): Promise<UserDeckSummary[]> {
  const decks = await prisma.deck.findMany({
    where: {
      authorId: userId,
    },

    orderBy: {
      updatedAt: "desc",
    },

    include: {
      archetype: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      cards: {
        select: {
          quantity: true,
          zone: true,
        },
      },
    },
  });

  return decks.map((deck) => ({
    id: deck.id,

    name: deck.name,

    slug: deck.slug,

    identifier: deck.identifier,

    description: deck.description,

    skill: deck.skill,

    format: normalizeDuelFormat(deck.format),

    isPublic: deck.isPublic,

    archetype: deck.archetype,

    counts: countDeckCards(
      deck.cards.map((card) => ({
        quantity: card.quantity,

        zone: card.zone as DeckZone,
      }))
    ),

    createdAt: deck.createdAt.toISOString(),

    updatedAt: deck.updatedAt.toISOString(),
  }));
}
