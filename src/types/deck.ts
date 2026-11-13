import type { Card } from "./card";

export type DeckZone =
| "main"
| "extra";

// =================================
// CARD
// =================================

export type DeckCardInfo = Pick<
Card,
| "id"
| "ygoproId"
| "name"
| "slug"
| "format"
| "image"
| "description"
| "type"
| "attribute"
| "race"
| "archetype"
| "level"
| "attack"
| "defense"
| "rarity"
| "frameType"
| "scale"
| "linkRating"
| "linkMarkers"

> ;

// =================================
// DECK CARD
// =================================

export interface DeckCard {
id: string;

deckId?: string;

cardId?: number;

quantity: number;

zone: DeckZone;

/**

* Información resumida de la carta.
* Siempre viene incluida desde Prisma mediante:
* include: { card: true }
  */
  card: DeckCardInfo;
  }
