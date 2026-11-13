import "dotenv/config";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Prisma } from "@prisma/client";

import { prisma } from "../src/lib/prisma";

import type {
  CardObtainEntry,
} from "../src/types/card";

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

const RUSH_CACHE_FILE = path.join(
  CACHE_DIR,
  "duel-links-rush-cards.json"
);

const MAX_PAGES = 400;

const PAGE_SIZE = 1000;

/**
 * La API real de Rush devuelve más de 3.000 cartas. Si una
 * ejecución recibe menos, se aborta para no vaciar el campo
 * `obtain` de medio catálogo Rush.
 */
const MIN_EXPECTED_RUSH = 3000;

const UPDATE_CHUNK_SIZE = 500;

interface DlmObtainSource {
  name?: unknown;

  type?: unknown;
}

interface DlmObtain {
  amount?: unknown;

  type?: unknown;

  source?: DlmObtainSource | null;
}

interface DlmCard {
  name?: unknown;

  konamiID?: unknown;

  obtain?: unknown;
}

interface CardRow {
  id: number;

  name: string;

  ygoproId: number | null;

  obtain: unknown;
}

interface CliOptions {
  apply: boolean;

  refresh: boolean;

  rush: boolean;

  input?: string;

  limit?: number;
}

interface PlannedUpdate {
  cardId: number;

  name: string;

  ygoproId: number | null;

  match: "id" | "id+name" | "name";

  obtain: CardObtainEntry[];
}

interface Stats {
  total: number;

  matched: number;

  notFound: number;

  withoutObtain: number;

  unchanged: number;

  planned: number;

  updated: number;

  unmatchedSample: {
    name: string;

    ygoproId: number | null;
  }[];
}

const options: CliOptions = parseArgs(
  process.argv.slice(2)
);

function parseArgs(argv: string[]): CliOptions {
  const input = readOptionValue(
    argv,
    "--input"
  );

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

    rush: argv.includes("--rush"),

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
    "📦 Actualizador de obtención de Duel Links"
  );

  console.log(
    `   Modo: ${options.apply ? "APLICAR" : "DRY RUN"}`
  );

  console.log(
    `   Formato: ${options.rush ? "Rush Duel" : "Speed Duel"}`
  );

  console.log(
    `   Fuente: ${
      options.input ??
      (options.rush
        ? `${API_BASE}?rush=true`
        : API_BASE)
    }`
  );

  if (options.limit) {
    console.log(
      `   Límite de escritura: ${options.limit} cartas`
    );
  }
}

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getKonamiId(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? String(value)
      : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed.length > 0
      ? trimmed
      : null;
  }

  return null;
}

function normalizeObtain(
  value: unknown
): CardObtainEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const entries = new Map<
    string,
    CardObtainEntry
  >();

  for (const item of value) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const record = item as DlmObtain;

    const source =
      record.source ?? null;

    const name =
      source &&
      typeof source.name === "string"
        ? source.name.trim()
        : "";

    if (!name) {
      continue;
    }

    const type =
      source &&
      typeof source.type === "string"
        ? source.type.trim() || null
        : typeof record.type === "string"
          ? record.type.trim() || null
          : null;

    const amount =
      typeof record.amount === "number" &&
      Number.isFinite(record.amount)
        ? record.amount
        : null;

    const key = `${name.toLowerCase()}\u0000${type ?? ""}`;

    if (entries.has(key)) {
      continue;
    }

    entries.set(key, {
      name,

      type,

      amount,
    });
  }

  return [...entries.values()].sort(
    (a, b) => {
      const byName = a.name.localeCompare(
        b.name,
        "en"
      );

      if (byName !== 0) {
        return byName;
      }

      return (a.type ?? "").localeCompare(
        b.type ?? "",
        "en"
      );
    }
  );
}

