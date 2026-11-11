/**
 * Reglas de mazo compartidas por servidor y cliente.
 * Este módulo no importa zod ni Prisma, por lo que
 * puede usarse también en componentes de cliente.
 */
export const DECK_RULES = {
  /*
   * Reglas de Yu-Gi-Oh! Duel Links:
   * Main Deck 20–30 y Extra Deck hasta 9.
   * El Side Deck no existe en Duel Links.
   */
  mainMin: 20,
  mainMax: 30,
  extraMax: 9,
  maxCopies: 3,
} as const;

export const DECK_ZONE_LIMITS = {
  main: DECK_RULES.mainMax,
  extra: DECK_RULES.extraMax,
} as const;
