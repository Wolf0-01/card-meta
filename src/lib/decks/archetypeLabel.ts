import type { MetaDeck } from "@/types/meta";

/**
 * Nombre visible del arquetipo de un mazo.
 *
 * El mapper histórico usa "Unknown" cuando el mazo no tiene
 * arquetipo asociado; para la ficha pública preferimos mostrar
 * el nombre del mazo antes que una etiqueta vacía.
 */
export function getDeckArchetypeLabel(
  deck: Pick<
    MetaDeck,
    "archetype" | "archetypeName" | "name"
  >
): string {
  const explicit =
    deck.archetypeName?.trim();

  if (
    explicit &&
    explicit.toLowerCase() !== "unknown"
  ) {
    return explicit;
  }

  return (
    deck.archetype?.name?.trim() ||
    deck.name
  );
}
