import {
  getDeckByIdentifier,
  getDecksBySlug,
} from "@/lib/decks";

export async function findDeckByIdentifier(
  identifier: string
) {
  return getDeckByIdentifier(identifier);
}

export async function findDecksBySlug(
  slug: string
) {
  return getDecksBySlug(slug);
}