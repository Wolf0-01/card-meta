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
