import {
  getDeckByIdentifier,
  getDecksBySlug,
} from "@/lib/decks";

export async function findDeckByIdentifier(
  identifier: string,
  viewerId: string | null = null
) {
  return getDeckByIdentifier(
    identifier,
    viewerId
  );
}

export async function findDecksBySlug(
  slug: string
) {
  return getDecksBySlug(slug);
}