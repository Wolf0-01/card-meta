export const SKILL_CATEGORIES = [
  "robo",
  "campo",
  "ataque",
  "fusion",
  "invocacion",
  "recuperacion",
  "especial",
] as const;

export type SkillCategory =
  (typeof SKILL_CATEGORIES)[number];

export interface Skill {
  /** Identificador estable para claves y URLs. */
  id: string;

  name: string;

  /** Personaje principal con el que se desbloquea. */
  character: string;

  category: SkillCategory;

  /** Efecto y requisito oficial de la habilidad. */
  description: string;
}

export interface SkillSearchResult {
  skills: Skill[];

  total: number;

  page: number;

  pages: number;

  characters: string[];
}
