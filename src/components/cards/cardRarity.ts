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
      "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(34,211,238,0.65)]",
  },

  SR: {
    strip:
      "bg-gradient-to-r from-slate-100 via-slate-300 to-slate-400",

    glow:
      "shadow-[0_0_12px_rgba(226,232,240,0.85)]",

    badge:
      "bg-gradient-to-r from-slate-100 via-slate-300 to-slate-500 text-slate-900 shadow-[0_0_12px_rgba(226,232,240,0.55)]",
  },

  R: {
    strip:
      "bg-gradient-to-r from-orange-400 via-amber-500 to-orange-700",

    glow:
      "shadow-[0_0_12px_rgba(249,115,22,0.75)]",

    badge:
      "bg-gradient-to-r from-amber-300 via-orange-500 to-orange-700 text-orange-950 shadow-[0_0_12px_rgba(249,115,22,0.6)]",
  },

  N: {
    strip:
      "bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700",

    glow:
      "shadow-[0_0_10px_rgba(100,116,139,0.55)]",

    badge:
      "bg-gradient-to-r from-slate-400 via-slate-600 to-slate-800 text-slate-100 shadow-[0_0_10px_rgba(100,116,139,0.5)]",
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
