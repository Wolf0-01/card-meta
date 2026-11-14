import { z } from "zod";

import {
  NewsError,
  type NewsIssue,
} from "./errors";

export const NEWS_CATEGORY_VALUES = [
  "updates",
  "events",
  "boxes",
  "banlist",
] as const;

const newsCardNameSchema = z
  .string()
  .trim()
  .min(1, "The card name cannot be empty")
  .max(160, "The card name is too long");

const newsCoverUrlSchema = z
  .string()
  .trim()
  .min(1, "The cover image is required")
  .max(600, "The cover URL is too long")
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

export const newsSectionSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, "Every section needs a heading")
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
      "Every section needs at least one paragraph"
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
        .min(1, "Bullets cannot be empty")
        .max(
          600,
          "A bullet cannot exceed 600 characters"
        )
    )
    .max(
      40,
      "A section cannot have more than 40 bullets"
    )
    .optional(),

  featuredCardNames: z
    .array(newsCardNameSchema)
    .max(
      30,
      "A section cannot have more than 30 featured cards"
    )
    .optional(),
});

const newsFields = {
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

  category: z.enum(NEWS_CATEGORY_VALUES),

  coverUrl: newsCoverUrlSchema,

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
    .array(newsCardNameSchema)
    .max(
      80,
      "The article cannot have more than 80 featured cards"
    )
    .optional(),

  sections: z
    .array(newsSectionSchema)
    .min(
      1,
      "The article needs at least one section"
    )
    .max(
      30,
      "The article cannot have more than 30 sections"
    ),
} as const;

export const newsCreateSchema =
  z.object(newsFields);

export const newsUpdateSchema = z
  .object(newsFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "There are no changes to save"
  );

export type NewsCreateInput = z.infer<
  typeof newsCreateSchema
>;

export type NewsUpdateInput = z.infer<
  typeof newsUpdateSchema
>;

function toIssues(
  error: z.ZodError
): NewsIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "body",

    message: issue.message,
  }));
}

export function parseNewsCreate(
  body: unknown
): NewsCreateInput {
  const parsed =
    newsCreateSchema.safeParse(body);

  if (!parsed.success) {
    throw new NewsError(
      "VALIDATION",
      "Please review the article data",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}

export function parseNewsUpdate(
  body: unknown
): NewsUpdateInput {
  const parsed =
    newsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    throw new NewsError(
      "VALIDATION",
      "Please review the article data",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}