function serializeObtain(
  value: CardObtainEntry[] | null
): string {
  return JSON.stringify(value ?? null);
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

function appendToMap(
  map: Map<string, DlmCard[]>,
  key: string,
  card: DlmCard
) {
  const current = map.get(key);

  if (current) {
    current.push(card);

    return;
  }

  map.set(key, [card]);
}

function resolveCard(
  card: CardRow,
  index: ReturnType<typeof buildIndex>
):
  | {
      kind: "match";

      match: PlannedUpdate["match"];

      obtain: CardObtainEntry[];
    }
  | {
      kind: "not-found";
    } {
  const normalizedName = normalizeName(
    card.name
  );

  if (card.ygoproId !== null) {
    const id = String(card.ygoproId);

    const exact = index.byIdAndName.get(
      `${id}\u0000${normalizedName}`
    );

    if (exact?.length) {
      return {
        kind: "match",

        match: "id+name",

        obtain: pickObtain(exact),
      };
    }

    const byId = index.byId.get(id);

    if (byId?.length) {
      return {
        kind: "match",

        match: "id",

        obtain: pickObtain(byId),
      };
    }
  }

  const byName =
    index.byName.get(normalizedName);

  if (byName?.length) {
    return {
      kind: "match",

      match: "name",

      obtain: pickObtain(byName),
    };
  }

  return {
    kind: "not-found",
  };
}

function pickObtain(
  entries: DlmCard[]
): CardObtainEntry[] {
  /*
   * Varias entradas de DLM pueden compartir Konami ID o
   * nombre. Se combinan todas sus fuentes para no perder
   * cajas en las que aparece la carta.
   */

  const combined: unknown[] = [];

  for (const entry of entries) {
    if (Array.isArray(entry.obtain)) {
      combined.push(...entry.obtain);
    }
  }

  return normalizeObtain(combined);
}

async function fetchDlmPage(
  page: number,
  attempt = 1
): Promise<unknown[]> {
  const url = options.rush
    ? `${API_BASE}?rush=true&sort=name&page=${page}&limit=${PAGE_SIZE}`
    : `${API_BASE}?sort=name&page=${page}`;

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json",

        "user-agent": options.rush
          ? "card-meta-rush-obtain-updater/1.0"
          : "card-meta-obtain-updater/1.0",
      },
    });
  } catch (error) {
    if (attempt < 5) {
      console.warn(
        `   Reintentando página ${page} (${attempt}/4): ${String(
          error
        )}`
      );

      await sleep(500 * attempt);

      return fetchDlmPage(page, attempt + 1);
    }

    throw error;
  }

  if (!response.ok) {
    if (response.status >= 500 && attempt < 5) {
      console.warn(
        `   Reintentando página ${page} (${attempt}/4): HTTP ${response.status}`
      );

      await sleep(500 * attempt);

      return fetchDlmPage(page, attempt + 1);
    }

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

  return payload;
}

