import {
  getTierDecks,
} from "@/lib/decks";

export async function findTierDecks() {
  return getTierDecks();
}