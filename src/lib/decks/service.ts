import { Prisma } from "@prisma/client";

import {
  normalizeDuelFormat,
  type DuelFormat,
} from "@/lib/duelFormat";

import {
  normalizeBanlistStatus,
  type BanlistStatus,
} from "@/lib/banlist";

import { prisma } from "@/lib/prisma";

import {
  detectArchetype,
  type DeckCardInput,
} from "@/lib/archetypeEngine";

import {
  mapPrismaCardToDeckCardInfo,
} from "@/lib/mappers/deckMapper";

import type {
  DeckCardInfo,
  DeckZone,
} from "@/types/deck";

import { DeckError } from "./errors";

import {
  isCompetitiveAchievement,
  normalizeAchievement,
  resolveResultVerification,
  sanitizeResultFields,
  type DeckResultFields,
} from "./achievements";

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
      avatarUrl: true,
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

  avatarUrl: string | null;
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

  achievement: string;

  placement: string | null;

  notes: string | null;

  proofUrl: string | null;

  verified: boolean;

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

  achievement: string;

  placement: string | null;

  notes: string | null;

  proofUrl: string | null;

  verified: boolean;

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

    achievement: normalizeAchievement(
      deck.achievement
    ),

    placement: deck.placement,

    notes: deck.notes,

    proofUrl: deck.proofUrl,

    verified: deck.verified,

    authorId: deck.authorId,

    archetype: deck.archetype,

    author: deck.author,

    cards,

    counts: countDeckCards(cards),

    createdAt: deck.createdAt.toISOString(),

    updatedAt: deck.updatedAt.toISOString(),
  };
}

interface ResolvedCardInfo {
  banlistStatus: BanlistStatus | null;
  name: string;
}

async function ensureCardsExist(
  cards: NormalizedDeckCard[],
  format: DuelFormat
): Promise<Map<number, ResolvedCardInfo>> {
  const uniqueIds = [
    ...new Set(cards.map((card) => card.cardId)),
  ];

  if (uniqueIds.length === 0) {
    return new Map();
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
      banlistStatus: true,
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
      "One or more cards do not exist",
      missing.slice(0, 10).map((id) => ({
        path: "cards",

        message: `Card #${id} does not exist`,
      }))
    );
  }

  const wrongFormat = found.filter(
    (card) => card.format !== format
  );

  if (wrongFormat.length > 0) {
    throw new DeckError(
      "VALIDATION",
      `The deck contains cards that do not belong to ${
        format === "rush"
          ? "Rush Duel"
          : "Speed Duel"
      }`,
      wrongFormat.slice(0, 10).map((card) => ({
        path: "cards",

        message: `The card "${card.name}" is not available in ${
          format === "rush"
            ? "Rush Duel"
            : "Speed Duel"
        }`,
      }))
    );
  }

  return new Map(
    found.map((card) => [
      card.id,
      {
        banlistStatus: normalizeBanlistStatus(
          card.banlistStatus
        ),
        name: card.name,
      },
    ])
  );
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
      "The specified archetype does not exist",
      [
        {
          path: "archetypeId",

          message:
            "The specified archetype does not exist",
        },
      ]
    );
  }

  return archetype.id;
}

function slugifyArchetypeName(name: string) {
  return (
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "archetype"
  );
}

/*
 * Resuelve un arquetipo por su nombre visible. Si todavía
 * no existe, lo crea para que el creador pueda confirmar o
 * corregir el nombre exacto desde el Deck Builder.
 */
async function resolveArchetypeName(
  name: string | null | undefined
) {
  const trimmed = name?.trim();

  if (!trimmed) {
    return null;
  }

  const slug = slugifyArchetypeName(trimmed);

  const existing =
    await prisma.archetype.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: trimmed,
              mode: "insensitive",
            },
          },
          {
            slug: {
              equals: slug,
              mode: "insensitive",
            },
          },
        ],
      },

      select: {
        id: true,
      },
    });

  if (existing) {
    return existing.id;
  }

  let candidate = slug;

  let suffix = 2;

  while (
    await prisma.archetype.findUnique({
      where: {
        slug: candidate,
      },

      select: {
        id: true,
      },
    })
  ) {
    candidate = `${slug}-${suffix}`;

    suffix += 1;
  }

  const created =
    await prisma.archetype.create({
      data: {
        name: trimmed,

        slug: candidate,
      },

      select: {
        id: true,
      },
    });

  return created.id;
}

