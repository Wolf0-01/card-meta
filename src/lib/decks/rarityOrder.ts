import {
  normalizeRarity,
  type CardRarity,
} from "@/components/cards/cardRarity";

/**
 * Orden oficial de rarezas en Duel Links:
 * UR → SR → R → N.
 */
const RARITY_RANK: Record<CardRarity, number> = {
  UR: 0,
  SR: 1,
  R: 2,
  N: 3,
};

interface RaritySortableCard {
  card: {
    name: string;

    rarity: string | null;
  };
}

export type DeckCardTypeGroup =
  | "monsters"
  | "spells"
  | "traps"
  | "other";

/**
 * Orden de los tipos dentro de la cuadrícula continua:
 * primero Monsters, luego Spells, luego Traps y al final
 * cualquier otra carta.
 */
const TYPE_GROUP_ORDER: DeckCardTypeGroup[] = [
  "monsters",
  "spells",
  "traps",
  "other",
];

/** Clasifica una carta por su tipo para ordenar la grilla. */
export function getDeckCardTypeGroup(
  type: string | null | undefined
): DeckCardTypeGroup {
  const normalized = (type ?? "").toLowerCase();

  if (normalized.includes("monster")) {
    return "monsters";
  }

  if (normalized.includes("spell")) {
    return "spells";
  }

  if (normalized.includes("trap")) {
    return "traps";
  }

  return "other";
}

interface DeckSortableCard {
  card: {
    name: string;

    rarity: string | null;

    type: string | null;
  };
}

/** Devuelve la posición de una rareza dentro del orden UR → N. */
export function getRarityRank(
  rarity: string | null | undefined
): number {
  return RARITY_RANK[normalizeRarity(rarity)];
}

/**
 * Compara dos cartas de mazo por rareza y, como desempate
 * estable, por nombre. No muta la colección original.
 */
export function sortCardsByRarity<
  T extends RaritySortableCard,
>(cards: readonly T[]): T[] {
  return [...cards].sort((a, b) => {
    const rarityDiff =
      getRarityRank(a.card.rarity) -
      getRarityRank(b.card.rarity);

    if (rarityDiff !== 0) {
      return rarityDiff;
    }

    return a.card.name.localeCompare(b.card.name);
  });
}

/**
 * Ordena la cuadrícula continua de un mazo: primero por
 * tipo (Monsters → Spells → Traps → Other) y dentro de
 * cada tipo por rareza (UR → SR → R → N), con desempate
 * alfabético. No muta la colección original.
 */
export function sortDeckCards<
  T extends DeckSortableCard,
>(cards: readonly T[]): T[] {
  return [...cards].sort((a, b) => {
    const typeDiff =
      TYPE_GROUP_ORDER.indexOf(
        getDeckCardTypeGroup(a.card.type)
      ) -
      TYPE_GROUP_ORDER.indexOf(
        getDeckCardTypeGroup(b.card.type)
      );

    if (typeDiff !== 0) {
      return typeDiff;
    }

    const rarityDiff =
      getRarityRank(a.card.rarity) -
      getRarityRank(b.card.rarity);

    if (rarityDiff !== 0) {
      return rarityDiff;
    }

    return a.card.name.localeCompare(b.card.name);
  });
}
