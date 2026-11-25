import { cache } from "react";

import { Prisma } from "@prisma/client";

import { mapPrismaCardPreview } from "@/lib/mappers/cardMapper";

import { prisma } from "@/lib/prisma";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import { extractQuotedCardNames } from "./quotedCardNames";

const MENTIONED_CARD_SELECT =
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

    banlistStatus: true,

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

function cardNameKey(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Busca en `prisma.card` las cartas cuyo nombre coincida
 * exactamente (sin distinguir mayúsculas) con alguno de
 * los nombres entre comillas de la descripción.
 */
export const getMentionedCards = cache(
  async (
    description: string
  ): Promise<CardPreviewData[]> => {
    const names =
      extractQuotedCardNames(description);

    if (names.length === 0) {
      return [];
    }

    const cards = await prisma.card.findMany({
      where: {
        name: {
          in: names,
          mode: "insensitive",
        },
      },

      select: MENTIONED_CARD_SELECT,
    });

    const cardsByName = new Map(
      cards.map((card) => [
        cardNameKey(card.name),
        card,
      ])
    );

    return names
      .map((name) =>
        cardsByName.get(cardNameKey(name))
      )
      .filter(
        (
          card
        ): card is (typeof cards)[number] =>
          card !== undefined
      )
      .map(mapPrismaCardPreview);
  }
);
