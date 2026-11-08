/**
 * Convierte el nombre de una carta en un slug legible
 * para la URL conservando mayúsculas y minúsculas.
 *
 * Ejemplo:
 * `"A Bao A Qu, the Lightless Shadow"`
 * → `A-Bao-A-Qu-the-Lightless-Shadow`
 */
export function slugifyCardName(
  name: string
): string {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/["'`´‘’“”]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Devuelve un slug único dentro de un conjunto ya usado.
 */
export function uniqueCardSlug(
  baseSlug: string,
  used: Set<string>
): string {
  const base =
    baseSlug.length > 0
      ? baseSlug
      : "card";

  let candidate = base;

  let suffix = 2;

  while (used.has(candidate.toLowerCase())) {
    candidate = `${base}-${suffix}`;

    suffix++;
  }

  used.add(candidate.toLowerCase());

  return candidate;
}
