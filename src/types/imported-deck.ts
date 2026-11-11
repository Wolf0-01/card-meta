export interface ImportedDeckCard {
  quantity: number;

  zone: "main" | "extra";

  card: {
    id: number;

    ygoproId: number | null;

    name: string;

    image: string | null;

    type: string;

    attribute: string | null;

    race: string | null;

    level: number | null;

    attack: number | null;

    defense: number | null;
  };
}

export interface ImportedDeckResult {
  main: ImportedDeckCard[];

  extra: ImportedDeckCard[];
}