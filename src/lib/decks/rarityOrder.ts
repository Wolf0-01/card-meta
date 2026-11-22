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
  quantity?: number;

  zone?: string | null;

  card: {
    name: string;

    rarity: string | null;

    type: string | null;

    race?: string | null;

    frameType?: string | null;

    level?: number | null;

    linkRating?: number | null;
  };
}

/** Devuelve la posición de una rareza dentro del orden UR → N. */
export function getRarityRank(
  rarity: string | null | undefined
): number {
  return RARITY_RANK[normalizeRarity(rarity)];
}

/**
 * Bloques del Extra Deck en el orden oficial:
 * Fusion → Synchro → Xyz → Link.
 */
const EXTRA_DECK_BLOCK_ORDER = [
  "fusion",
  "synchro",
  "xyz",
  "link",
] as const;

/**
 * Devuelve el bloque del Extra Deck. Los monstruos se
 * separan por su marco: Fusion → Synchro → Xyz → Link.
 */
function getExtraDeckBlockRank(
  card: DeckSortableCard
): number {
  const frame = (
    card.card.frameType ?? ""
  ).toLowerCase();

  const type = (card.card.type ?? "").toLowerCase();

  const frameAndType = `${frame} ${type}`;

  return EXTRA_DECK_BLOCK_ORDER.findIndex((block) =>
    frameAndType.includes(block)
  );
}

/**
 * Bloque principal del mazo:
 *
 * - Main Deck: Monsters → Spells → Traps.
 * - Extra Deck: Fusion → Synchro → Xyz → Link.
 */
function getDeckBlockRank(
  card: DeckSortableCard
): number {
  if ((card.zone ?? "main") === "extra") {
    const extraIndex = getExtraDeckBlockRank(card);

    return extraIndex === -1 ? 4 : extraIndex;
  }

  switch (getDeckCardTypeGroup(card.card.type)) {
    case "monsters":
      return 0;

    case "spells":
      return 10;

    case "traps":
      return 20;

    default:
      return 30;
  }
}

/**
 * Nivel, Rango o Link Rating de mayor a menor. Se niega
 * para que el comparador ascendente coloque primero los
 * valores más altos.
 */
function getLevelRank(card: DeckSortableCard): number {
  const rating =
    card.card.linkRating ?? card.card.level ?? 0;

  return -rating;
}

/** 0 para el Main Deck y 1 para el Extra Deck. */
function getZoneRank(card: DeckSortableCard): number {
  return (card.zone ?? "main") === "extra" ? 1 : 0;
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
 * Ordena las cartas de un mazo replicando estrictamente el
 * orden de Duel Links Meta:
 *
 * Main Deck:
 * 1. Monsters → Spells → Traps.
 * 2. Monsters: Level descendente → Rareza → Nombre.
 * 3. Spells y Traps: Rareza → Nombre.
 *
 * Extra Deck:
 * 1. Fusion → Synchro → Xyz → Link.
 * 2. Level / Rank / Link Rating descendente → Rareza →
 *    Nombre.
 *
 * Las copias de una misma carta ya viven en una sola fila
 * con su `quantity`, por lo que el nombre las mantiene
 * juntas. No muta la colección original.
 */
export function sortDeckCards<
  T extends DeckSortableCard,
>(cards: readonly T[]): T[] {
  return [...cards].sort((a, b) => {
    const zoneDiff = getZoneRank(a) - getZoneRank(b);

    if (zoneDiff !== 0) {
      return zoneDiff;
    }

    const blockDiff =
      getDeckBlockRank(a) - getDeckBlockRank(b);

    if (blockDiff !== 0) {
      return blockDiff;
    }

    const isExtra =
      (a.zone ?? "main") === "extra";

    const groupA = getDeckCardTypeGroup(
      a.card.type
    );

    if (isExtra || groupA === "monsters") {
      const levelDiff =
        getLevelRank(a) - getLevelRank(b);

      if (levelDiff !== 0) {
        return levelDiff;
      }
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
