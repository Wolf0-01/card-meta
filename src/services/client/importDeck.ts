import type { ImportedDeckResult } from "@/types/imported-deck";

export async function importDeck(
  content: string
): Promise<ImportedDeckResult> {
  const response = await fetch("/api/decks/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to import deck.");
  }

  return response.json();
}