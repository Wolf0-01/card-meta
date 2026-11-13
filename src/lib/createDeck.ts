import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { mapPrismaDeck } from "@/lib/mappers/deckMapper";

import type { DeckZone } from "@/types/deck";

import { DECK_RULES } from "./decks/rules";

interface CreateDeckData {
  name: string;
  archetypeId?: string;

  cards: {
    id: number;
    quantity?: number;
    zone?: DeckZone;
  }[];
}
function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}
function normalizeCards(
  cards: CreateDeckData["cards"]
) {
  const map = new Map<
    string,
    {
      id: number;
      quantity: number;
      zone: DeckZone;
    }
  >();

  for (const card of cards) {
    const zone = card.zone ?? "main";

    const key = `${card.id}-${zone}`;

    const current = map.get(key);

    if (current) {
      current.quantity += card.quantity ?? 1;
    } else {
      map.set(key, {
        id: card.id,
        quantity: card.quantity ?? 1,
        zone,
      });
    }
  }

  return [...map.values()];
}

function validateDeck(
  cards: ReturnType<typeof normalizeCards>
) {
  const limits = {
    main: DECK_RULES.mainMax,
    extra: DECK_RULES.extraMax,
  };

  const zones = {
    main: 0,
    extra: 0,
  };

  for (const card of cards) {
    if (card.quantity <= 0) {
      throw new Error(
        `Cantidad inválida para carta ${card.id}`
      );
    }

    zones[card.zone] += card.quantity;

    const maxCopies =
      card.zone === "main"
        ? 3
        : 1;

    if (card.quantity > maxCopies) {
      throw new Error(
        `Demasiadas copias de carta ${card.id}`
      );
    }
  }

  if (
    zones.main > limits.main ||
    zones.extra > limits.extra
  ) {
    throw new Error(
      "El deck supera los límites permitidos"
    );
  }
}

function generateDeckHash(
  cards: ReturnType<typeof normalizeCards>
) {
  const normalized = [...cards].sort((a, b) => {
    if (a.id !== b.id) {
      return a.id - b.id;
    }

    return a.zone.localeCompare(b.zone);
  });

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(normalized))
    .digest("hex");
}

// ======================================
// ARCHETYPE
// ======================================

async function detectArchetype(
  name: string
) {
  const clean = name.toLowerCase();

  if (
    clean.includes("blue eyes") ||
    clean.includes("blue-eyes")
  ) {
    return prisma.archetype.findUnique({
      where: {
        slug: "blue-eyes",
      },
    });
  }

  if (
    clean.includes("dark magician") ||
    clean.includes("dark-magician")
  ) {
    return prisma.archetype.findUnique({
      where: {
        slug: "dark-magician",
      },
    });
  }

  return null;
}

// ======================================
// CREATE DECK
// ======================================

export async function createDeck(
  data: CreateDeckData
) {
  if (!data.name.trim()) {
    throw new Error(
      "El deck necesita nombre"
    );
  }

  if (
    !data.cards ||
    data.cards.length === 0
  ) {
    throw new Error(
      "El deck necesita cartas"
    );
  }

  const cards = normalizeCards(
    data.cards
  );

  validateDeck(cards);

  const slug = generateSlug(
    data.name
  );

  const deckHash =
    generateDeckHash(cards);

  const archetype =
    data.archetypeId
      ? await prisma.archetype.findUnique({
          where: {
            id: data.archetypeId,
          },
        })
      : await detectArchetype(
          data.name
        );

  const isBlueEyes =
    archetype?.slug ===
    "blue-eyes";

  const prismaDeck =
    await prisma.deck.upsert({
      where: {
        deckHash,
      },

      update: {
        name: data.name,

        slug,

        archetypeId:
          archetype?.id ?? null,

        cards: {
          deleteMany: {},

          create: cards.map(
            (card) => ({
              cardId: card.id,

              quantity:
                card.quantity,

              zone: card.zone,
            })
          ),
        },
      },

      create: {
        name: data.name,

        slug,

        deckHash,

        archetypeId:
          archetype?.id ?? null,

        format:
          "speed",

        description: `Deck creado: ${data.name}`,

        tier: isBlueEyes
          ? "Tier 1"
          : null,

        tierOrder: isBlueEyes
          ? 1
          : 4,

        popularity: 0,

        tournamentResults: 0,

        wins: 0,

        losses: 0,

        cards: {
          create: cards.map(
            (card) => ({
              cardId: card.id,

              quantity:
                card.quantity,

              zone: card.zone,
            })
          ),
        },
      },

      include: {
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
        },
      },
    });

  const deck =
    mapPrismaDeck(prismaDeck);

  console.log(
    "DECK CREADO:",
    {
      id: deck.id,
      name: deck.name,
      slug: deck.slug,
      identifier:
        deck.identifier,
      deckHash:
        deck.deckHash,
      archetype:
        deck.archetypeName,
    }
  );

  return deck;
}