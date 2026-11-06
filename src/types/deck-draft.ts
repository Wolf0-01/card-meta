import type { CardPreviewData } from "@/types/CardPreviewData";

import type { DeckZone } from "@/types/deck";

export interface DraftCard {
  /** Id local de la carta (= id de la carta en la BD). */
  id: number;

  quantity: number;

  zone: DeckZone;

  card: CardPreviewData;
}

export interface DraftStats {
  main: number;

  extra: number;

  side: number;

  total: number;
}

export interface DraftIssue {
  path: string;

  message: string;
}

export interface DraftValidation {
  /** Incumplimientos duros (límites máximos). */
  issues: DraftIssue[];

  /** Incumplimientos que solo bloquean la publicación. */
  publishIssues: DraftIssue[];

  canSave: boolean;

  canPublish: boolean;
}

export interface DeckDraftMeta {
  name: string;

  description: string;

  isPublic: boolean;
}

export type DraftCardZone = DeckZone;
