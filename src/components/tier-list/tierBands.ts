import type { TierBandKey } from "@/lib/tier-list";

export interface TierBandMeta {
  label: string;

  description: string;

  /** Color del texto principal de la franja. */
  accent: string;

  /** Borde de la franja. */
  border: string;

  /** Franja vertical de color. */
  strip: string;

  /** Fondo degradado suave de la franja. */
  surface: string;

  /** Estilo del badge del encabezado. */
  badge: string;

  /** Degradado de la barra de Power Ranking. */
  bar: string;
}

export const TIER_BAND_META: Record<
  TierBandKey,
  TierBandMeta
> = {
  "tier-1": {
    label: "Tier 1",
    description:
      "Los mazos que definen el formato y dominan los torneos.",
    accent: "text-red-300",
    border: "border-red-500/40",
    strip:
      "bg-gradient-to-b from-red-500 via-red-400 to-amber-300",
    surface:
      "bg-[linear-gradient(110deg,rgba(239,68,68,0.10),rgba(251,191,36,0.04)_45%,transparent_75%)]",
    badge:
      "border-red-400/40 bg-red-500/10 text-red-200",
    bar: "bg-gradient-to-r from-red-500 via-orange-400 to-amber-300",
  },
  "tier-2": {
    label: "Tier 2",
    description:
      "Competidores sólidos con respuestas claras al meta.",
    accent: "text-orange-300",
    border: "border-orange-500/40",
    strip:
      "bg-gradient-to-b from-orange-500 via-orange-400 to-amber-400",
    surface:
      "bg-[linear-gradient(110deg,rgba(249,115,22,0.10),rgba(251,146,60,0.04)_45%,transparent_75%)]",
    badge:
      "border-orange-400/40 bg-orange-500/10 text-orange-200",
    bar: "bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300",
  },
  "tier-3": {
    label: "Tier 3",
    description:
      "Opciones viables que necesitan una buena pilotada.",
    accent: "text-sky-300",
    border: "border-sky-500/40",
    strip:
      "bg-gradient-to-b from-sky-500 via-cyan-400 to-blue-400",
    surface:
      "bg-[linear-gradient(110deg,rgba(14,165,233,0.10),rgba(34,211,238,0.04)_45%,transparent_75%)]",
    badge:
      "border-sky-400/40 bg-sky-500/10 text-sky-200",
    bar: "bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300",
  },
  "high-potential": {
    label: "High Potential",
    description:
      "Arquetipos con cartas fuertes que aún no tienen mazos públicos.",
    accent: "text-purple-300",
    border: "border-purple-500/40",
    strip:
      "bg-gradient-to-b from-purple-500 via-violet-400 to-slate-400",
    surface:
      "bg-[linear-gradient(110deg,rgba(168,85,247,0.10),rgba(148,163,184,0.04)_45%,transparent_75%)]",
    badge:
      "border-purple-400/40 bg-purple-500/10 text-purple-200",
    bar: "bg-gradient-to-r from-purple-500 via-violet-400 to-slate-300",
  },
};
