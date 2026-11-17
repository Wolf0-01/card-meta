/**
 * Logros competitivos que puede declarar un mazo.
 *
 * El valor se guarda como texto en PostgreSQL para no
 * bloquear el esquema con un enum: la lista se valida en
 * la capa de aplicación y se normaliza antes de escribir.
 */
export const DECK_ACHIEVEMENTS = [
  "NONE",
  "KOG",
  "KC_MAX",
  "TOURNAMENT",
] as const;

export type DeckAchievement =
  (typeof DECK_ACHIEVEMENTS)[number];

export const TOURNAMENT_PLACEMENTS = [
  "1st",
  "2nd",
  "Top 4",
  "Top 8",
] as const;

export type TournamentPlacement =
  (typeof TOURNAMENT_PLACEMENTS)[number];

const ACHIEVEMENT_ALIASES: Record<
  string,
  DeckAchievement
> = {
  none: "NONE",
  "": "NONE",

  kog: "KOG",
  kingofgames: "KOG",
  "king-of-games": "KOG",

  kcmax: "KC_MAX",
  "kc-max": "KC_MAX",
  "kc-cup": "KC_MAX",
  "kc-cup-dlv-max": "KC_MAX",
  "dlvmax": "KC_MAX",

  tournament: "TOURNAMENT",
  tourney: "TOURNAMENT",
};

function canonical(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");
}

/** Normaliza cualquier entrada al logro canónico. */
export function normalizeAchievement(
  value: unknown
): DeckAchievement {
  if (typeof value !== "string") {
    return "NONE";
  }

  const key = canonical(value);

  const compact = key.replace(/-/g, "");

  const aliased =
    ACHIEVEMENT_ALIASES[key] ??
    ACHIEVEMENT_ALIASES[compact];

  if (aliased) {
    return aliased;
  }

  const upper = value.trim().toUpperCase();

  return (
    DECK_ACHIEVEMENTS as readonly string[]
  ).includes(upper)
    ? (upper as DeckAchievement)
    : "NONE";
}

/** Normaliza el puesto de un torneo. */
export function normalizePlacement(
  value: unknown
): TournamentPlacement | null {
  if (typeof value !== "string") {
    return null;
  }

  const compact = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

  if (compact === "1st" || compact === "1") {
    return "1st";
  }

  if (compact === "2nd" || compact === "2") {
    return "2nd";
  }

  if (compact === "top4" || compact === "4") {
    return "Top 4";
  }

  if (compact === "top8" || compact === "8") {
    return "Top 8";
  }

  return null;
}

export function isCompetitiveAchievement(
  achievement: DeckAchievement
): boolean {
  return achievement !== "NONE";
}

export function getAchievementLabel(
  achievement: DeckAchievement
): string {
  switch (achievement) {
    case "KOG":
      return "King of Games";

    case "KC_MAX":
      return "KC Cup DLv. Max";

    case "TOURNAMENT":
      return "Tournament";

    default:
      return "Standard deck";
  }
}

export function getAchievementShortLabel(
  achievement: DeckAchievement
): string {
  switch (achievement) {
    case "KOG":
      return "KoG";

    case "KC_MAX":
      return "KC Max";

    case "TOURNAMENT":
      return "Tournament";

    default:
      return "Standard";
  }
}

export interface AchievementEmblem {
  achievement: DeckAchievement;

  label: string;

  /** Tono visual usado por la tabla pública. */
  tone: "gold" | "blue" | "violet";
}

/**
 * Metadatos visuales del emblema oficial. Devuelve `null`
 * para los mazos estándar (sin logro competitivo).
 */
export function getAchievementEmblem(
  achievement: DeckAchievement
): AchievementEmblem | null {
  switch (achievement) {
    case "KOG":
      return {
        achievement,
        label: "King of Games",
        tone: "gold",
      };

    case "KC_MAX":
      return {
        achievement,
        label: "KC Cup DLv. Max",
        tone: "blue",
      };

    case "TOURNAMENT":
      return {
        achievement,
        label: "Tournament",
        tone: "violet",
      };

    default:
      return null;
  }
}

export interface DeckResultInput {
  achievement: unknown;

  placement: unknown;

  notes: string | null;

  proofUrl: string | null;
}

export interface DeckResultFields {
  achievement: DeckAchievement;

  placement: TournamentPlacement | null;

  notes: string | null;

  proofUrl: string | null;
}

/**
 * Limpia y coherencia los campos de resultado antes de
 * guardarlos: un mazo estándar no puede tener puesto y un
 * torneo sin puesto se rechaza más arriba (servicio).
 */
export function sanitizeResultFields(
  fields: DeckResultInput
): DeckResultFields {
  const achievement =
    normalizeAchievement(fields.achievement);

  return {
    achievement,

    placement:
      achievement === "TOURNAMENT"
        ? normalizePlacement(fields.placement)
        : null,

    notes: fields.notes?.trim() || null,

    proofUrl: fields.proofUrl?.trim() || null,
  };
}

function sameResult(
  a: DeckResultFields,
  b: DeckResultFields
): boolean {
  return (
    a.achievement === b.achievement &&
    a.placement === b.placement &&
    a.notes === b.notes &&
    a.proofUrl === b.proofUrl
  );
}

/**
 * El servidor es la autoridad sobre `verified`:
 *
 * - Un mazo estándar nunca está verificado.
 * - Si el staff cambia el resultado, se aprueba al momento.
 * - Si el envío de un USER cambia, queda pendiente.
 * - Si los campos no cambian, se conserva el estado previo
 *   (permite editar cartas sin perder la insignia).
 */
export function resolveResultVerification(
  next: DeckResultFields,
  previous:
    | (DeckResultFields & { verified: boolean })
    | null,
  isStaff: boolean
): boolean {
  if (!isCompetitiveAchievement(next.achievement)) {
    return false;
  }

  if (previous && sameResult(next, previous)) {
    return previous.verified;
  }

  return isStaff;
}
