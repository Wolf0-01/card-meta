import "dotenv/config";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { prisma } from "../src/lib/prisma";

const API_BASE =
  "https://www.duellinksmeta.com/api/v1/cards";

const CACHE_DIR = path.join(
  os.tmpdir(),
  "card-meta"
);

const CACHE_FILE = path.join(
  CACHE_DIR,
  "duel-links-cards.json"
);

const MAX_PAGES = 400;

const UPDATE_CHUNK_SIZE = 500;

const VALID_RARITIES = [
  "N",
  "R",
  "SR",
  "UR",
] as const;

type Rarity = (typeof VALID_RARITIES)[number];

interface DlmCard {
  name?: unknown;

  konamiID?: unknown;

  rarity?: unknown;

  release?: unknown;
}

interface CardRow {
  id: number;

  name: string;

  ygoproId: number | null;

  rarity: string | null;
}

interface CliOptions {
  apply: boolean;

  force: boolean;

  refresh: boolean;

  input?: string;

  report?: string;

  limit?: number;
}

interface PlannedUpdate {
  cardId: number;

  name: string;

  ygoproId: number | null;

  rarity: Rarity;

  match: "id" | "id+name" | "name";
}

const options = parseArgs(process.argv.slice(2));

async function main() {
  logOptions();

  const dlmCards = await loadDlmCards();

  if (dlmCards.length === 0) {
    throw new Error(
      "La fuente no devolvió cartas. Se cancela para evitar cambios masivos inválidos."
    );
  }

  const index = buildIndex(dlmCards);

  console.log(
    `📚 Filas DLM: ${dlmCards.length} | IDs únicos: ${index.byId.size}`
  );

  const cards = await prisma.card.findMany({
    select: {
      id: true,
      name: true,
      ygoproId: true,
      rarity: true,
    },

    orderBy: {
      id: "asc",
    },
  });

  const stats = {
    dbCards: cards.length,

    matchedById: 0,

    matchedByIdAndName: 0,

    matchedByName: 0,

    foundWithoutRarity: 0,

    notFound: 0,

    ambiguous: 0,

    skippedExisting: 0,

    planned: 0,

    distribution: {} as Record<Rarity, number>,

    unmatchedSample: [] as {
      name: string;
      ygoproId: number | null;
    }[],

    ambiguousSample: [] as {
      name: string;
      ygoproId: number | null;
      rarities: string[];
    }[],

    idOnlySample: [] as {
      name: string;
      ygoproId: number | null;
      rarity: Rarity;
    }[],

    nameOnlySample: [] as {
      name: string;
      ygoproId: number | null;
      rarity: Rarity;
    }[],

    noRaritySample: [] as {
      name: string;
      ygoproId: number | null;
    }[],
  };

  const planned: PlannedUpdate[] = [];

  for (const card of cards) {
    if (card.rarity !== null && !options.force) {
      stats.skippedExisting++;
      continue;
    }

    const result = resolveCard(card, index);

    if (result.kind === "not-found") {
      stats.notFound++;

      if (stats.unmatchedSample.length < 25) {
        stats.unmatchedSample.push({
          name: card.name,
          ygoproId: card.ygoproId,
        });
      }

      continue;
    }

    if (result.kind === "no-rarity") {
      stats.foundWithoutRarity++;

      if (stats.noRaritySample.length < 25) {
        stats.noRaritySample.push({
          name: card.name,
          ygoproId: card.ygoproId,
        });
      }

      continue;
    }

    if (result.kind === "ambiguous") {
      stats.ambiguous++;

      if (stats.ambiguousSample.length < 25) {
        stats.ambiguousSample.push({
          name: card.name,
          ygoproId: card.ygoproId,
          rarities: result.rarities,
        });
      }

      continue;
    }

    if (result.match === "id+name") {
      stats.matchedByIdAndName++;
    } else if (result.match === "id") {
      stats.matchedById++;

      if (stats.idOnlySample.length < 25) {
        stats.idOnlySample.push({
          name: card.name,
          ygoproId: card.ygoproId,
          rarity: result.rarity,
        });
      }
    } else {
      stats.matchedByName++;

      if (stats.nameOnlySample.length < 25) {
        stats.nameOnlySample.push({
          name: card.name,
          ygoproId: card.ygoproId,
          rarity: result.rarity,
        });
      }
    }

    stats.distribution[result.rarity] =
      (stats.distribution[result.rarity] ?? 0) + 1;

    stats.planned++;

    planned.push({
      cardId: card.id,
      name: card.name,
      ygoproId: card.ygoproId,
      rarity: result.rarity,
      match: result.match,
    });
  }

  printSummary(stats, planned);

  if (options.report) {
    writeReport(options.report, stats, planned);
  }

  const pending = options.limit
    ? planned.slice(0, options.limit)
    : planned;

  if (options.limit) {
    console.log(
      `\n🧪 Límite de prueba activo: ${pending.length} de ${planned.length} actualizaciones.`
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

  if (pending.length === 0) {
    console.log("\n✅ No hay cambios pendientes.");
    return;
  }

  console.log(
    `\n💾 Aplicando ${pending.length} actualizaciones en lotes de ${UPDATE_CHUNK_SIZE}...`
  );

  const updated = await applyUpdates(pending);

  console.log(
    `\n✅ Actualizadas ${updated} cartas.`
  );

  if (updated !== pending.length) {
    console.warn(
      `\n⚠️ Se planificaron ${pending.length} pero se escribieron ${updated}. ` +
        "Puede haber cambios concurrentes; vuelve a ejecutar el dry run."
    );
  }

  await printDatabaseDistribution();
}

function parseArgs(argv: string[]): CliOptions {
  const input = readOptionValue(argv, "--input");

  const report = readOptionValue(argv, "--report");

  const limitRaw = readOptionValue(argv, "--limit");

  const limit =
    limitRaw === undefined ? undefined : Number(limitRaw);

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

    force: argv.includes("--force"),

    refresh: argv.includes("--refresh"),

    input,

    report,

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
    "🏷️  Actualizador de rarezas de Duel Links"
  );

  console.log(
    `   Modo: ${options.apply ? "APLICAR" : "DRY RUN"}`
  );

  console.log(
    `   Sobrescribir rarezas existentes: ${options.force ? "sí" : "no"}`
  );

  console.log(
    `   Fuente: ${options.input ?? API_BASE}`
  );

  if (options.report) {
    console.log(
      `   Reporte de auditoría: ${options.report}`
    );
  }

  if (options.limit) {
    console.log(
      `   Límite de escritura: ${options.limit} cartas`
    );
  }
}

async function loadDlmCards(): Promise<DlmCard[]> {
  if (options.input) {
    console.log(
      `📂 Leyendo snapshot local: ${options.input}`
    );

    return readCardsFile(options.input);
  }

  if (!options.refresh && fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(
      fs.readFileSync(CACHE_FILE, "utf8")
    ) as
      | DlmCard[]
      | {
          cards?: DlmCard[];

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
    "🌐 Descargando catálogo de Duel Links Meta..."
  );

  const cards: DlmCard[] = [];

  for (
    let page = 1;
    page <= MAX_PAGES;
    page++
  ) {
    const url = `${API_BASE}?sort=name&page=${page}`;

    const response = await fetch(url, {
      headers: {
        accept: "application/json",

        "user-agent":
          "card-meta-rarity-updater/1.0",
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

    cards.push(...(payload as DlmCard[]));

    if (page % 20 === 0) {
      console.log(
        `   Página ${page}: ${cards.length} cartas acumuladas.`
      );
    }

    if (cards.length > 50000) {
      throw new Error(
        "Se superó el límite de seguridad de 50.000 cartas."
      );
    }

    await sleep(40);
  }

  if (cards.length === 0) {
    return [];
  }

  fs.mkdirSync(CACHE_DIR, {
    recursive: true,
  });

  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify(
      {
        source: `${API_BASE}?sort=name`,
        fetchedAt: new Date().toISOString(),
        cards,
      },
      null,
      2
    )
  );

  console.log(
    `💾 Caché guardada en ${CACHE_FILE}`
  );

  return cards;
}

function readCardsFile(filePath: string): DlmCard[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `No existe el archivo: ${filePath}`
    );
  }

  const parsed = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as
    | DlmCard[]
    | {
        cards?: DlmCard[];
      };

  const cards = Array.isArray(parsed)
    ? parsed
    : parsed.cards;

  if (!cards) {
    throw new Error(
      "El archivo debe ser un array o contener una propiedad cards."
    );
  }

  return cards;
}

function buildIndex(cards: DlmCard[]) {
  const byId = new Map<string, DlmCard[]>();

  const byName = new Map<string, DlmCard[]>();

  const byIdAndName = new Map<
    string,
    DlmCard[]
  >();

  for (const card of cards) {
    const id = getKonamiId(card.konamiID);

    const name =
      typeof card.name === "string"
        ? card.name
        : "";

    const normalizedName = normalizeName(name);

    if (id) {
      appendToMap(byId, id, card);

      if (normalizedName) {
        appendToMap(
          byIdAndName,
          `${id}\u0000${normalizedName}`,
          card
        );
      }
    }

    if (normalizedName) {
      appendToMap(
        byName,
        normalizedName,
        card
      );
    }
  }

  return {
    byId,
    byName,
    byIdAndName,
  };
}

function resolveCard(
  card: CardRow,
  index: ReturnType<typeof buildIndex>
):
  | {
      kind: "match";

      rarity: Rarity;

      match: "id" | "id+name" | "name";
    }
  | {
      kind: "no-rarity";
    }
  | {
      kind: "not-found";
    }
  | {
      kind: "ambiguous";

      rarities: string[];
    } {
  const normalizedName = normalizeName(card.name);

  if (card.ygoproId !== null) {
    const id = String(card.ygoproId);

    const exact = index.byIdAndName.get(
      `${id}\u0000${normalizedName}`
    );

    if (exact?.length) {
      const rarities = distinctRarities(exact);

      if (rarities.length > 1) {
        return {
          kind: "ambiguous",

          rarities,
        };
      }

      const exactCandidate =
        pickCandidate(exact);

      if (exactCandidate) {
        return {
          kind: "match",

          rarity: exactCandidate,

          match: "id+name",
        };
      }
    }

    const idEntries = index.byId.get(id);

    if (idEntries?.length) {
      const rarities = distinctRarities(idEntries);

      if (rarities.length > 1) {
        return {
          kind: "ambiguous",

          rarities,
        };
      }

      const candidate = pickCandidate(idEntries);

      if (candidate) {
        return {
          kind: "match",

          rarity: candidate,

          match: "id",
        };
      }

      return {
        kind: "no-rarity",
      };
    }
  }

  const nameEntries =
    index.byName.get(normalizedName);

  if (nameEntries?.length) {
    const rarities = distinctRarities(nameEntries);

    if (rarities.length === 1) {
      const candidate = pickCandidate(nameEntries);

      if (candidate) {
        return {
          kind: "match",

          rarity: candidate,

          match: "name",
        };
      }
    }

    if (rarities.length > 1) {
      return {
        kind: "ambiguous",

        rarities,
      };
    }

    return {
      kind: "no-rarity",
    };
  }

  return {
    kind: "not-found",
  };
}

function pickCandidate(
  entries: DlmCard[] | undefined
): Rarity | null {
  if (!entries?.length) {
    return null;
  }

  const candidates = entries
    .map((entry) => ({
      entry,

      rarity: normalizeRarity(entry.rarity),

      releasedAt: parseDate(entry.release),
    }))
    .filter(
      (
        candidate
      ): candidate is {
        entry: DlmCard;

        rarity: Rarity;

        releasedAt: number;
      } => candidate.rarity !== null
    )
    .sort(
      (a, b) => b.releasedAt - a.releasedAt
    );

  return candidates[0]?.rarity ?? null;
}

function distinctRarities(
  entries: DlmCard[]
): string[] {
  return [
    ...new Set(
      entries
        .map((entry) =>
          normalizeRarity(entry.rarity)
        )
        .filter(
          (rarity): rarity is Rarity =>
            rarity !== null
        )
    ),
  ];
}

function normalizeRarity(
  value: unknown
): Rarity | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .trim()
    .toUpperCase();

  return VALID_RARITIES.includes(
    normalized as Rarity
  )
    ? (normalized as Rarity)
    : null;
}

function getKonamiId(
  value: unknown
): string | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed.length > 0
      ? trimmed
      : null;
  }

  return null;
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(value: unknown) {
  if (typeof value !== "string") {
    return 0;
  }

  const time = Date.parse(value);

  return Number.isFinite(time) ? time : 0;
}

