import {
  getArchetypeBreakdown,
  getPublicDeckArchetypeGroups,
  getPublicDeckExplorer,
  getRecentPublicDecks,
  type PublicDeckExplorerOptions,
} from "@/lib/decks";

import type { DuelFormat } from "@/lib/duelFormat";

export async function findPublicDeckExplorer(
  options: PublicDeckExplorerOptions = {}
) {
  return getPublicDeckExplorer(options);
}

export async function findPublicDeckArchetypeGroups(
  format: DuelFormat = "speed"
) {
  return getPublicDeckArchetypeGroups(format);
}

export async function findArchetypeBreakdown(
  format: DuelFormat = "speed",
  archetype = ""
) {
  return getArchetypeBreakdown(
    format,
    archetype
  );
}

export async function findRecentPublicDecks(
  limit = 6
) {
  return getRecentPublicDecks(limit);
}
