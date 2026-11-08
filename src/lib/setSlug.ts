import { slugifyCardName } from "./cardSlug";

/**
 * Convierte el nombre de una caja/set en el slug usado por
 * la ruta /articles/sets/[slug].
 *
 * Los sets usan slugs en minúsculas para mantener URLs
 * estables y legibles:
 *
 * `Ancient Records` → `ancient-records`
 */
export function slugifySetName(
  name: string
): string {
  return (
    slugifyCardName(name).toLowerCase() ||
    "set"
  );
}

const SET_TYPE_LABELS: Record<
  string,
  string
> = {
  "Main Box": "Caja principal",

  "Mini Box": "Caja mini",

  "Selection Box": "Caja de selección",

  "Pickup Box": "Caja pickup",

  "Structure Deck": "Deck de estructura",

  "Starter Deck": "Deck de inicio",

  otherSources: "Otras fuentes",
};

/**
 * Etiqueta legible para el tipo de fuente que devuelve
 * Duel Links Meta.
 */
export function formatSetType(
  type: string | null
): string {
  if (!type) {
    return "Set de Duel Links";
  }

  return SET_TYPE_LABELS[type] ?? type;
}