function appendToMap<T>(
  map: Map<string, T[]>,
  key: string,
  value: T
) {
  const list = map.get(key);

  if (list) {
    list.push(value);
  } else {
    map.set(key, [value]);
  }
}

async function applyUpdates(
  updates: PlannedUpdate[]
) {
  const byRarity = new Map<
    Rarity,
    PlannedUpdate[]
  >();

  for (const update of updates) {
    appendToMap(
      byRarity,
      update.rarity,
      update
    );
  }

  let updated = 0;

  await prisma.$transaction(
    async (tx) => {
      for (const [rarity, group] of byRarity) {
        for (
          let index = 0;
          index < group.length;
          index += UPDATE_CHUNK_SIZE
        ) {
          const chunk = group.slice(
            index,
            index + UPDATE_CHUNK_SIZE
          );

          const result = await tx.card.updateMany({
            where: options.force
              ? {
                  id: {
                    in: chunk.map(
                      (item) => item.cardId
                    ),
                  },
                }
              : {
                  id: {
                    in: chunk.map(
                      (item) => item.cardId
                    ),
                  },

                  rarity: null,
                },

            data: {
              rarity,
            },
          });

          updated += result.count;

          console.log(
            `   ${rarity}: ${Math.min(
              index + UPDATE_CHUNK_SIZE,
              group.length
            )}/${group.length} (${result.count} escritas)`
          );
        }
      }
    },
    {
      timeout: 120_000,
    }
  );

  return updated;
}

