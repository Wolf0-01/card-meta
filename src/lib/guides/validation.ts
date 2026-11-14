import { z } from "zod";

import {
  GuideError,
  type GuideIssue,
} from "./errors";

const guideCardNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre de la carta no puede estar vacío")
  .max(
    160,
    "El nombre de la carta es demasiado largo"
  );

const guideCoverUrlSchema = z
  .string()
  .trim()
  .min(1, "La portada es obligatoria")
  .max(
    600,
    "La URL de la portada es demasiado larga"
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
  }, "La portada debe ser una URL válida o una ruta local");

export const guideSectionSchema = z.object({
  heading: z
    .string()
    .trim()
    .min(1, "Cada sección necesita un título")
    .max(
      140,
      "El título de la sección no puede superar 140 caracteres"
    ),

  paragraphs: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Los párrafos no pueden estar vacíos")
        .max(
          8000,
          "Un párrafo no puede superar 8000 caracteres"
        )
    )
    .min(
      1,
      "Cada sección necesita al menos un párrafo"
    )
    .max(
      30,
      "Una sección no puede tener más de 30 párrafos"
    ),

  bullets: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Los puntos clave no pueden estar vacíos")
        .max(
          600,
          "Un punto clave no puede superar 600 caracteres"
        )
    )
    .max(
      40,
      "Una sección no puede tener más de 40 puntos clave"
    )
    .optional(),

  featuredCardNames: z
    .array(guideCardNameSchema)
    .max(
      30,
      "Una sección no puede tener más de 30 cartas destacadas"
    )
    .optional(),
});

const guideFields = {
  title: z
    .string()
    .trim()
    .min(3, "El título necesita al menos 3 caracteres")
    .max(
      160,
      "El título no puede superar 160 caracteres"
    ),

  summary: z
    .string()
    .trim()
    .min(
      10,
      "El resumen necesita al menos 10 caracteres"
    )
    .max(
      500,
      "El resumen no puede superar 500 caracteres"
    ),

  author: z
    .string()
    .trim()
    .min(1, "El autor es obligatorio")
    .max(
      80,
      "El autor no puede superar 80 caracteres"
    ),

  coverUrl: guideCoverUrlSchema,

  featured: z.boolean().optional(),

  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Los tags no pueden estar vacíos")
        .max(
          50,
          "Un tag no puede superar 50 caracteres"
        )
    )
    .max(15, "No puedes añadir más de 15 tags")
    .optional(),

  featuredCardNames: z
    .array(guideCardNameSchema)
    .max(
      80,
      "La guía no puede tener más de 80 cartas destacadas"
    )
    .optional(),

  sections: z
    .array(guideSectionSchema)
    .min(1, "La guía necesita al menos una sección")
    .max(
      30,
      "La guía no puede tener más de 30 secciones"
    ),
} as const;

export const guideCreateSchema =
  z.object(guideFields);

export const guideUpdateSchema = z
  .object(guideFields)
  .partial()
  .refine(
    (value) => Object.keys(value).length > 0,
    "No hay cambios para guardar"
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
      "Revisa los datos de la guía",
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
      "Revisa los datos de la guía",
      toIssues(parsed.error)
    );
  }

  return parsed.data;
}
