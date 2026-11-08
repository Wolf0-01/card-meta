import { z } from "zod";

import type { DeckZone } from "@/types/deck";

import {
  DeckError,
  type DeckIssue,
} from "./errors";

import { DECK_RULES } from "./rules";

export { DECK_RULES };


export const deckZoneSchema = z.enum([
  "main",
  "extra",
  "side",
]);

export const deckCardInputSchema = z.object({
  id: z.coerce
    .number()
    .int("El id de la carta debe ser un número entero")
    .positive("El id de la carta no es válido"),

  quantity: z.coerce
    .number()
    .int("La cantidad debe ser un número entero")
    .min(1, "La cantidad mínima es 1")
    .max(
      DECK_RULES.maxCopies,
      `No puedes usar más de ${DECK_RULES.maxCopies} copias de una carta`
    )
    .optional(),

  zone: deckZoneSchema.optional(),
});

const deckFields = {
  name: z
    .string()
    .trim()
    .min(1, "El mazo necesita un nombre")
    .max(80, "El nombre no puede superar 80 caracteres"),

  description: z
    .string()
    .trim()
    .max(
      500,
      "La descripción no puede superar 500 caracteres"
    )
    .nullable()
    .optional(),

  skill: z
    .string()
    .trim()
    .max(
      120,
      "La skill no puede superar 120 caracteres"
    )
    .nullable()
    .optional(),

  format: z
    .string()
    .trim()
    .min(1, "El formato no puede estar vacío")
    .max(
      40,
      "El formato no puede superar 40 caracteres"
    )
    .optional(),

  archetypeId: z
    .string()
    .trim()
    .min(1, "El arquetipo no es válido")
    .max(64, "El arquetipo no es válido")
    .nullable()
    .optional(),

  isPublic: z.boolean().optional(),

  cards: z
    .array(deckCardInputSchema)
    .max(
      400,
      "El mazo contiene demasiadas entradas de cartas"
    )
    .optional(),
} as const;

export const deckCreateSchema = z.object(deckFields);

export const deckUpdateSchema = z
  .object(deckFields)
  .partial();

export type DeckCreateInput = z.infer<
  typeof deckCreateSchema
>;

export type DeckUpdateInput = z.infer<
  typeof deckUpdateSchema
>;

export interface NormalizedDeckCard {
  cardId: number;
  quantity: number;
  zone: DeckZone;
}

export interface DeckCounts {
  main: number;
  extra: number;
  side: number;
  total: number;
}

function toIssues(error: z.ZodError): DeckIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",

    message: issue.message,
  }));
}

export function parseDeckCreate(body: unknown) {
  const parsed =
    deckCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw new DeckError(
      "VALIDATION",
      "Revisa los datos del mazo",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}

export function parseDeckUpdate(body: unknown) {
  const parsed =
    deckUpdateSchema.safeParse(body);

  if (!parsed.success) {
    throw new DeckError(
      "VALIDATION",
      "Revisa los datos del mazo",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}

export function normalizeDeckCards(
  cards: z.infer<typeof deckCardInputSchema>[]
): NormalizedDeckCard[] {
  const map = new Map<
    string,
    NormalizedDeckCard
  >();

  for (const card of cards) {
    const zone = card.zone ?? "main";

    const quantity = card.quantity ?? 1;

    const key = `${card.id}:${zone}`;

    const current = map.get(key);

    if (current) {
      current.quantity += quantity;
    } else {
      map.set(key, {
        cardId: card.id,
        quantity,
        zone,
      });
    }
  }

  return [...map.values()];
}

export function countDeckCards(
  cards: {
    quantity: number;
    zone: DeckZone;
  }[]
): DeckCounts {
  const counts: DeckCounts = {
    main: 0,
    extra: 0,
    side: 0,
    total: 0,
  };

  for (const card of cards) {
    counts[card.zone] += card.quantity;

    counts.total += card.quantity;
  }

  return counts;
}

export function validateDeckCards(
  cards: NormalizedDeckCard[],
  isPublic: boolean
): DeckCounts {
  const issues: DeckIssue[] = [];

  const counts = countDeckCards(cards);

  const copiesByCard = new Map<
    number,
    number
  >();

  for (const card of cards) {
    copiesByCard.set(
      card.cardId,
      (copiesByCard.get(card.cardId) ??
        0) + card.quantity
    );
  }

  for (const [
    cardId,
    copies,
  ] of copiesByCard) {
    if (copies > DECK_RULES.maxCopies) {
      issues.push({
        path: "cards",

        message: `No puedes usar más de ${DECK_RULES.maxCopies} copias de la carta #${cardId} (actual: ${copies})`,
      });
    }
  }

  if (counts.main > DECK_RULES.mainMax) {
    issues.push({
      path: "cards",

      message: `El Main Deck no puede superar ${DECK_RULES.mainMax} cartas (actual: ${counts.main})`,
    });
  }

  if (counts.extra > DECK_RULES.extraMax) {
    issues.push({
      path: "cards",

      message: `El Extra Deck no puede superar ${DECK_RULES.extraMax} cartas (actual: ${counts.extra})`,
    });
  }

  if (counts.side > DECK_RULES.sideMax) {
    issues.push({
      path: "cards",

      message: `El Side Deck no puede superar ${DECK_RULES.sideMax} cartas (actual: ${counts.side})`,
    });
  }

  if (
    isPublic &&
    counts.main < DECK_RULES.mainMin
  ) {
    issues.push({
      path: "cards",

      message: `El Main Deck necesita al menos ${DECK_RULES.mainMin} cartas para publicarse (actual: ${counts.main})`,
    });
  }

  if (issues.length > 0) {
    throw new DeckError(
      "VALIDATION",
      "El mazo no cumple las reglas",
      issues
    );
  }

  return counts;
}
