import { prisma } from "@/lib/prisma";

import { mapPrismaCard } from "@/lib/mappers/cardMapper";

import type { Card } from "@/types/card";

// =================================
// GET ALL
// =================================

export async function getAllCards(): Promise<Card[]> {
  const cards = await prisma.card.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return cards.map(mapPrismaCard);
}

// =================================
// GET ONE
// =================================

export async function getCardById(
  id: number
): Promise<Card | null> {
  const card = await prisma.card.findUnique({
    where: {
      id,
    },
  });

  return card ? mapPrismaCard(card) : null;
}

// =================================
// SEARCH
// =================================

export async function searchCards(
  query: string
): Promise<Card[]> {
  const cards = await prisma.card.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive",
      },
    },

    orderBy: {
      name: "asc",
    },
  });

  return cards.map(mapPrismaCard);
}

// =================================
// FILTERS
// =================================

export async function getCardsByArchetype(
  archetype: string
): Promise<Card[]> {
  const cards = await prisma.card.findMany({
    where: {
      archetype,
    },

    orderBy: {
      name: "asc",
    },
  });

  return cards.map(mapPrismaCard);
}

// =================================
// RELATED
// =================================

export async function getRelatedCards(
  card: {
    id: number;
    archetype?: string | null;
  }
): Promise<Card[]> {
  if (!card.archetype) {
    return [];
  }

  const cards = await prisma.card.findMany({
    where: {
      archetype: card.archetype,

      NOT: {
        id: card.id,
      },
    },

    take: 8,

    orderBy: {
      name: "asc",
    },
  });

  return cards.map(mapPrismaCard);
}