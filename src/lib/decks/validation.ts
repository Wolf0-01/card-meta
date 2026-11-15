import { z } from "zod";

import type { DuelFormat } from "@/lib/duelFormat";

import {
  getBanlistLabel,
  getBanlistMaxCopies,
  type BanlistStatus,
} from "@/lib/banlist";

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
]);

export const deckCardInputSchema = z.object({
  id: z.coerce
    .number()
    .int("The card id must be an integer")
    .positive("The card id is not valid"),

  quantity: z.coerce
    .number()
    .int("The quantity must be an integer")
    .min(1, "The minimum quantity is 1")
    .max(
      DECK_RULES.maxCopies,
      `You cannot use more than ${DECK_RULES.maxCopies} copies of a card`
    )
    .optional(),

  zone: deckZoneSchema.optional(),
});

const deckFields = {
  name: z
    .string()
    .trim()
    .min(1, "The deck needs a name")
    .max(80, "The name cannot exceed 80 characters"),

  description: z
    .string()
    .trim()
    .max(
      500,
      "The description cannot exceed 500 characters"
    )
    .nullable()
    .optional(),

  skill: z
    .string()
    .trim()
    .max(
      120,
      "The skill cannot exceed 120 characters"
    )
    .nullable()
    .optional(),

  format: z
    .string()
    .trim()
    .min(1, "The format cannot be empty")
    .max(
      40,
      "The format cannot exceed 40 characters"
    )
    .optional(),

  archetypeId: z
    .string()
    .trim()
    .min(1, "The archetype is not valid")
    .max(64, "The archetype is not valid")
    .nullable()
    .optional(),

  isPublic: z.boolean().optional(),

  cards: z
    .array(deckCardInputSchema)
    .max(
      400,
      "The deck contains too many card entries"
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

  /** Estado de banlist resuelto desde la base de datos. */
  banlistStatus?: BanlistStatus | null;
}

export interface DeckCounts {
  main: number;
  extra: number;
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
      "Check the deck data",
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
      "Check the deck data",
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
  isPublic: boolean,
  format: DuelFormat = "speed"
): DeckCounts {
  const issues: DeckIssue[] = [];

  const counts = countDeckCards(cards);

  const copiesByCard = new Map<
    number,
    number
  >();

  const statusByCard = new Map<
    number,
    BanlistStatus | null
  >();

  for (const card of cards) {
    copiesByCard.set(
      card.cardId,
      (copiesByCard.get(card.cardId) ??
        0) + card.quantity
    );

    if (!statusByCard.has(card.cardId)) {
      statusByCard.set(
        card.cardId,
        card.banlistStatus ?? null
      );
    }
  }

  for (const [
    cardId,
    copies,
  ] of copiesByCard) {
    const status =
      statusByCard.get(cardId) ?? null;

    const maxCopies =
      getBanlistMaxCopies(status);

    if (maxCopies === 0) {
      issues.push({
        path: "cards",

        message: `The card #${cardId} is Forbidden in Duel Links`,
      });

      continue;
    }

    if (copies > maxCopies) {
      issues.push({
        path: "cards",

        message: status
          ? `You cannot use more than ${maxCopies} ${
              maxCopies === 1
                ? "copy"
                : "copies"
            } of card #${cardId} (${getBanlistLabel(
              status
            )})`
          : `You cannot use more than ${maxCopies} copies of card #${cardId} (current: ${copies})`,
      });
    }
  }

  if (counts.main > DECK_RULES.mainMax) {
    issues.push({
      path: "cards",

      message: `The Main Deck cannot exceed ${DECK_RULES.mainMax} cards (current: ${counts.main})`,
    });
  }

  if (format === "rush" && counts.extra > 0) {
    issues.push({
      path: "cards",

      message:
        "Rush Duel does not use an Extra Deck: all cards must be in the Main Deck",
    });
  } else if (counts.extra > DECK_RULES.extraMax) {
    issues.push({
      path: "cards",

      message: `The Extra Deck cannot exceed ${DECK_RULES.extraMax} cards (current: ${counts.extra})`,
    });
  }

  if (
    isPublic &&
    counts.main < DECK_RULES.mainMin
  ) {
    issues.push({
      path: "cards",

      message: `The Main Deck needs at least ${DECK_RULES.mainMin} cards to be published (current: ${counts.main})`,
    });
  }

  if (issues.length > 0) {
    throw new DeckError(
      "VALIDATION",
      "The deck does not meet the rules",
      issues
    );
  }

  return counts;
}