async function loadDlmCards(): Promise<DlmCard[]> {
  if (options.input) {
    console.log(
      `📂 Leyendo snapshot local: ${options.input}`
    );

    return readCardsFile(options.input);
  }

  const cacheFile = options.rush
    ? RUSH_CACHE_FILE
    : CACHE_FILE;

  if (
    !options.refresh &&
    fs.existsSync(cacheFile)
  ) {
    const cache = readCardsFile(cacheFile);

    const enoughCards = options.rush
      ? cache.length >= MIN_EXPECTED_RUSH
      : cache.length > 0;

    if (enoughCards) {
      console.log(
        `📦 Usando caché local: ${cacheFile}`
      );

      return cache;
    }

    console.log(
      "   Caché ignorada: no contiene suficientes cartas."
    );
  }

  console.log(
    `🌐 Descargando catálogo ${
      options.rush ? "Rush " : ""
    }de Duel Links Meta...`
  );

  const cards: DlmCard[] = [];

  for (
    let page = 1;
    page <= MAX_PAGES;
    page++
  ) {
    const payload =
      await fetchDlmPage(page);

    if (payload.length === 0) {
      console.log(
        `   Fin de paginación en la página ${page}.`
      );

      break;
    }

    const pageCards = options.rush
      ? (payload as DlmCard[]).filter(
          (card) =>
            (card as { rush?: unknown }).rush ===
            true
        )
      : (payload as DlmCard[]);

    cards.push(...pageCards);

    if (options.rush || page % 20 === 0) {
      console.log(
        `   Página ${page}: ${pageCards.length} cartas (${cards.length} acumuladas).`
      );
    }

    if (cards.length > 50000) {
      throw new Error(
        "Se superó el límite de seguridad de 50.000 cartas."
      );
    }

    if (
      options.rush &&
      payload.length < PAGE_SIZE
    ) {
      break;
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
    cacheFile,
    JSON.stringify(
      {
        source: options.rush
          ? `${API_BASE}?rush=true&sort=name`
          : `${API_BASE}?sort=name`,

        fetchedAt: new Date().toISOString(),

        cards,
      },
      null,
      2
    )
  );

  console.log(
    `💾 Caché guardada en ${cacheFile}`
  );

  return cards;
}

function readCardsFile(
  filePath: string
): DlmCard[] {
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

async function main() {
  logOptions();

  const dlmCards = await loadDlmCards();

  if (
    options.rush &&
    dlmCards.length < MIN_EXPECTED_RUSH
  ) {
    throw new Error(
      `La fuente Rush devolvió ${dlmCards.length} cartas, por debajo del mínimo esperado (${MIN_EXPECTED_RUSH}). Se cancela.`
    );
  }

  console.log(
    `📚 Cartas ${options.rush ? "Rush " : ""}en Duel Links Meta: ${dlmCards.length}`
  );

  const index = buildIndex(dlmCards);

  const cards =
    await prisma.card.findMany({
      where: options.rush
        ? {
            format: "rush",
          }
        : undefined,

      select: {
        id: true,
        name: true,
        ygoproId: true,
        obtain: true,
      },

      orderBy: {
        id: "asc",
      },
    });

  if (
    options.rush &&
    cards.length < MIN_EXPECTED_RUSH
  ) {
    throw new Error(
      `La base solo tiene ${cards.length} cartas Rush, por debajo del mínimo esperado (${MIN_EXPECTED_RUSH}). Se cancela para no dejar el catálogo a medias.`
    );
  }

  const stats: Stats = {
    total: cards.length,

    matched: 0,

    notFound: 0,

    withoutObtain: 0,

    unchanged: 0,

    planned: 0,

    updated: 0,

    unmatchedSample: [],
  };

  const planned: PlannedUpdate[] = [];

  for (const card of cards) {
    const result = resolveCard(
      card,
      index
    );

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

    stats.matched++;

    if (result.obtain.length === 0) {
      stats.withoutObtain++;
    }

    const nextObtain =
      result.obtain.length > 0
        ? result.obtain
        : null;

    if (
      serializeObtain(card.obtain as
        | CardObtainEntry[]
        | null) ===
      serializeObtain(nextObtain)
    ) {
      stats.unchanged++;

      continue;
    }

    stats.planned++;

    planned.push({
      cardId: card.id,

      name: card.name,

      ygoproId: card.ygoproId,

      match: result.match,

      obtain: result.obtain,
    });
  }

  printSummary(stats);

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
    console.log(
      "\n✅ No hay cambios pendientes."
    );

    return;
  }

  console.log(
    `\n💾 Aplicando ${pending.length} actualizaciones en lotes de ${UPDATE_CHUNK_SIZE}...`
  );

  for (
    let index = 0;
    index < pending.length;
    index += UPDATE_CHUNK_SIZE
  ) {
    const chunk = pending.slice(
      index,
      index + UPDATE_CHUNK_SIZE
    );

    await Promise.all(
      chunk.map((item) =>
        prisma.card.update({
          where: {
            id: item.cardId,
          },

          data: {
            obtain:
              item.obtain.length > 0
                ? (item.obtain as unknown as Prisma.InputJsonValue)
                : Prisma.DbNull,
          },
        })
      )
    );

    stats.updated += chunk.length;

    console.log(
      `✅ ${Math.min(
        index + UPDATE_CHUNK_SIZE,
        pending.length
      )}/${pending.length}`
    );
  }

  console.log(
    `\n✅ Actualizadas ${stats.updated} cartas.`
  );
}

function printSummary(stats: Stats) {
  console.log("\n====== Resumen ======");

  console.log(
    `Cartas en la base de datos: ${stats.total}`
  );

  console.log(
    `Coincidencias DLM: ${stats.matched}`
  );

  console.log(
    `Sin coincidencia: ${stats.notFound}`
  );

  console.log(
    `Sin fuentes de obtención: ${stats.withoutObtain}`
  );

  console.log(
    `Sin cambios: ${stats.unchanged}`
  );

  console.log(
    `Cambios planificados: ${stats.planned}`
  );

  if (stats.unmatchedSample.length > 0) {
    console.log(
      "\nMuestra sin coincidencia:"
    );

    for (const item of stats.unmatchedSample) {
      console.log(
        `   - ${item.name} (Konami: ${
          item.ygoproId ?? "?"
        })`
      );
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(
      "❌ Error actualizando obtención:",
      error
    );

    await prisma.$disconnect();

    process.exit(1);
  });
