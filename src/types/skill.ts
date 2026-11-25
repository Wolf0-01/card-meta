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

/**
 * Datos de una Skill listos para la ficha pública y para
 * la tarjeta emergente de SkillLink.
 *
 * La descripción y el formato provienen de SkillMeta; el
 * personaje se enriquece con el catálogo curado cuando la
 * Skill también existe en `src/data/skills.ts`.
 */
export interface SkillMetaSummary {
  id: string;

  name: string;

  description: string;

  format: string;

  slug: string;

  character: string | null;

  characters: string[];

  category: SkillCategory | null;

  /** Texto corto con el formato y la fuente del dato. */
  source: string;
}
