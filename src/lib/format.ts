const DATE_FORMATTER = new Intl.DateTimeFormat(
  "en-US",
  {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }
);

const NUMBER_FORMATTER =
  new Intl.NumberFormat("en-US");

/**
 * Fecha corta y estable para renderizar en servidor.
 * Se fija UTC para evitar desajustes de hidratación.
 */
export function formatDate(
  value: string | Date | null | undefined
): string {
  if (!value) {
    return "No date";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return DATE_FORMATTER.format(date);
}

/**
 * Separador de miles al estilo Duel Links Meta
 * (14,476 en lugar de 14.476).
 */
export function formatNumber(
  value: number
): string {
  return NUMBER_FORMATTER.format(value);
}
