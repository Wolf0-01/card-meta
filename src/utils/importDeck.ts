export interface ImportedDeck {
  main: number[];
  extra: number[];
  side: number[];
}

export function parseYdk(
  content: string
): ImportedDeck {
  const deck: ImportedDeck = {
    main: [],
    extra: [],
    side: [],
  };

  let currentSection:
    | "main"
    | "extra"
    | "side"
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

      case "!side":
        currentSection = "side";
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