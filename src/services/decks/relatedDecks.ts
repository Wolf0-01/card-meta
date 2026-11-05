import {
  getRelatedDecks,
} from "@/lib/decks";

export async function findRelatedDecks(
  archetypeId: string,
  excludeIdentifier: string,
  limit = 6
) {
  return getRelatedDecks(
    archetypeId,
    excludeIdentifier,
    limit
  );
}
