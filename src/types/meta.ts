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

export interface DeckAuthor {
  id: string;

  username: string;

  displayName: string | null;

  avatarUrl: string | null;
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

authorId?: string | null;

author?: DeckAuthor | null;

isPublic?: boolean;

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

cards: DeckCard[];

image?: string | null;

banner?: string | null;

description?: string | null;

skill?: string | null;

/** Logro competitivo declarado: NONE | KOG | KC_MAX | TOURNAMENT. */
achievement?: string;

/** Puesto del torneo: 1st | 2nd | Top 4 | Top 8. */
placement?: string | null;

/** Notas breves del jugador sobre el mazo. */
notes?: string | null;

/** Captura de pantalla que prueba el logro. */
proofUrl?: string | null;

/** Solo los resultados verificados muestran la insignia oficial. */
verified?: boolean;

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