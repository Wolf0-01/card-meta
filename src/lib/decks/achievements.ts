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

/**
 * Puestos oficiales de la KC Cup. Duel Links Meta los
 * muestra junto al logro "KC Cup DLv. Max".
 */
export const KC_CUP_PLACEMENTS = [
  "DLv. MAX",
  "Top 100 Global",
  "Global Rank 1",
  "Global Rank 2",
  "Global Rank 3",
] as const;

export type KcCupPlacement =
  (typeof KC_CUP_PLACEMENTS)[number];

export const DECK_PLACEMENTS = [
  ...TOURNAMENT_PLACEMENTS,
  ...KC_CUP_PLACEMENTS,
] as const;

export type DeckPlacement =
  (typeof DECK_PLACEMENTS)[number];

/**
 * Puestos permitidos para cada logro competitivo.
 * Devuelve `null` cuando el logro no admite puesto.
 */
export function getPlacementsForAchievement(
  achievement: DeckAchievement
): readonly DeckPlacement[] | null {
  switch (achievement) {
    case "TOURNAMENT":
      return TOURNAMENT_PLACEMENTS;

    case "KC_MAX":
      return KC_CUP_PLACEMENTS;

    default:
      return null;
  }
}

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

/**
 * Normaliza el puesto de un torneo o de la KC Cup.
 * Devuelve `null` si el valor no es un puesto oficial.
 */
export function normalizePlacement(
  value: unknown
): DeckPlacement | null {
  if (typeof value !== "string") {
    return null;
  }

  const key = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  switch (key) {
    case "1st":
    case "1":
      return "1st";

    case "2nd":
    case "2":
      return "2nd";

    case "top4":
    case "4":
      return "Top 4";

    case "top8":
    case "8":
      return "Top 8";

    case "dlvmax":
    case "dlv":
      return "DLv. MAX";

    case "top100global":
    case "top100":
      return "Top 100 Global";

    case "globalrank1":
      return "Global Rank 1";

    case "globalrank2":
      return "Global Rank 2";

    case "globalrank3":
      return "Global Rank 3";

    default:
      return null;
  }
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

  placement: DeckPlacement | null;

  notes: string | null;

  proofUrl: string | null;
}

/**
 * Limpia y coherencia los campos de resultado antes de
 * guardarlos: solo los logros que admiten puesto lo
 * conservan, y siempre dentro de su lista oficial. Un
 * torneo sin puesto se rechaza más arriba (servicio).
 */
export function sanitizeResultFields(
  fields: DeckResultInput
): DeckResultFields {
  const achievement =
    normalizeAchievement(fields.achievement);

  const allowed =
    getPlacementsForAchievement(achievement);

  const placement =
    normalizePlacement(fields.placement);

  return {
    achievement,

    placement:
      placement &&
      allowed?.includes(placement)
        ? placement
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
