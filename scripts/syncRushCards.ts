import "dotenv/config";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { prisma } from "../src/lib/prisma";

const API_BASE =
  "https://www.duellinksmeta.com/api/v1/cards";

const PAGE_SIZE = 100;

const MAX_PAGES = 100;

const CACHE_DIR = path.join(
  os.tmpdir(),
  "card-meta"
);

const CACHE_FILE = path.join(
  CACHE_DIR,
  "duel-links-rush-cards.json"
);

const UPDATE_CHUNK_SIZE = 500;

interface DlmRushCard {
  _id?: unknown;

  name?: unknown;

  rush?: unknown;
}

interface CliOptions {
  apply: boolean;

  refresh: boolean;

  input?: string;

  limit?: number;
}

interface CardRow {
  id: number;

  name: string;

  format: string;
}

interface PlannedChanges {
  toRush: CardRow[];

  toSpeed: CardRow[];

  alreadyRush: number;

  legacyDecks: number;
}

const options = parseArgs(process.argv.slice(2));

async function main() {
  logOptions();

  const rushCards = await loadRushCards();

  if (rushCards.length === 0) {
    throw new Error(
      "La fuente no devolvió cartas Rush. Se cancela para evitar cambios masivos inválidos."
    );
  }

  const rushNames = new Set(
    rushCards
      .map((card) =>
        typeof card.name === "string"
          ? normalizeName(card.name)
          : null
      )
      .filter(
        (name): name is string => Boolean(name)
      )
  );

  console.log(
    `📚 Cartas Rush en DLM: ${rushCards.length} | nombres únicos: ${rushNames.size}`
  );

  const cards = await prisma.card.findMany({
    select: {
      id: true,
      name: true,
      format: true,
    },

    orderBy: {
      id: "asc",
    },
  });

  console.log(
    `🗂️  Cartas locales: ${cards.length}`
  );

  const planned = planChanges(
    cards,
    rushNames
  );

  const legacyDecks = await prisma.deck.count({
    where: {
      format: {
        notIn: ["speed", "rush"],
      },
    },
  });

  planned.legacyDecks = legacyDecks;

  printSummary(planned, cards.length, rushNames.size);

  const limitedRush = options.limit
    ? planned.toRush.slice(0, options.limit)
    : planned.toRush;

  if (options.limit) {
    console.log(
      `\n🧪 Límite de prueba activo: ${limitedRush.length} de ${planned.toRush.length} cartas Rush.`
    );
  }

  if (!options.apply) {
    console.log(
      "\n🧪 DRY RUN: no se ha escrito nada en la base de datos."
    );

    console.log(
      "   Ejecuta con --apply para aplicar los cambios."
    );

    return;
  }

  const updatedRush = await updateCards(
    limitedRush.map((card) => card.id),
    "rush"
  );

  const updatedSpeed = await updateCards(
    planned.toSpeed.map((card) => card.id),
    "speed"
  );

  console.log(
    `\n✅ Marcadas como Rush: ${updatedRush} cartas.`
  );

  console.log(
    `✅ Restauradas a Speed: ${updatedSpeed} cartas.`
  );

  if (legacyDecks > 0) {
    const decks = await prisma.deck.updateMany({
      where: {
        format: {
          notIn: ["speed", "rush"],
        },
      },

      data: {
        format: "speed",
      },
    });

    console.log(
      `✅ Mazos con formato antiguo normalizados a Speed: ${decks.count}.`
    );
  }

  await printDatabaseDistribution();
}

function planChanges(
  cards: CardRow[],
  rushNames: Set<string>
): PlannedChanges {
  const toRush: CardRow[] = [];

  const toSpeed: CardRow[] = [];

  let alreadyRush = 0;

  for (const card of cards) {
    const isRush = rushNames.has(
      normalizeName(card.name)
    );

    if (isRush) {
      if (card.format === "rush") {
        alreadyRush += 1;
      } else {
        toRush.push(card);
      }

      continue;
    }

    if (card.format !== "speed") {
      toSpeed.push(card);
    }
  }

  return {
    toRush,
    toSpeed,
    alreadyRush,
    legacyDecks: 0,
  };
}

function printSummary(
  planned: PlannedChanges,
  totalCards: number,
  rushNames: number
) {
  console.log("\n📋 Plan de sincronización:");

  console.log(
    `   Cartas Rush a marcar: ${planned.toRush.length}`
  );

  console.log(
    `   Cartas ya en Rush: ${planned.alreadyRush}`
  );

  console.log(
    `   Cartas a devolver a Speed: ${planned.toSpeed.length}`
  );

  console.log(
    `   Mazos con formato antiguo: ${planned.legacyDecks}`
  );

  console.log(
    `   Cartas Speed resultantes: ${
      totalCards -
      planned.toRush.length -
      planned.alreadyRush
    }`
  );

  if (planned.toRush.length === 0) {
    console.log(
      `\n✅ El catálogo ya está sincronizado (${rushNames} nombres Rush en la fuente).`
    );
  }
}

