import type { DuelFormat } from "@/lib/duelFormat";

/**
 * Posiciones posibles de las flechas de un Link Monster.
 */
export type LinkMarker =
  | "Top"
  | "Bottom"
  | "Left"
  | "Right"
  | "Top-Left"
  | "Top-Right"
  | "Bottom-Left"
  | "Bottom-Right";

/**
 * Fuente de obtención de una carta en Duel Links.
 *
 * Se almacena como JSON en Prisma y proviene del arreglo
 * `obtain` del catálogo de Duel Links Meta.
 */
export interface CardObtainEntry {
  name: string;

  type: string | null;

  amount: number | null;
}

/**
 * Modelo principal de una carta.
 *
 * Este tipo representa una carta proveniente de Prisma y
 * será reutilizado por toda la aplicación:
 *
 * - Card Browser
 * - Card Viewer
 * - Deck Builder
 * - Deck Viewer
 * - Search
 * - Related Cards
 */
export interface Card {
  id: number;

  ygoproId: number | null;

  name: string;

  slug: string;

  /** Formato del catálogo: Speed o Rush Duel. */
  format: DuelFormat;

  obtain: CardObtainEntry[] | null;

  type: string;

  attribute: string | null;

  level: number | null;

  attack: number | null;

  defense: number | null;

  rarity: string | null;

  image: string | null;

  description: string | null;

  archetype: string | null;

  race: string | null;

  frameType: string | null;

  scale: number | null;

  linkRating: number | null;

  /**
   * Flechas Link.
   *
   * Se almacenan como JSON en Prisma,
   * pero en la aplicación siempre se utilizarán
   * como un arreglo tipado.
   */
  linkMarkers: LinkMarker[] | null;

  createdAt: Date;

  updatedAt: Date;
}