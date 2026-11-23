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
 * Subtipos oficiales dentro de cada bloque del Main Deck.
 * El índice define el orden; los subtipos desconocidos
 * quedan al final del bloque.
 */
const SPELL_SUBTYPE_ORDER = [
  "normal",
  "ritual",
  "quick-play",
  "continuous",
  "equip",
  "field",
] as const;

const TRAP_SUBTYPE_ORDER = [
  "normal",
  "continuous",
  "counter",
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
 * Normaliza el texto de subtipo para compararlo sin
 * depender de guiones, espacios o mayúsculas.
 */
function normalizeSubtype(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z]+/g, " ")
    .trim();
}

function getSubtypeIndex(
  card: DeckSortableCard,
  order: readonly string[]
): number {
  const haystack = normalizeSubtype(
    `${card.card.race ?? ""} ${card.card.type ?? ""}`
  );

  const index = order.findIndex((subtype) =>
    haystack.includes(
      normalizeSubtype(subtype)
    )
  );

  return index === -1 ? order.length : index;
}

/**
 * Subtipo oficial del Main Deck:
 *
 * - Monsters: Ritual → Effect → Normal.
 * - Spells: Normal → Ritual → Quick-Play → Continuous →
 *   Equip → Field.
 * - Traps: Normal → Continuous → Counter.
 *
 * El Extra Deck ya queda separado por bloque, así que sus
 * cartas comparten el mismo subtipo y pasan directo a la
 * rareza.
 */
function getDeckSubtypeRank(
  card: DeckSortableCard
): number {
  if ((card.zone ?? "main") === "extra") {
    return 0;
  }

  switch (getDeckCardTypeGroup(card.card.type)) {
    case "monsters": {
      const type = (
        card.card.type ?? ""
      ).toLowerCase();

      if (type.includes("ritual")) {
        return 0;
      }

      if (type.includes("effect")) {
        return 1;
      }

      if (type.includes("normal")) {
        return 2;
      }

      return 3;
    }

    case "spells":
      return getSubtypeIndex(
        card,
        SPELL_SUBTYPE_ORDER
      );

    case "traps":
      return getSubtypeIndex(
        card,
        TRAP_SUBTYPE_ORDER
      );

    default:
      return 0;
  }
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
 * 1. Main Deck: Monsters → Spells → Traps.
 *    Extra Deck: Fusion → Synchro → Xyz → Link.
 * 2. Subtipo oficial dentro de cada bloque.
 * 3. Rareza UR → SR → R → N.
 * 4. Copias 3x → 2x → 1x.
 * 5. Nombre A → Z.
 *
 * Se aplica sobre las cartas agrupadas (con su `quantity`)
 * antes de expandir las copias individuales. No muta la
 * colección original.
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

    const subtypeDiff =
      getDeckSubtypeRank(a) -
      getDeckSubtypeRank(b);

    if (subtypeDiff !== 0) {
      return subtypeDiff;
    }

    const rarityDiff =
      getRarityRank(a.card.rarity) -
      getRarityRank(b.card.rarity);

    if (rarityDiff !== 0) {
      return rarityDiff;
    }

    const copiesDiff =
      (b.quantity ?? 1) - (a.quantity ?? 1);

    if (copiesDiff !== 0) {
      return copiesDiff;
    }

    return a.card.name.localeCompare(b.card.name);
  });
}
