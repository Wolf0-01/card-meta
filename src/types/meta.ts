import type {
  DeckCard,
} from "./deck";

export type Trend =
  | "up"
  | "down"
  | "stable";

export type Tier =
  | "Tier 1"
  | "Tier 2"
  | "Tier 3"
  | "Rogue"
  | string;

// =================================
// ARCHETYPE
// =================================

export interface ArchetypeData {
  id?: string;

  name: string;

  slug: string;

  image?: string | null;

  description?: string | null;
}

// =================================
// META DECK
// =================================

export interface MetaDeck {
id: string;

name: string;

slug: string;

identifier: string;

deckHash?: string;

archetype:
| ArchetypeData
| null;

archetypeName?: string;

archetypeSlug?: string | null;

tier:
| Tier
| null;

tierOrder?: number | null;

trend?: Trend;

format?: string;

popularity: number;

tournamentResults?: number;

wins?: number;

losses?: number;

winRate: number;

totalCards: number;

mainCards?: number;

extraCards?: number;

sideCards?: number;

cards: DeckCard[];

image?: string | null;

banner?: string | null;

description?: string | null;

guide?: string | null;

combos?: string | null;

matchups?: string | null;

usagePercent?: number;

createdAt: string;

updatedAt: string;

}


// =================================
// META SUMMARY
// =================================

export interface MetaStatsData {
  totalDecks: number;

  averageWinRate: number;

  format: string;

  lastUpdate: string;

  tournaments: number;

totalPlayers: number;
}