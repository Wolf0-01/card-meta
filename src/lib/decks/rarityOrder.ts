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
 * Devuelve el bloque de una carta. En el Extra Deck los
 * monstruos se separan por su marco (Fusion → Synchro → Xyz
 * → Link); en el Main Deck se mantiene el orden clásico
 * Monsters → Spells → Traps.
 */
function getDeckBlockRank(
  card: DeckSortableCard
): number {
  const frame = (
    card.card.frameType ?? ""
  ).toLowerCase();

  const type = (card.card.type ?? "").toLowerCase();

  const frameAndType = `${frame} ${type}`;

  const extraIndex =
    EXTRA_DECK_BLOCK_ORDER.findIndex((block) =>
      frameAndType.includes(block)
    );

  if (extraIndex !== -1) {
    return extraIndex;
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
 * Subtipos oficiales de monstruo: Ritual → Effect → Normal.
 * Los monstruos del Extra Deck no se reordenan aquí porque
 * su bloque ya los separa por Fusion/Synchro/Xyz/Link.
 */
const MONSTER_SUBTYPE_ORDER = [
  "ritual",
  "effect",
  "normal",
] as const;

/** Subtipos oficiales de mágica: Normal → Ritual → Quick-Play → Continuous → Equip → Field. */
const SPELL_SUBTYPE_ORDER = [
  "normal",
  "ritual",
  "quick-play",
  "continuous",
  "equip",
  "field",
] as const;

/** Subtipos oficiales de trampa: Normal → Continuous → Counter. */
const TRAP_SUBTYPE_ORDER = [
  "normal",
  "continuous",
  "counter",
] as const;

function rankByKeyword(
  value: string | null | undefined,
  order: readonly string[]
): number {
  const normalized = (value ?? "").toLowerCase();

  const index = order.findIndex((keyword) =>
    normalized.includes(keyword)
  );

  return index === -1 ? order.length : index;
}

/** Devuelve la posición del subtipo dentro de su bloque. */
function getSubtypeRank(
  card: DeckSortableCard
): number {
  const group = getDeckCardTypeGroup(card.card.type);

  if (group === "monsters") {
    return rankByKeyword(
      card.card.type,
      MONSTER_SUBTYPE_ORDER
    );
  }

  if (group === "spells") {
    return rankByKeyword(
      card.card.race,
      SPELL_SUBTYPE_ORDER
    );
  }

  if (group === "traps") {
    return rankByKeyword(
      card.card.race,
      TRAP_SUBTYPE_ORDER
    );
  }

  return 0;
}

/**
 * Cantidad de copias de mayor a menor: 3x → 2x → 1x.
 * Se niega para que el comparador ascendente coloque primero
 * las cantidades más altas.
 */
function getQuantityRank(
  card: DeckSortableCard
): number {
  return -Math.max(card.quantity ?? 1, 1);
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
 * Ordena la cuadrícula continua de un mazo replicando el
 * orden jerárquico de Duel Links Meta:
 *
 * 1. Bloque: Monsters → Spells → Traps y, en el Extra Deck,
 *    Fusion → Synchro → Xyz → Link.
 * 2. Subtipo: Ritual → Effect → Normal; Normal → Ritual →
 *    Quick-Play → Continuous → Equip → Field; Normal →
 *    Continuous → Counter.
 * 3. Rareza: UR → SR → R → N.
 * 4. Cantidad de copias: 3x → 2x → 1x.
 * 5. Nombre: A → Z.
 *
 * No muta la colección original.
 */
export function sortDeckCards<
  T extends DeckSortableCard,
>(cards: readonly T[]): T[] {
  return [...cards].sort((a, b) => {
    const blockDiff =
      getDeckBlockRank(a) - getDeckBlockRank(b);

    if (blockDiff !== 0) {
      return blockDiff;
    }

    const subtypeDiff =
      getSubtypeRank(a) - getSubtypeRank(b);

    if (subtypeDiff !== 0) {
      return subtypeDiff;
    }

    const rarityDiff =
      getRarityRank(a.card.rarity) -
      getRarityRank(b.card.rarity);

    if (rarityDiff !== 0) {
      return rarityDiff;
    }

    const quantityDiff =
      getQuantityRank(a) - getQuantityRank(b);

    if (quantityDiff !== 0) {
      return quantityDiff;
    }

    return a.card.name.localeCompare(b.card.name);
  });
}
