/**
 * Normaliza texto editorial multilínea:
 *
 * - Unifica los saltos de línea a `\n`.
 * - Inserta saltos que se perdieron al importar listas
 *   antiguas (por ejemplo `)Limited 3:` o `)• Carta`).
 * - Conserva los saltos simples para que el renderizador
 *   muestre cada línea por separado.
 */
export function normalizeMultilineText(
  value: string
): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(
      /(\S)(?=[ \t]*•)/g,
      "$1\n"
    )
    .replace(
      /(\S)(?=\b(?:Limited \d+:|Cards to be Unlimited:|Skill Balance Changes|Forbidden & Limited))/gi,
      "$1\n"
    )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Divide un texto normalizado en líneas visibles. */
export function splitMultilineText(
  value: string
): string[] {
  return normalizeMultilineText(value).split("\n");
}
