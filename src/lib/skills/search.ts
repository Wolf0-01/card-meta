import { SKILLS } from "@/data/skills";

import type {
  Skill,
  SkillSearchResult,
} from "@/types/skill";

const DEFAULT_LIMIT = 18;

const MAX_LIMIT = 60;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getSkillCharacters(): string[] {
  return [...new Set(SKILLS.map((skill) => skill.character))].sort(
    (a, b) => a.localeCompare(b)
  );
}

interface QuerySkillsOptions {
  search?: string;

  character?: string;

  page?: number;

  limit?: number;
}

export function querySkills({
  search,
  character,
  page = 1,
  limit = DEFAULT_LIMIT,
}: QuerySkillsOptions = {}): SkillSearchResult {
  const term = normalize(search ?? "");

  const selectedCharacter = normalize(
    character ?? ""
  );

  const characters = getSkillCharacters();

  const filtered = SKILLS.filter((skill) => {
    if (
      selectedCharacter &&
      normalize(skill.character) !==
        selectedCharacter
    ) {
      return false;
    }

    if (!term) {
      return true;
    }

    return normalize(
      `${skill.name} ${skill.character} ${skill.description}`
    ).includes(term);
  });

  const safeLimit = Math.min(
    Math.max(Math.floor(limit), 1),
    MAX_LIMIT
  );

  const total = filtered.length;

  const pages = Math.max(
    1,
    Math.ceil(total / safeLimit)
  );

  const safePage = Math.min(
    Math.max(Math.floor(page), 1),
    pages
  );

  const start = (safePage - 1) * safeLimit;

  const skills: Skill[] = filtered.slice(
    start,
    start + safeLimit
  );

  return {
    skills,
    total,
    page: safePage,
    pages,
    characters,
  };
}
