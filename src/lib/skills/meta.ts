import { cache } from "react";

import type { SkillMeta } from "@prisma/client";

import { SKILLS } from "@/data/skills";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import { prisma } from "@/lib/prisma";

import type {
  Skill,
  SkillMetaSummary,
} from "@/types/skill";

import {
  getCharacterImages,
} from "./characterImage";

import {
  decodeSkillSlug,
  getSkillNameKey,
  getSkillSlug,
} from "./slug";

type SkillMetaRecord = Pick<
  SkillMeta,
  | "id"
  | "name"
  | "description"
  | "characters"
  | "format"
>;

function uniqueCharacters(
  values: readonly string[]
): string[] {
  const result: string[] = [];

  const seen = new Set<string>();

  for (const value of values) {
    const name = value.trim();

    const key = getSkillNameKey(name);

    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);

    result.push(name);
  }

  return result;
}

const LOCAL_SKILLS_BY_NAME = new Map(
  SKILLS.map((skill) => [
    getSkillNameKey(skill.name),
    skill,
  ])
);

function findLocalSkill(
  name: string
): Skill | null {
  return (
    LOCAL_SKILLS_BY_NAME.get(
      getSkillNameKey(name)
    ) ?? null
  );
}

function buildSource(
  format: string,
  character: string | null
): string {
  const formatLabel =
    getDuelFormatLabel(format);

  return character
    ? `${formatLabel} · Unlocked with ${character}`
    : `${formatLabel} · Duel Links Meta catalog`;
}

function toSkillMetaSummary(
  record: SkillMetaRecord
): SkillMetaSummary {
  const localSkill = findLocalSkill(
    record.name
  );

  const characters = uniqueCharacters([
    ...record.characters,

    ...(localSkill
      ? [localSkill.character]
      : []),
  ]);

  const character = characters[0] ?? null;

  const characterImages =
    getCharacterImages(characters);

  return {
    id: record.id,

    name: record.name,

    description: record.description,

    format: record.format,

    slug: getSkillSlug(record.name),

    character,

    characters,

    characterImages,

    characterImage:
      characterImages[0]?.src ?? null,

    category: localSkill?.category ?? null,

    source: buildSource(
      record.format,
      character
    ),
  };
}

function toLocalSkillMetaSummary(
  skill: Skill
): SkillMetaSummary {
  const characters = uniqueCharacters([
    skill.character,
  ]);

  const character = characters[0] ?? null;

  const characterImages =
    getCharacterImages(characters);

  return {
    id: skill.id,

    name: skill.name,

    description: skill.description,

    format: "speed",

    slug: getSkillSlug(skill.name),

    character,

    characters,

    characterImages,

    characterImage:
      characterImages[0]?.src ?? null,

    category: skill.category,

    source: buildSource(
      "speed",
      character
    ),
  };
}

/**
 * Busca una Skill en SkillMeta y, si todavía no se ha
 * sincronizado, recurre al catálogo curado local.
 */
export const getSkillMetaByName = cache(
  async (
    name: string
  ): Promise<SkillMetaSummary | null> => {
    const trimmed = name.trim();

    if (!trimmed) {
      return null;
    }

    const record =
      await prisma.skillMeta.findFirst({
        where: {
          name: {
            equals: trimmed,
            mode: "insensitive",
          },
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    if (record) {
      return toSkillMetaSummary(record);
    }

    return findLocalSkillMetaByName(trimmed);
  }
);

/**
 * Carga en lote las Skills de un listado de mazos. Devuelve
 * un mapa indexado por `getSkillNameKey(name)`.
 */
export const getSkillMetaByNames = cache(
  async (
    names: readonly string[]
  ): Promise<
    Map<string, SkillMetaSummary>
  > => {
    const uniqueNames = Array.from(
      new Set(
        names
          .map((name) => name.trim())
          .filter(Boolean)
      )
    );

    if (uniqueNames.length === 0) {
      return new Map();
    }

    const records =
      await prisma.skillMeta.findMany({
        where: {
          name: {
            in: uniqueNames,
            mode: "insensitive",
          },
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    const result = new Map<
      string,
      SkillMetaSummary
    >();

    for (const record of records) {
      const key = getSkillNameKey(
        record.name
      );

      if (!result.has(key)) {
        result.set(
          key,
          toSkillMetaSummary(record)
        );
      }
    }

    for (const name of uniqueNames) {
      const key = getSkillNameKey(name);

      if (result.has(key)) {
        continue;
      }

      const localSkill =
        findLocalSkillMetaByName(name);

      if (localSkill) {
        result.set(key, localSkill);
      }
    }

    return result;
  }
);

/**
 * Resuelve `/skills/[slug]` contra SkillMeta comparando
 * el slug normalizado (sin distinguir mayúsculas).
 */
export const getSkillMetaBySlug = cache(
  async (
    slug: string
  ): Promise<SkillMetaSummary | null> => {
    const decoded = decodeSkillSlug(
      slug
    ).trim();

    if (!decoded) {
      return null;
    }

    const direct =
      await prisma.skillMeta.findFirst({
        where: {
          name: {
            equals: decoded,
            mode: "insensitive",
          },
        },

        orderBy: {
          updatedAt: "desc",
        },
      });

    if (direct) {
      return toSkillMetaSummary(direct);
    }

    const targetSlug = getSkillSlug(decoded);

    const records =
      await prisma.skillMeta.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          characters: true,
          format: true,
        },

        orderBy: {
          name: "asc",
        },
      });

    const match = records.find(
      (record) =>
        getSkillSlug(record.name) ===
        targetSlug
    );

    if (match) {
      return toSkillMetaSummary(match);
    }

    return findLocalSkillMetaBySlug(decoded);
  }
);

export function findLocalSkillMetaByName(
  name: string
): SkillMetaSummary | null {
  const skill = findLocalSkill(name);

  return skill
    ? toLocalSkillMetaSummary(skill)
    : null;
}

export function findLocalSkillMetaBySlug(
  slug: string
): SkillMetaSummary | null {
  const decoded = decodeSkillSlug(slug);

  const targetSlug = getSkillSlug(decoded);

  const skill = SKILLS.find(
    (entry) =>
      getSkillSlug(entry.name) === targetSlug
  );

  return skill
    ? toLocalSkillMetaSummary(skill)
    : null;
}
