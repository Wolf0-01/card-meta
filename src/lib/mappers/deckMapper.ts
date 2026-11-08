import type {
  Card as PrismaCard,
  DeckCard as PrismaDeckCard,
  Prisma,
} from "@prisma/client";

import type { LinkMarker } from "@/types/card";
import type {
  DeckCard,
  DeckCardInfo,
} from "@/types/deck";
import type { MetaDeck } from "@/types/meta";

import {
  countCardsByZone,
  countTotalCards,
  getWinRate,
} from "@/utils/deck";

import { mapPrismaArchetype } from "./archetypeMapper";

// ======================================
// TYPES
// ======================================

export type PrismaDeckWithRelations =
  Prisma.DeckGetPayload<{
    include: {
      archetype: true;
      cards: {
        include: {
          card: true;
        };
      };
    };
  }>;

// ======================================
// CARD
// ======================================

export function mapPrismaCardToDeckCardInfo(
card: PrismaCard
): DeckCardInfo {
return {
id: card.id,


ygoproId: card.ygoproId,

name: card.name,

description: card.description,

image: card.image,

type: card.type ?? "",

attribute: card.attribute,

race: card.race,

archetype: card.archetype,

level: card.level,

attack: card.attack,

defense: card.defense,

rarity: card.rarity,

frameType: card.frameType,

scale: card.scale,

linkRating: card.linkRating,

linkMarkers: Array.isArray(
  card.linkMarkers
)
  ? (card.linkMarkers as LinkMarker[])
  : null,


};
}


// ======================================
// DECK CARD
// ======================================

export function mapPrismaDeckCard(
deckCard: PrismaDeckCard & {
card: PrismaCard;
}
): DeckCard {
return {
id: deckCard.id,


quantity: deckCard.quantity,

zone: deckCard.zone as DeckCard["zone"],

card: {
  id: deckCard.card.id,

  ygoproId: deckCard.card.ygoproId,

  name: deckCard.card.name,

  description:
    deckCard.card.description,

  image: deckCard.card.image,

  type:
    deckCard.card.type ?? "",

  attribute:
    deckCard.card.attribute,

  race:
    deckCard.card.race,

  archetype:
    deckCard.card.archetype,

  level:
    deckCard.card.level,

  attack:
    deckCard.card.attack,

  defense:
    deckCard.card.defense,

  rarity:
    deckCard.card.rarity,

  frameType:
    deckCard.card.frameType,

  scale:
    deckCard.card.scale,

  linkRating:
    deckCard.card.linkRating,

  linkMarkers:
    Array.isArray(
      deckCard.card.linkMarkers
    )
      ? (
          deckCard.card
            .linkMarkers as LinkMarker[]
        )
      : null,
},


};
}


// ======================================
// DECK
// ======================================

export function mapPrismaDeck(
  deck: PrismaDeckWithRelations
): MetaDeck {
  const cards =
    deck.cards.map(mapPrismaDeckCard);

  const wins = deck.wins ?? 0;

  const losses = deck.losses ?? 0;

  const archetype =
    mapPrismaArchetype(deck.archetype);

  return {
    id: deck.id,

    name: deck.name,

    slug: deck.slug,

    identifier: deck.identifier,

    deckHash: deck.deckHash,

    authorId: deck.authorId,

    isPublic: deck.isPublic,

    archetype,

    archetypeName:
      archetype?.name ?? "Unknown",

    archetypeSlug:
      archetype?.slug ?? null,

    tier:
      deck.tier as MetaDeck["tier"],

    tierOrder: deck.tierOrder,

    trend:
      (deck.trend as MetaDeck["trend"]) ??
      "stable",

    format:
      deck.format ?? "Advanced",

    popularity:
      deck.popularity ?? 0,

    tournamentResults:
      deck.tournamentResults ?? 0,

    wins,

    losses,

    winRate: getWinRate(
      wins,
      losses
    ),

    totalCards:
      countTotalCards(cards),

    mainCards:
      countCardsByZone(
        cards,
        "main"
      ),

    extraCards:
      countCardsByZone(
        cards,
        "extra"
      ),

    sideCards:
      countCardsByZone(
        cards,
        "side"
      ),

    cards,

image: deck.image,

skill: deck.skill,

description:
deck.description,

createdAt:
deck.createdAt.toISOString(),

updatedAt:
deck.updatedAt.toISOString(),
};
}