interface ResolveDeckArchetypeInput {
  archetypeId?: string | null;

  archetypeName?: string | null;

  name?: string | null;

  skill?: string | null;

  cards: DeckCardInput[];
}

async function resolveDeckArchetype(
  input: ResolveDeckArchetypeInput
) {
  if (input.archetypeName !== undefined) {
    const manual = input.archetypeName?.trim();

    if (manual) {
      return resolveArchetypeName(manual);
    }
  } else if (input.archetypeId !== undefined) {
    return resolveArchetypeId(input.archetypeId);
  }

  const detected = await detectArchetype({
    name: input.name,

    skill: input.skill,

    cards: input.cards,
  });

  if (!detected) {
    return null;
  }

  return resolveArchetypeName(detected);
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
    "The deck does not exist"
  );
}

function forbidden() {
  return new DeckError(
    "FORBIDDEN",
    "You do not have permission to modify this deck"
  );
}

function withBanlistStatus(
  cards: NormalizedDeckCard[],
  banlistByCard: Map<number, ResolvedCardInfo>
): NormalizedDeckCard[] {
  return cards.map((card) => {
    const info = banlistByCard.get(
      card.cardId
    );

    return {
      ...card,

      banlistStatus:
        info?.banlistStatus ?? null,

      name: info?.name ?? null,
    };
  });
}

function assertResultPlacement(
  result: DeckResultFields
) {
  if (
    result.achievement === "TOURNAMENT" &&
    !result.placement
  ) {
    throw new DeckError(
      "VALIDATION",
      "Select the tournament placement",
      [
        {
          path: "placement",

          message:
            "Select the tournament placement",
        },
      ]
    );
  }
}

interface DeckResultOptions {
  isStaff?: boolean;
}

interface PrismaDeckSummary {
  id: string;

  name: string;

  slug: string;

  identifier: string;

  description: string | null;

  skill: string | null;

  format: string;

  isPublic: boolean;

  achievement: string;

  placement: string | null;

  notes: string | null;

  proofUrl: string | null;

  verified: boolean;

  archetype: {
    id: string;
    name: string;
    slug: string;
  } | null;

  cards: Array<{
    quantity: number;
    zone: string;
  }>;

  createdAt: Date;

  updatedAt: Date;
}

function mapUserDeckSummary(
  deck: PrismaDeckSummary
): UserDeckSummary {
  return {
    id: deck.id,

    name: deck.name,

    slug: deck.slug,

    identifier: deck.identifier,

    description: deck.description,

    skill: deck.skill,

    format: normalizeDuelFormat(deck.format),

    isPublic: deck.isPublic,

    achievement: normalizeAchievement(
      deck.achievement
    ),

    placement: deck.placement,

    notes: deck.notes,

    proofUrl: deck.proofUrl,

    verified: deck.verified,

    archetype: deck.archetype,

    counts: countDeckCards(
      deck.cards.map((card) => ({
        quantity: card.quantity,

        zone: card.zone as DeckZone,
      }))
    ),

    createdAt: deck.createdAt.toISOString(),

    updatedAt: deck.updatedAt.toISOString(),
  };
}

// ======================================
// CREATE
// ======================================

