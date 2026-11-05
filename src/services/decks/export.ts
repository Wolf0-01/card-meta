import { MetaDeck } from "@/types/meta";

import { buildYdk } from "@/utils/exportDeck";

function sanitizeFileName(
  name: string
) {
  return name
    .trim()
    .replace(/[<>:"/\\|?*]+/g, "")
    .replace(/\s+/g, "_");
}

export function exportDeckAsYdk(
  deck: MetaDeck
) {
  const content = buildYdk(
    deck.cards
  );

  const blob = new Blob(
    [content],
    {
      type: "text/plain;charset=utf-8",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download = `${sanitizeFileName(
    deck.name
  )}.ydk`;

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}