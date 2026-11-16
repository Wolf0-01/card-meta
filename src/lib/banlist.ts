import { DECK_RULES } from "@/lib/decks/rules";

/**
 * Estados posibles de la banlist de Duel Links.
 *
 * Se guardan normalizados en `Card.banlistStatus` para no
 * depender de los textos de la API de Duel Links Meta.
 */
export type BanlistStatus =
  | "forbidden"
  | "limited1"
  | "limited2"
  | "limited3";

const STATUS_ALIASES: Record<
  string,
  BanlistStatus
> = {
  forbidden: "forbidden",

  "limited 1": "limited1",
  limited1: "limited1",

  "limited 2": "limited2",
  limited2: "limited2",

  "limited 3": "limited3",
  limited3: "limited3",
};

/**
 * Convierte el `banStatus` de la API de DLM
 * ("Forbidden", "Limited 1"…) al valor normalizado que
 * se almacena en la base de datos.
 */
export function normalizeBanlistStatus(
  value: unknown
): BanlistStatus | null {
  if (typeof value !== "string") {
    return null;
  }

  const key = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  return STATUS_ALIASES[key] ?? null;
}

/**
 * Número máximo de copias permitidas por la banlist.
 * Una carta no limitada usa el máximo general del juego.
 */
export function getBanlistMaxCopies(
  status: BanlistStatus | null | undefined
): number {
  switch (status) {
    case "forbidden":
      return 0;

    case "limited1":
      return 1;

    case "limited2":
      return 2;

    case "limited3":
      return 3;

    default:
      return DECK_RULES.maxCopies;
  }
}

export function getBanlistLabel(
  status: BanlistStatus
): string {
  switch (status) {
    case "forbidden":
      return "Forbidden";

    case "limited1":
      return "Limited 1";

    case "limited2":
      return "Limited 2";

    case "limited3":
      return "Limited 3";
  }
}

/**
 * Estados que comparten un cupo global en Duel Links:
 * todas las cartas de un mismo grupo suman entre sí,
 * sin importar la zona (Main o Extra).
 */
export const BANLIST_GROUP_STATUSES: BanlistStatus[] =
  [
    "forbidden",
    "limited1",
    "limited2",
    "limited3",
  ];

/**
 * Explica en inglés el cupo compartido de un grupo de
 * la banlist, para mostrarlo al usuario cuando una
 * acción supera el límite.
 */
export function describeBanlistGroupLimit(
  status: BanlistStatus
): string {
  const limit = getBanlistMaxCopies(status);

  const label = getBanlistLabel(status);

  if (limit === 0) {
    return "Forbidden cards cannot be used in Duel Links decks";
  }

  return `Duel Links allows only ${limit} ${
    limit === 1 ? "card" : "cards"
  } total from the ${label} list`;
}
