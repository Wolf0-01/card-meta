import {
  statSync,
} from "node:fs";

import path from "node:path";

import type {
  SkillCharacterImage,
} from "@/types/skill";

import {
  getSkillNameKey,
  getSkillSlug,
} from "./slug";

/**
 * Retratos descargados por `scripts/syncSkills.ts`.
 *
 * El directorio vive dentro de `public/` para que las
 * imágenes se sirvan como estáticos. Su tamaño esperado es
 * pequeño (unos pocos KB por personaje), por lo que se
 * mantiene versionado en git.
 */
export const CHARACTERS_DIR = path.join(
  process.cwd(),
  "public",
  "characters"
);

export const CHARACTER_IMAGE_EXTENSIONS = [
  ".png",
  ".webp",
] as const;

export type CharacterImageExtension =
  (typeof CHARACTER_IMAGE_EXTENSIONS)[number];

/**
 * Slug estable para el archivo del retrato. Coincide con
 * el slug de Skills para reutilizar la misma normalización.
 */
export function getCharacterSlug(
  name: string
): string {
  return getSkillSlug(name);
}

/**
 * Detecta el texto de respaldo que usan las Skills que no
 * pertenecen a un personaje concreto.
 */
export function isGenericCharacterName(
  name: string | null | undefined
): boolean {
  const key = getSkillNameKey(name ?? "");

  return (
    !key ||
    key === "generic" ||
    key === "multiple characters" ||
    key === "generic / multiple characters" ||
    key.includes("multiple characters")
  );
}

function findCharacterImageFile(
  slug: string
): string | null {
  for (const extension of CHARACTER_IMAGE_EXTENSIONS) {
    const filePath = path.join(
      CHARACTERS_DIR,
      `${slug}${extension}`
    );

    try {
      const info = statSync(filePath);

      if (info.isFile() && info.size > 0) {
        return `${slug}${extension}`;
      }
    } catch {
      // El retrato todavía no se ha sincronizado.
    }
  }

  return null;
}

/**
 * Devuelve la URL pública del retrato si existe en disco y
 * pesa más de 0 bytes. Para Skills genéricas o retratos
 * ausentes devuelve `null` y la UI muestra su fallback.
 */
export function getCharacterImage(
  name: string | null | undefined
): string | null {
  if (
    !name ||
    isGenericCharacterName(name)
  ) {
    return null;
  }

  const file = findCharacterImageFile(
    getCharacterSlug(name)
  );

  return file ? `/characters/${file}` : null;
}

/**
 * Resuelve los retratos de una lista de personajes,
 * conservando el orden original y eliminando duplicados.
 */
export function getCharacterImages(
  names: readonly string[]
): SkillCharacterImage[] {
  const result: SkillCharacterImage[] = [];

  const seen = new Set<string>();

  for (const rawName of names) {
    const name = rawName.trim();

    if (
      !name ||
      isGenericCharacterName(name)
    ) {
      continue;
    }

    const slug = getCharacterSlug(name);

    if (seen.has(slug)) {
      continue;
    }

    const src = getCharacterImage(name);

    if (!src) {
      continue;
    }

    seen.add(slug);

    result.push({
      name,
      slug,
      src,
    });
  }

  return result;
}
