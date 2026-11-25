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

export function getCharacterSlug(
  name: string
): string {
  return getSkillSlug(name);
}

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
      slug + extension
    );

    try {
      const info = statSync(filePath);

      if (info.isFile() && info.size > 0) {
        return slug + extension;
      }
    } catch {
      // El retrato todavía no se ha sincronizado.
    }
  }

  return null;
}

export function getGenericCharacterImage(): string | null {
  const file = findCharacterImageFile("generic");

  return file ? "/characters/" + file : null;
}

export function getCharacterImage(
  name: string | null | undefined
): string | null {
  if (
    !name ||
    isGenericCharacterName(name)
  ) {
    return getGenericCharacterImage();
  }

  const file = findCharacterImageFile(
    getCharacterSlug(name)
  );

  return file
    ? "/characters/" + file
    : getGenericCharacterImage();
}

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

    const file = findCharacterImageFile(slug);

    if (!file) {
      continue;
    }

    seen.add(slug);

    result.push({
      name,
      slug,
      src: "/characters/" + file,
    });
  }

  if (result.length === 0) {
    const genericSrc = getGenericCharacterImage();

    if (genericSrc) {
      result.push({
        name: "Generic / multiple characters",
        slug: "generic",
        src: genericSrc,
      });
    }
  }

  return result;
}
