/**
 * Extrae los nombres exactos entre comillas del texto de
 * una Skill. DLM rodea con comillas los nombres de cartas
 * mencionados en el efecto, por ejemplo:
 *
 *   Send "Fallen of Albaz" from your hand to the GY.
 *
 * Admite comillas rectas y tipográficas. El resultado
 * conserva el orden de aparición y no repite nombres.
 */
export function extractQuotedCardNames(
  description: string
): string[] {
  const names: string[] = [];

  const seen = new Set<string>();

  const pattern =
    /["“]([^"“”\n]{2,120})["”]/g;

  let match: RegExpExecArray | null;

  while (
    (match = pattern.exec(description)) !== null
  ) {
    const name = match[1]
      .replace(/\s+/g, " ")
      .trim();

    const key = name.toLowerCase();

    if (!name || seen.has(key)) {
      continue;
    }

    seen.add(key);

    names.push(name);
  }

  return names;
}
