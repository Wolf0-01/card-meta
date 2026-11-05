import type {
DeckCard,
DeckZone,
} from "./deck";

export type {
DeckZone,
};

// =================================
// BUILDER CARD
// =================================

export type BuilderCard = DeckCard;

// =================================
// BUILDER DECK
// =================================

export interface BuilderDeck {
id?: string;

name: string;

description?: string;

skill?: string;

archetype?: string;

format?: string;

cards: BuilderCard[];
}

// =================================
// BUILDER STATS
// =================================

export interface BuilderDeckStats {
main: number;

extra: number;

side: number;

total: number;
}
