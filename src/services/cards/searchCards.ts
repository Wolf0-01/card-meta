import {
  queryCards,
  type QueryOptions,
} from "@/lib/queryCards";

export async function searchCards(
  options: QueryOptions = {}
) {
  return queryCards(options);
}