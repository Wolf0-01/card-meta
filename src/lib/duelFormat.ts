/**
 * Formatos de duelo soportados por Card Meta.
 *
 * El valor persistido se normaliza siempre a "speed" o
 * "rush". Los mazos antiguos guardados como "Advanced"
 * se interpretan como Speed Duel.
 */
export type DuelFormat = "speed" | "rush";

export function normalizeDuelFormat(
  value?: string | null
): DuelFormat {
  return value?.trim().toLowerCase() === "rush"
    ? "rush"
    : "speed";
}

export function getDuelFormatLabel(
  value?: string | null
): string {
  return normalizeDuelFormat(value) === "rush"
    ? "Rush Duel"
    : "Speed Duel";
}

export function getDuelFormatShortLabel(
  value?: string | null
): string {
  return normalizeDuelFormat(value) === "rush"
    ? "Rush"
    : "Speed";
}
