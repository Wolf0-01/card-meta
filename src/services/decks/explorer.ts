import {
  getPublicDeckExplorer,
  getRecentPublicDecks,
  type PublicDeckExplorerOptions,
} from "@/lib/decks";

export async function findPublicDeckExplorer(
  options: PublicDeckExplorerOptions = {}
) {
  return getPublicDeckExplorer(options);
}

export async function findRecentPublicDecks(
  limit = 6
) {
  return getRecentPublicDecks(limit);
}
