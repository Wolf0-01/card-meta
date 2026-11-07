export type CardRarity = "UR" | "SR" | "R" | "N";

interface RarityStyle {
  strip: string;

  glow: string;

  badge: string;
}

export const RARITY_STYLES: Record<
  CardRarity,
  RarityStyle
> = {
  UR: {
    strip:
      "bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-500",

    glow:
      "shadow-[0_0_12px_rgba(251,191,36,0.9)]",

    badge:
      "bg-amber-400 text-amber-950",
  },

  SR: {
    strip:
      "bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400",

    glow:
      "shadow-[0_0_12px_rgba(226,232,240,0.85)]",

    badge:
      "bg-slate-300 text-slate-900",
  },

  R: {
    strip:
      "bg-gradient-to-r from-orange-400 via-amber-500 to-orange-700",

    glow:
      "shadow-[0_0_12px_rgba(249,115,22,0.75)]",

    badge:
      "bg-orange-500 text-orange-950",
  },

  N: {
    strip:
      "bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700",

    glow:
      "shadow-[0_0_10px_rgba(100,116,139,0.55)]",

    badge:
      "bg-slate-600 text-slate-100",
  },
};

/**
 * Normaliza los nombres de rareza que puede devolver
 * Prisma ("Ultra Rare", "UR", etc.).
 *
 * Si la carta no tiene rareza se usa "N" como fallback
 * visual para que el borde superior siempre exista.
 */
export function normalizeRarity(
  value: string | null | undefined
): CardRarity {
  if (!value) {
    return "N";
  }

  const normalized = value
    .trim()
    .toUpperCase();

  if (
    normalized === "UR" ||
    normalized.includes("ULTRA")
  ) {
    return "UR";
  }

  if (
    normalized === "SR" ||
    normalized.includes("SUPER")
  ) {
    return "SR";
  }

  if (
    normalized === "R" ||
    normalized.includes("RARE")
  ) {
    return "R";
  }

  return "N";
}
