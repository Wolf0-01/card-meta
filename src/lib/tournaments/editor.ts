export interface TournamentEditorStanding {
  rank: number;

  player: string;

  archetype: string;

  deckId: string;
}

export interface TournamentEditorData {
  id: string;

  slug: string;

  name: string;

  organizer: string;

  format: string;

  playerCount: number;

  date: string;

  bannerUrl: string;

  standings: TournamentEditorStanding[];
}

export interface TournamentDeckOption {
  id: string;

  name: string;

  slug: string;

  identifier: string;

  author: string | null;

  archetype: string | null;
}

export interface TournamentMutationResult {
  id: string;

  slug: string;
}
