import { z } from "zod";

import {
  TournamentError,
  type TournamentIssue,
} from "./errors";

export const tournamentStandingSchema =
  z.object({
    rank: z.coerce
      .number()
      .int("The rank must be a whole number")
      .min(1, "The rank must be at least 1")
      .max(
        256,
        "The rank cannot exceed 256"
      ),

    player: z
      .string()
      .trim()
      .min(1, "The player name is required")
      .max(
        80,
        "The player name cannot exceed 80 characters"
      ),

    archetype: z
      .string()
      .trim()
      .min(1, "The archetype is required")
      .max(
        80,
        "The archetype cannot exceed 80 characters"
      ),

    deckId: z
      .string()
      .trim()
      .max(64, "The deck id is too long")
      .optional()
      .nullable(),
  });

const tournamentFields = {
  name: z
    .string()
    .trim()
    .min(3, "The name needs at least 3 characters")
    .max(
      160,
      "The name cannot exceed 160 characters"
    ),

  organizer: z
    .string()
    .trim()
    .min(1, "The organizer is required")
    .max(
      80,
      "The organizer cannot exceed 80 characters"
    ),

  format: z
    .string()
    .trim()
    .min(1, "The format is required")
    .max(
      40,
      "The format cannot exceed 40 characters"
    ),

  playerCount: z.coerce
    .number()
    .int("The player count must be a whole number")
    .min(0, "The player count cannot be negative")
    .max(
      100000,
      "The player count is too high"
    ),

  date: z
    .string()
    .trim()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Use a valid date (YYYY-MM-DD)"
    ),

  bannerUrl: z
    .union([
      z.literal(""),

      z
        .string()
        .trim()
        .max(
          2048,
          "The banner URL is too long"
        )
        .url("Use a valid banner URL"),
    ])
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .max(
      4000,
      "The tournament information cannot exceed 4000 characters"
    )
    .optional()
    .nullable(),

  standings: z
    .array(tournamentStandingSchema)
    .min(
      1,
      "The tournament needs at least one standing"
    )
    .max(
      256,
      "The tournament cannot have more than 256 standings"
    ),
} as const;

export const tournamentCreateSchema =
  z.object(tournamentFields);

export const tournamentUpdateSchema = z
  .object(tournamentFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "There are no changes to save"
  );

export type TournamentCreateInput = z.infer<
  typeof tournamentCreateSchema
>;

export type TournamentUpdateInput = z.infer<
  typeof tournamentUpdateSchema
>;

function toIssues(
  error: z.ZodError
): TournamentIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",

    message: issue.message,
  }));
}

export function parseTournamentCreate(
  body: unknown
): TournamentCreateInput {
  const parsed =
    tournamentCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw new TournamentError(
      "VALIDATION",
      "Please review the tournament data",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}

export function parseTournamentUpdate(
  body: unknown
): TournamentUpdateInput {
  const parsed =
    tournamentUpdateSchema.safeParse(body);

  if (!parsed.success) {
    throw new TournamentError(
      "VALIDATION",
      "Please review the tournament data",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}
