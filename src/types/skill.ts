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

export interface SkillRelatedCard {
  /** Identificador de la carta en Duel Links Meta. */
  id: string;

  name: string;

  image: string | null;
}

export interface Skill {
  /** Identificador estable para claves y URLs. */
  id: string;

  name: string;

  /** Personaje principal con el que se desbloquea. */
  character: string;

  category: SkillCategory;

  /** Efecto y requisito oficial de la habilidad. */
  description: string;

  /** Cartas asociadas devueltas por Duel Links Meta. */
  relatedCards?: SkillRelatedCard[];
}

export interface SkillSearchResult {
  skills: Skill[];

  total: number;

  page: number;

  pages: number;

  characters: string[];
}
