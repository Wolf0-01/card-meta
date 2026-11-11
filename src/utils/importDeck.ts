export interface ImportedDeck {
  main: number[];
  extra: number[];
}

export function parseYdk(
  content: string
): ImportedDeck {
  const deck: ImportedDeck = {
    main: [],
    extra: [],
  };

  let currentSection:
    | "main"
    | "extra"
    | null = null;

  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    switch (line) {
      case "#main":
        currentSection = "main";
        continue;

      case "#extra":
        currentSection = "extra";
        continue;

      /*
       * El Side Deck no existe en Duel Links,
       * así que sus cartas se ignoran al importar.
       */
      case "!side":
        currentSection = null;
        continue;
    }

    if (line.startsWith("#")) {
      continue;
    }

    const id = Number(line);

    if (!Number.isInteger(id)) {
      continue;
    }

    if (currentSection) {
      deck[currentSection].push(id);
    }
  }

  return deck;
}