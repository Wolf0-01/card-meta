/**
 * Reglas de mazo compartidas por servidor y cliente.
 * Este módulo no importa zod ni Prisma, por lo que
 * puede usarse también en componentes de cliente.
 */
export const DECK_RULES = {
  mainMin: 40,
  mainMax: 60,
  extraMax: 15,
  sideMax: 15,
  maxCopies: 3,
} as const;

export const DECK_ZONE_LIMITS = {
  main: DECK_RULES.mainMax,
  extra: DECK_RULES.extraMax,
  side: DECK_RULES.sideMax,
} as const;