async function updateCards(
  ids: number[],
  format: "speed" | "rush"
): Promise<number> {
  let updated = 0;

  for (
    let index = 0;
    index < ids.length;
    index += UPDATE_CHUNK_SIZE
  ) {
    const chunk = ids.slice(
      index,
      index + UPDATE_CHUNK_SIZE
    );

    const result = await prisma.card.updateMany({
      where: {
        id: {
          in: chunk,
        },
      },

      data: {
        format,
      },
    });

    updated += result.count;
  }

  return updated;
}

async function printDatabaseDistribution() {
  const rows = await prisma.card.groupBy({
    by: ["format"],

    _count: {
      _all: true,
    },

    orderBy: {
      format: "asc",
    },
  });

  console.log("\n📊 Distribución actual del catálogo:");

  for (const row of rows) {
    console.log(
      `   ${row.format}: ${row._count._all}`
    );
  }
}

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseArgs(argv: string[]): CliOptions {
  const input = readOptionValue(argv, "--input");

  const limitRaw = readOptionValue(
    argv,
    "--limit"
  );

  const limit =
    limitRaw === undefined
      ? undefined
      : Number(limitRaw);

  if (
    limit !== undefined &&
    (!Number.isInteger(limit) || limit <= 0)
  ) {
    throw new Error(
      "--limit requiere un entero positivo."
    );
  }

  return {
    apply: argv.includes("--apply"),

    refresh: argv.includes("--refresh"),

    input,

    limit,
  };
}

function readOptionValue(
  argv: string[],
  name: string
): string | undefined {
  const index = argv.indexOf(name);

  if (index < 0) {
    return undefined;
  }

  const value = argv[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(
      `${name} requiere un valor.`
    );
  }

  return value;
}

function logOptions() {
  console.log(
    "🚀 Sincronizador de cartas Rush Duel"
  );

  console.log(
    `   Modo: ${options.apply ? "APLICAR" : "DRY RUN"}`
  );

  console.log(
    `   Fuente: ${
      options.input ??
      `${API_BASE}?rush=true&sort=name&page=N`
    }`
  );

  if (options.limit) {
    console.log(
      `   Límite de escritura: ${options.limit} cartas Rush`
    );
  }
}

async function loadRushCards(): Promise<
  DlmRushCard[]
> {
  if (options.input) {
    console.log(
      `📂 Leyendo snapshot local: ${options.input}`
    );

    return readCardsFile(options.input);
  }

  if (
    !options.refresh &&
    fs.existsSync(CACHE_FILE)
  ) {
    const cache = JSON.parse(
      fs.readFileSync(CACHE_FILE, "utf8")
    ) as
      | DlmRushCard[]
      | {
          cards?: DlmRushCard[];

          fetchedAt?: string;
        };

    const cachedCards = Array.isArray(cache)
      ? cache
      : cache.cards;

    if (cachedCards?.length) {
      console.log(
        `📦 Usando caché local: ${CACHE_FILE}`
      );

      if (
        !Array.isArray(cache) &&
        cache.fetchedAt
      ) {
        console.log(
          `   Descargada: ${cache.fetchedAt}`
        );
      }

      return cachedCards;
    }
  }

  console.log(
    "🌐 Descargando catálogo Rush de Duel Links Meta..."
  );

  const cards: DlmRushCard[] = [];

  for (
    let page = 1;
    page <= MAX_PAGES;
    page++
  ) {
    const url = `${API_BASE}?rush=true&sort=name&page=${page}`;

    const response = await fetch(url, {
      headers: {
        accept: "application/json",

        "user-agent":
          "card-meta-rush-sync/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `DLM página ${page}: HTTP ${response.status}`
      );
    }

    const payload = (await response.json()) as unknown;

    if (!Array.isArray(payload)) {
      throw new Error(
        `DLM página ${page}: respuesta no válida.`
      );
    }

    if (payload.length === 0) {
      console.log(
        `   Fin de paginación en la página ${page}.`
      );

      break;
    }

    const rushOnly = payload.filter(
      (card) =>
        (card as DlmRushCard).rush === true
    );

    cards.push(
      ...(rushOnly as DlmRushCard[])
    );

    console.log(
      `   Página ${page}: ${rushOnly.length} cartas Rush (${cards.length} acumuladas).`
    );

    if (payload.length < PAGE_SIZE) {
      break;
    }
  }

  if (cards.length === 0) {
    return cards;
  }

  fs.mkdirSync(CACHE_DIR, {
    recursive: true,
  });

  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),

        cards,
      },
      null,
      2
    )
  );

  console.log(
    `💾 Snapshot guardado en ${CACHE_FILE}`
  );

  return cards;
}

function readCardsFile(
  file: string
): DlmRushCard[] {
  const parsed = JSON.parse(
    fs.readFileSync(file, "utf8")
  ) as
    | DlmRushCard[]
    | {
        cards?: DlmRushCard[];
      };

  const cards = Array.isArray(parsed)
    ? parsed
    : parsed.cards;

  if (!cards) {
    throw new Error(
      `El archivo ${file} no contiene un arreglo de cartas.`
    );
  }

  return cards;
}

main()
  .catch((error) => {
    console.error(
      "\n❌ Error:",
      error instanceof Error
        ? error.message
        : error
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
