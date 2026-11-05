import {
  getDecks,
} from "@/lib/decks";

interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export async function findDeckPage(
  options: PaginationOptions = {}
) {
  return getDecks(options);
}
