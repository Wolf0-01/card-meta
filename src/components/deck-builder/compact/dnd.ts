import type { DeckZone } from "@/types/deck";

export const CARD_DRAG_TYPE =
  "application/x-cardmeta-card";

export const DRAFT_DRAG_TYPE =
  "application/x-cardmeta-draft";

export interface DraftDragPayload {
  cardId: number;

  zone: DeckZone;
}

export const DECK_ZONE_LABELS: Record<
  DeckZone,
  string
> = {
  main: "Main Deck",
  extra: "Extra Deck",
  side: "Side Deck",
};
