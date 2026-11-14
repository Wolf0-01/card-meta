export interface NewsEditorCard {
  name: string;

  slug: string;

  image: string | null;
}

export interface NewsEditorSection {
  heading: string;

  paragraphs: string[];

  bullets: string[];

  cards: NewsEditorCard[];
}

export interface NewsEditorData {
  id: string;

  slug: string;

  title: string;

  summary: string;

  category: "updates" | "events" | "boxes" | "banlist";

  coverUrl: string;

  author: string;

  tags: string[];

  sections: NewsEditorSection[];
}

export interface NewsCoverOption {
  slug: string;

  name: string;

  bannerUrl: string;
}

export interface NewsMutationResult {
  id: string;

  slug: string;
}
