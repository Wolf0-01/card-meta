/**
 * Clave normalizada para comparar nombres de Skills sin
 * distinguir mayúsculas, tildes ni espacios sobrantes.
 */
export function getSkillNameKey(
  value: string
): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Slug estable usado por `/skills/[slug]`.
 *
 * Ejemplos:
 * - "Destiny Draw" -> "destiny-draw"
 * - "Draw Sense: Low-Level" -> "draw-sense-low-level"
 */
export function getSkillSlug(
  name: string
): string {
  const slug = getSkillNameKey(name)
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "skill";
}

/**
 * Decodifica el segmento de URL sin romper la página
 * cuando el valor contiene una secuencia inválida.
 */
export function decodeSkillSlug(
  value: string
): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
