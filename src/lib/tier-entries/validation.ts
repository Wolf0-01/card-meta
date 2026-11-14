import { z } from "zod";

import {
  TierEntryError,
  type TierEntryIssue,
} from "./errors";

export const tierEntryFormatSchema = z.enum([
  "SPEED",
  "RUSH",
]);

export const tierEntryTierSchema = z.enum([
  "TIER_1",
  "TIER_2",
  "TIER_3",
  "HIGH_POTENTIAL",
]);

const optionalCardName = z.preprocess(
  (value) =>
    typeof value === "string" &&
    value.trim().length === 0
      ? null
      : value,
  z
    .string()
    .trim()
    .max(
      140,
      "The card name cannot exceed 140 characters"
    )
    .nullable()
);

const optionalYgoproId = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (typeof value === "number") {
      return value;
    }

    const numeric = Number(value);

    return Number.isFinite(numeric)
      ? numeric
      : value;
  },
  z
    .number()
    .int("The card id must be a whole number")
    .positive(
      "The card id must be a positive number"
    )
    .nullable()
);

const optionalNotes = z.preprocess(
  (value) =>
    typeof value === "string" &&
    value.trim().length === 0
      ? null
      : value,
  z
    .string()
    .trim()
    .max(
      500,
      "The notes cannot exceed 500 characters"
    )
    .nullable()
);

const powerScore = z.coerce
  .number()
  .int("The power score must be a whole number")
  .min(0, "The power score cannot be negative")
  .max(
    100,
    "The power score cannot exceed 100"
  );

const archetype = z
  .string()
  .trim()
  .min(1, "The archetype is required")
  .max(
    80,
    "The archetype cannot exceed 80 characters"
  );

export const tierEntryCreateSchema = z.object({
  format: tierEntryFormatSchema.default("SPEED"),

  tier: tierEntryTierSchema.default("TIER_1"),

  archetype,

  cardName: optionalCardName.optional(),

  ygoproId: optionalYgoproId.optional(),

  powerScore: powerScore.default(0),

  notes: optionalNotes.optional(),
});

export const tierEntryUpdateSchema = z
  .object({
    format: tierEntryFormatSchema.optional(),

    tier: tierEntryTierSchema.optional(),

    archetype: archetype.optional(),

    cardName: optionalCardName.optional(),

    ygoproId: optionalYgoproId.optional(),

    powerScore: powerScore.optional(),

    notes: optionalNotes.optional(),
  })
  .refine(
    (value) => Object.keys(value).length > 0,
    "There are no changes to save"
  );

export type TierEntryCreateInput = z.infer<
  typeof tierEntryCreateSchema
>;

export type TierEntryUpdateInput = z.infer<
  typeof tierEntryUpdateSchema
>;

function toIssues(
  error: z.ZodError
): TierEntryIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",

    message: issue.message,
  }));
}

export function parseTierEntryCreate(
  body: unknown
): TierEntryCreateInput {
  const parsed =
    tierEntryCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw new TierEntryError(
      "VALIDATION",
      "Please review the tier entry data",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}

export function parseTierEntryUpdate(
  body: unknown
): TierEntryUpdateInput {
  const parsed =
    tierEntryUpdateSchema.safeParse(body);

  if (!parsed.success) {
    throw new TierEntryError(
      "VALIDATION",
      "Please review the tier entry data",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}
