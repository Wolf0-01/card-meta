import {
  getTopDecks,
} from "@/lib/decks";

export async function findTopDecks() {
  return getTopDecks();
}