function printSummary(
  stats: {
    dbCards: number;

    matchedById: number;

    matchedByIdAndName: number;

    matchedByName: number;

    foundWithoutRarity: number;

    notFound: number;

    ambiguous: number;

    skippedExisting: number;

    planned: number;

    distribution: Record<Rarity, number>;

    unmatchedSample: {
      name: string;
      ygoproId: number | null;
    }[];

    ambiguousSample: {
      name: string;
      ygoproId: number | null;
      rarities: string[];
    }[];

    idOnlySample: {
      name: string;
      ygoproId: number | null;
      rarity: Rarity;
    }[];

    nameOnlySample: {
      name: string;
      ygoproId: number | null;
      rarity: Rarity;
    }[];

    noRaritySample: {
      name: string;
      ygoproId: number | null;
    }[];
  },
  planned: PlannedUpdate[]
) {
  console.log("\n📊 Resumen de cobertura");
  console.table({
    "Cartas en BD": stats.dbCards,

    "Match por ID + nombre":
      stats.matchedByIdAndName,

    "Match solo por ID": stats.matchedById,

    "Match por nombre": stats.matchedByName,

    "En DLM sin rareza liberada":
      stats.foundWithoutRarity,

    "No existen en DLM": stats.notFound,

    Ambiguas: stats.ambiguous,

    "Omitidas por rareza existente":
      stats.skippedExisting,

    "Actualizaciones planificadas":
      stats.planned,
  });

  console.log("\n🎨 Distribución planificada");
  console.table(stats.distribution);

  if (stats.unmatchedSample.length > 0) {
    console.log(
      "\n❓ Muestra de cartas no encontradas en DLM"
    );

    console.table(stats.unmatchedSample);
  }

  if (stats.ambiguousSample.length > 0) {
    console.log(
      "\n⚠️ Muestra de cartas ambiguas (omitidas)"
    );

    console.table(stats.ambiguousSample);
  }

  if (stats.idOnlySample.length > 0) {
    console.log(
      "\n🔎 Muestra de matches solo por ID (revisar nombre)"
    );

    console.table(stats.idOnlySample);
  }

  if (stats.nameOnlySample.length > 0) {
    console.log(
      "\n🔎 Muestra de matches solo por nombre (sin ID)"
    );

    console.table(stats.nameOnlySample);
  }

  if (stats.noRaritySample.length > 0) {
    console.log(
      "\n⏳ Muestra de cartas en DLM aún sin rareza oficial"
    );

    console.table(stats.noRaritySample);
  }

  if (planned.length > 0) {
    console.log(
      "\n👀 Muestra de actualizaciones planificadas"
    );

    console.table(
      planned.slice(0, 12).map((item) => ({
        name: item.name,

        ygoproId: item.ygoproId,

        rarity: item.rarity,

        match: item.match,
      }))
    );
  }
}

function writeReport(
  reportPath: string,
  stats: Parameters<typeof printSummary>[0],
  planned: PlannedUpdate[]
) {
  const absolute = path.resolve(reportPath);

  fs.mkdirSync(path.dirname(absolute), {
    recursive: true,
  });

  fs.writeFileSync(
    absolute,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),

        source: options.input ?? API_BASE,

        mode: options.apply ? "apply" : "dry-run",

        force: options.force,

        limit: options.limit ?? null,

        stats,

        planned,
      },
      null,
      2
    )
  );

  console.log(
    `\n📝 Reporte de auditoría escrito en ${absolute}`
  );
}

async function printDatabaseDistribution() {
  const rows = await prisma.card.groupBy({
    by: ["rarity"],

    _count: {
      _all: true,
    },
  });

  console.log(
    "\n🗄️ Distribución actual en PostgreSQL"
  );

  console.table(
    rows.map((row) => ({
      rarity: row.rarity ?? "(null)",

      cards: row._count._all,
    }))
  );
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

main()
  .catch((error) => {
    console.error("\n❌ Error:", error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
