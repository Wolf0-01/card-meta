interface DeckCard {
  quantity?: number;
  zone: "main" | "extra" | "side";

  card: {
    ygoproId: number | null;
  };
}

export function buildYdk(
  cards: DeckCard[]
) {
  const main: number[] = [];
  const extra: number[] = [];
  const side: number[] = [];

  for (const item of cards) {
    const ygoproId =
      item.card.ygoproId;

    if (ygoproId == null) {
      continue;
    }

    const quantity =
      item.quantity ?? 1;

    for (
      let i = 0;
      i < quantity;
      i++
    ) {
      switch (item.zone) {
        case "main":
          main.push(ygoproId);
          break;

        case "extra":
          extra.push(ygoproId);
          break;

        case "side":
          side.push(ygoproId);
          break;
      }
    }
  }

  return [
    "#main",
    ...main.map(String),

    "#extra",
    ...extra.map(String),

    "!side",
    ...side.map(String),
  ].join("\n");
}