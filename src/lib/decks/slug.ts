import crypto from "crypto";

export function slugifyDeckName(name: string) {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "deck";
}

interface HashableCard {
  cardId: number;
  quantity: number;
  zone: string;
}

/**
 * Los mazos de usuario nunca se reutilizan mediante upsert.
 * Cada guardado genera un hash único (autor + azar + timestamp),
 * evitando colisiones con el `deckHash` de los mazos meta.
 */
export function generateUserDeckHash(
  authorId: string,
  cards: HashableCard[]
) {
  const normalized = [...cards].sort((a, b) => {
    if (a.cardId !== b.cardId) {
      return a.cardId - b.cardId;
    }

    return a.zone.localeCompare(b.zone);
  });

  return crypto
    .createHash("sha256")
    .update(
      [
        authorId,
        crypto.randomUUID(),
        Date.now().toString(),
        JSON.stringify(normalized),
      ].join("|")
    )
    .digest("hex");
}
