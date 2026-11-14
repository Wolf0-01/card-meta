import { z } from "zod";

import {
  GuideError,
  type GuideIssue,
} from "./errors";

const guideCardNameSchema = z
  .string()
  .trim()
  .min(1, "The card name cannot be empty")
  .max(
    160,
    "The card name is too long"
  );

const guideCoverUrlSchema = z
  .string()
  .trim()
  .min(1, "The cover is required")
  .max(
    600,
    "The cover URL is too long"
  )
  .refine((value) => {
    if (value.startsWith("/")) {
      return true;
    }

    try {
      const url = new URL(value);

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  }, "The cover must be a valid URL or a local path");

export const guideSectionSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, "Each section needs a heading")
    .max(
      140,
      "The section heading cannot exceed 140 characters"
    ),

  paragraphs: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Paragraphs cannot be empty")
        .max(
          8000,
          "A paragraph cannot exceed 8000 characters"
        )
    )
    .min(
      1,
      "Each section needs at least one paragraph"
    )
    .max(
      30,
      "A section cannot have more than 30 paragraphs"
    ),

  bullets: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Key points cannot be empty")
        .max(
          600,
          "A key point cannot exceed 600 characters"
        )
    )
    .max(
      40,
      "A section cannot have more than 40 key points"
    )
    .optional(),

  featuredCardNames: z
    .array(guideCardNameSchema)
    .max(
      30,
      "A section cannot have more than 30 featured cards"
    )
    .optional(),
});

const guideFields = {
  title: z
    .string()
    .trim()
    .min(3, "The title needs at least 3 characters")
    .max(
      160,
      "The title cannot exceed 160 characters"
    ),

  summary: z
    .string()
    .trim()
    .min(
      10,
      "The summary needs at least 10 characters"
    )
    .max(
      500,
      "The summary cannot exceed 500 characters"
    ),

  author: z
    .string()
    .trim()
    .min(1, "The author is required")
    .max(
      80,
      "The author cannot exceed 80 characters"
    ),

  coverUrl: guideCoverUrlSchema,

  featured: z.boolean().optional(),

  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tags cannot be empty")
        .max(
          50,
          "A tag cannot exceed 50 characters"
        )
    )
    .max(15, "You cannot add more than 15 tags")
    .optional(),

  featuredCardNames: z
    .array(guideCardNameSchema)
    .max(
      80,
      "The guide cannot have more than 80 featured cards"
    )
    .optional(),

  sections: z
    .array(guideSectionSchema)
    .min(1, "The guide needs at least one section")
    .max(
      30,
      "The guide cannot have more than 30 sections"
    ),
} as const;

export const guideCreateSchema =
  z.object(guideFields);

export const guideUpdateSchema = z
  .object(guideFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "There are no changes to save"
  );

export type GuideCreateInput = z.infer<
  typeof guideCreateSchema
>;

export type GuideUpdateInput = z.infer<
  typeof guideUpdateSchema
>;

function toIssues(
  error: z.ZodError
): GuideIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",

    message: issue.message,
  }));
}

export function parseGuideCreate(
  body: unknown
): GuideCreateInput {
  const parsed =
    guideCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw new GuideError(
      "VALIDATION",
      "Check the guide data",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}

export function parseGuideUpdate(
  body: unknown
): GuideUpdateInput {
  const parsed =
    guideUpdateSchema.safeParse(body);

  if (!parsed.success) {
    throw new GuideError(
      "VALIDATION",
      "Check the guide data",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}
