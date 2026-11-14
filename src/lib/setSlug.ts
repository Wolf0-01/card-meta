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
  "Main Box": "Main Box",

  "Mini Box": "Mini Box",

  "Selection Box": "Selection Box",

  "Pickup Box": "Pickup Box",

  "Structure Deck": "Structure Deck",

  "Starter Deck": "Starter Deck",

  otherSources: "Other sources",
};

/**
 * Etiqueta legible para el tipo de fuente que devuelve
 * Duel Links Meta.
 */
export function formatSetType(
  type: string | null
): string {
  if (!type) {
    return "Duel Links set";
  }

  return SET_TYPE_LABELS[type] ?? type;
}