export async function createUserDeck(
  userId: string,
  body: unknown,
  options: DeckResultOptions = {}
): Promise<UserDeckDTO> {
  const input = parseDeckCreate(body);

  const cards = normalizeDeckCards(
    input.cards ?? []
  );

  const isPublic = input.isPublic ?? false;

  const result = sanitizeResultFields({
    achievement: normalizeAchievement(
      input.achievement
    ),

    placement: input.placement ?? null,

    notes: input.notes ?? null,

    proofUrl: input.proofUrl ?? null,
  });

  assertResultPlacement(result);

  const verified = resolveResultVerification(
    result,
    null,
    Boolean(options.isStaff)
  );

  const format = normalizeDuelFormat(
    input.format
  );

  const banlistByCard = await ensureCardsExist(
    cards,
    format
  );

  validateDeckCards(
    withBanlistStatus(cards, banlistByCard),
    isPublic,
    format
  );

  const skill =
    format === "rush"
      ? null
      : input.skill?.trim() || null;

  const archetypeId =
    await resolveDeckArchetype({
      archetypeId: input.archetypeId,

      archetypeName: input.archetypeName,

      name: input.name,

      skill,

      cards: cards.map((card) => ({
        id: card.cardId,

        quantity: card.quantity,

        zone: card.zone,
      })),
    });

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

      skill,

      achievement: result.achievement,

      placement: result.placement,

      notes: result.notes,

      proofUrl: result.proofUrl,

      verified,

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
  body: unknown,
  options: DeckResultOptions = {}
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

        achievement: true,

        placement: true,

        notes: true,

        proofUrl: true,

        verified: true,

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

  const banlistByCard = await ensureCardsExist(
    cards,
    format
  );

  validateDeckCards(
    withBanlistStatus(cards, banlistByCard),
    isPublic,
    format
  );

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

  const archetypeCards = cards.map((card) => ({
    id: card.cardId,

    quantity: card.quantity,

    zone: card.zone,
  }));

  let archetypeId = existing.archetypeId;

  if (patch.archetypeName !== undefined) {
    /*
     * El formulario siempre envía el campo. Si viene vacío
     * se vuelve a detectar automáticamente con el título,
     * la Skill y las copias del Main Deck.
     */
    archetypeId = await resolveDeckArchetype({
      archetypeName: patch.archetypeName,

      name,

      skill,

      cards: archetypeCards,
    });
  } else if (patch.archetypeId !== undefined) {
    archetypeId = await resolveArchetypeId(
      patch.archetypeId
    );
  } else if (!archetypeId) {
    const detected = await detectArchetype({
      name,

      skill,

      cards: archetypeCards,
    });

    if (detected) {
      archetypeId =
        await resolveArchetypeName(detected);
    }
  }

  const currentResult = sanitizeResultFields({
    achievement: normalizeAchievement(
      existing.achievement
    ),

    placement: existing.placement,

    notes: existing.notes,

    proofUrl: existing.proofUrl,
  });

  const nextResult = sanitizeResultFields({
    achievement:
      patch.achievement !== undefined
        ? patch.achievement
        : currentResult.achievement,

    placement:
      patch.placement !== undefined
        ? patch.placement
        : currentResult.placement,

    notes:
      patch.notes !== undefined
        ? patch.notes
        : currentResult.notes,

    proofUrl:
      patch.proofUrl !== undefined
        ? patch.proofUrl
        : currentResult.proofUrl,
  });

  assertResultPlacement(nextResult);

  const verified = resolveResultVerification(
    nextResult,
    {
      ...currentResult,

      verified: existing.verified,
    },
    Boolean(options.isStaff)
  );

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

          achievement: nextResult.achievement,

          placement: nextResult.placement,

          notes: nextResult.notes,

          proofUrl: nextResult.proofUrl,

          verified,

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
      "This deck is private"
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

  return decks.map(mapUserDeckSummary);
}

export interface PendingCompetitiveResult
  extends UserDeckSummary {
  author: UserDeckAuthorDTO | null;
}

/**
 * Cola de revisión para ADMIN/EDITOR: resultados
 * competitivos enviados que todavía no están verificados.
 */
export async function listPendingCompetitiveResults(): Promise<
  PendingCompetitiveResult[]
> {
  const decks = await prisma.deck.findMany({
    where: {
      achievement: {
        not: "NONE",
      },

      verified: false,
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

      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
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
    ...mapUserDeckSummary(deck),

    author: deck.author,
  }));
}

/**
 * Aprueba (o retira) la insignia oficial de un resultado.
 * Solo debe invocarse desde una ruta protegida para staff.
 */
export async function setDeckResultVerification(
  deckId: string,
  verified: boolean
): Promise<UserDeckDTO> {
  const deck = await prisma.deck.findUnique({
    where: {
      id: deckId,
    },

    select: {
      id: true,

      achievement: true,
    },
  });

  if (!deck) {
    throw notFound();
  }

  if (
    !isCompetitiveAchievement(
      normalizeAchievement(deck.achievement)
    )
  ) {
    throw new DeckError(
      "VALIDATION",
      "This deck has no competitive result to approve",
      [
        {
          path: "achievement",

          message:
            "This deck has no competitive result to approve",
        },
      ]
    );
  }

  const updated = await prisma.deck.update({
    where: {
      id: deckId,
    },

    data: {
      verified,
    },

    include: userDeckInclude,
  });

  return mapUserDeck(updated);
}
