import type { MetaDeck } from "@/types/meta";

/**
 * Coste aproximado, en gemas, de conseguir una copia de una carta
 * según su rareza. Es una estimación orientativa: Duel Links no
 * expone el coste real de cada carta en el catálogo.
 */
const RARITY_GEM_COST = {
  ultra: 3000,
  super: 1200,
  rare: 300,
  common: 100,
} as const;

export function estimateCardGemCost(
  rarity: string | null | undefined
): number {
  if (!rarity) {
    return RARITY_GEM_COST.common;
  }

  const normalized = rarity.trim().toLowerCase();

  if (
    normalized === "ur" ||
    normalized.includes("ultra")
  ) {
    return RARITY_GEM_COST.ultra;
  }

  if (
    normalized === "sr" ||
    normalized.includes("super")
  ) {
    return RARITY_GEM_COST.super;
  }

  if (
    normalized === "r" ||
    normalized.includes("rare")
  ) {
    return RARITY_GEM_COST.rare;
  }

  return RARITY_GEM_COST.common;
}

export function estimateDeckGemCost(
  deck: Pick<MetaDeck, "cards">
): number {
  return deck.cards.reduce(
    (total, deckCard) =>
      total +
      estimateCardGemCost(deckCard.card.rarity) *
        (deckCard.quantity ?? 1),
    0
  );
}

export function formatGemCost(cost: number): string {
  return new Intl.NumberFormat("es-ES").format(cost);
}
