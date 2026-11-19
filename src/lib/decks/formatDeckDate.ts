/**
 * Formatea una fecha ISO como DD/MM/AAAA para las tarjetas de
 * mazo. Vive fuera de los componentes cliente para que también
 * pueda usarse desde Server Components.
 */
export function formatDeckDate(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  return `${day}/${month}/${date.getFullYear()}`;
}
