import "dotenv/config";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Prisma } from "@prisma/client";

import {
  slugifyCardName,
  uniqueCardSlug,
} from "../src/lib/cardSlug";

import { prisma } from "../src/lib/prisma";

const API_BASE =
  "https://www.duellinksmeta.com/api/v1/cards";

const IMAGE_BASE =
  "https://s3.duellinksmeta.com/cards";

const PAGE_SIZE = 1000;

const MAX_PAGES = 20;

/**
 * La API real de Rush devuelve más de 3.000 cartas. Si una
 * ejecución recibe menos, se aborta para no dejar el catálogo
 * a medias.
 */
const MIN_EXPECTED_RUSH = 3000;

const CACHE_VERSION = 2;

const CACHE_DIR = path.join(
  os.tmpdir(),
  "card-meta"
);

const CACHE_FILE = path.join(
  CACHE_DIR,
  "duel-links-rush-cards.json"
);

const WRITE_BATCH_SIZE = 50;

const CREATE_BATCH_SIZE = 250;

interface DlmRushCard {
  _id?: unknown;

  name?: unknown;

  type?: unknown;

  monsterType?: unknown;

  race?: unknown;

  attribute?: unknown;

  level?: unknown;

  atk?: unknown;

  def?: unknown;

  legend?: unknown;

  description?: unknown;

  rush?: unknown;

  obtain?: unknown;

  konamiID?: unknown;

  rarity?: unknown;
}

interface CachedRushCards {
  version?: number;

  fetchedAt?: string;

  cards?: DlmRushCard[];
}

interface CliOptions {
  apply: boolean;

  refresh: boolean;

  input?: string;

  limit?: number;
}

interface ExistingCard {
  id: number;

  name: string;

  slug: string;

  ygoproId: number | null;

  archetype: string | null;
}

interface NormalizedCard {
  name: string;

  nameKey: string;

  konamiId: number | null;

  type: string;

  frameType: string;

  attribute: string | null;

  level: number | null;

  attack: number | null;

  defense: number | null;

  rarity: string | null;

  description: string | null;

  race: string | null;

  obtain: Prisma.InputJsonValue;

  image: string | null;
}

interface SyncPlan {
  updates: {
    id: number;

    data: Prisma.CardUpdateInput;
  }[];

  creates: Prisma.CardCreateManyInput[];

  duplicates: number;
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

  if (rushCards.length < MIN_EXPECTED_RUSH) {
    throw new Error(
      `La fuente devolvió ${rushCards.length} cartas Rush, por debajo del mínimo esperado (${MIN_EXPECTED_RUSH}). Se cancela.`
    );
  }

  const uniqueCards = selectUniqueCards(rushCards);

  console.log(
    `📚 Cartas Rush recibidas: ${rushCards.length} | nombres únicos: ${uniqueCards.length}`
  );

  const normalizedCards = uniqueCards
    .map(normalizeCard)
    .filter(
      (card): card is NormalizedCard =>
        Boolean(card)
    );

  const limitedCards = options.limit
    ? normalizedCards.slice(0, options.limit)
    : normalizedCards;

  if (options.limit) {
    console.log(
      `\n🧪 Límite de prueba activo: ${limitedCards.length} de ${normalizedCards.length} cartas Rush.`
    );
  }

  const existingCards =
    await prisma.card.findMany({
      select: {
        id: true,

        name: true,

        slug: true,

        ygoproId: true,

        archetype: true,
      },
    });

  console.log(
    `🗂️  Cartas locales: ${existingCards.length}`
  );

  const plan = buildPlan(
    existingCards,
    limitedCards
  );

  printSummary(
    plan,
    existingCards.length,
    normalizedCards.length
  );

  if (!options.apply) {
    console.log(
      "\n🧪 DRY RUN: no se ha escrito nada en la base de datos."
    );

    console.log(
      "   Ejecuta con --apply para aplicar los cambios."
    );

    return;
  }

  /*
   * Paso 1: limpiar todas las marcas Rush antiguas.
   * Después se vuelven a marcar solo las cartas reales de
   * la API de Rush.
   */
  const reset = await prisma.card.updateMany({
    data: {
      format: "speed",
    },
  });

  console.log(
    `\n🧹 Reset: ${reset.count} cartas marcadas como Speed.`
  );

  /*
   * Paso 2: actualizar las cartas que ya existían.
   */
  const updated = await applyUpdates(
    plan.updates
  );

  /*
   * Paso 3: insertar las cartas Rush que faltaban.
   */
  const created = await applyCreates(
    plan.creates
  );

  console.log(
    `\n✅ Actualizadas como Rush: ${updated} cartas.`
  );

  console.log(
    `✅ Insertadas como Rush: ${created} cartas.`
  );

  await printDatabaseDistribution();

  await verifyKnownCards();
}

function buildPlan(
  existingCards: ExistingCard[],
  cards: NormalizedCard[]
): SyncPlan {
  const byName = new Map(
    existingCards.map((card) => [
      normalizeName(card.name),
      card,
    ])
  );

  const byYgoproId = new Map<
    number,
    ExistingCard
  >(
    existingCards
      .filter(
        (
          card
        ): card is ExistingCard & {
          ygoproId: number;
        } => card.ygoproId !== null
      )
      .map((card) => [
        card.ygoproId,
        card,
      ])
  );

  const usedSlugs = new Set(
    existingCards.map((card) =>
      card.slug.toLowerCase()
    )
  );

  const claimedYgoproIds = new Set(
    existingCards
      .map((card) => card.ygoproId)
      .filter(
        (value): value is number =>
          value !== null
      )
  );

  const updates: SyncPlan["updates"] = [];

  const creates: SyncPlan["creates"] = [];

  let duplicates = 0;

  for (const card of cards) {
    const existing =
      (card.konamiId
        ? byYgoproId.get(card.konamiId)
        : undefined) ??
      byName.get(card.nameKey);

    if (existing) {
      const ygoproId = resolveYgoproId(
        card.konamiId,
        existing,
        claimedYgoproIds
      );

      updates.push({
        id: existing.id,

        data: {
          ygoproId,

          format: "rush",

          type: card.type,

          attribute: card.attribute,

          level: card.level,

          attack: card.attack,

          defense: card.defense,

          rarity: card.rarity,

          image: card.image ?? null,

          description: card.description,

          race: card.race,

          frameType: card.frameType,

          obtain: card.obtain,

          scale: null,

          linkRating: null,

          linkMarkers: Prisma.JsonNull,
        },
      });

      continue;
    }

    if (byName.has(card.nameKey)) {
      duplicates += 1;

      continue;
    }

    const ygoproId = resolveYgoproId(
      card.konamiId,
      null,
      claimedYgoproIds
    );

    const baseSlug =
      slugifyCardName(card.name) ||
      `rush-${card.konamiId ?? cards.length}`;

    const slug = uniqueCardSlug(
      baseSlug,
      usedSlugs
    );

    creates.push({
      ygoproId,

      name: card.name,

      slug,

      format: "rush",

      type: card.type,

      attribute: card.attribute,

      level: card.level,

      attack: card.attack,

      defense: card.defense,

      rarity: card.rarity,

      image: card.image,

      description: card.description,

      race: card.race,

      frameType: card.frameType,

      obtain: card.obtain,

      scale: null,

      linkRating: null,

      linkMarkers: Prisma.JsonNull,
    });

    const createdCard: ExistingCard = {
      id: -1,

      name: card.name,

      slug,

      ygoproId,

      archetype: null,
    };

    byName.set(card.nameKey, createdCard);

    if (ygoproId !== null) {
      byYgoproId.set(ygoproId, createdCard);
    }
  }

  return {
    updates,
    creates,
    duplicates,
  };
}

function resolveYgoproId(
  konamiId: number | null,
  existing: ExistingCard | null,
  claimed: Set<number>
): number | null {
  if (konamiId === null) {
    return existing?.ygoproId ?? null;
  }

  if (existing?.ygoproId === konamiId) {
    return konamiId;
  }

  if (claimed.has(konamiId)) {
    return existing?.ygoproId ?? null;
  }

  claimed.add(konamiId);

  return konamiId;
}

async function applyUpdates(
  updates: SyncPlan["updates"]
): Promise<number> {
  let applied = 0;

  for (
    let index = 0;
    index < updates.length;
    index += WRITE_BATCH_SIZE
  ) {
    const batch = updates.slice(
      index,
      index + WRITE_BATCH_SIZE
    );

    await prisma.$transaction(
      batch.map((item) =>
        prisma.card.update({
          where: {
            id: item.id,
          },

          data: item.data,
        })
      )
    );

    applied += batch.length;

    logProgress(
      "Actualizando",
      applied,
      updates.length
    );
  }

  return applied;
}

async function applyCreates(
  creates: Prisma.CardCreateManyInput[]
): Promise<number> {
  let applied = 0;

  for (
    let index = 0;
    index < creates.length;
    index += CREATE_BATCH_SIZE
  ) {
    const batch = creates.slice(
      index,
      index + CREATE_BATCH_SIZE
    );

    const result =
      await prisma.card.createMany({
        data: batch,
      });

    applied += result.count;

    logProgress(
      "Insertando",
      applied,
      creates.length
    );
  }

  return applied;
}

function logProgress(
  label: string,
  current: number,
  total: number
) {
  if (
    current === total ||
    current % 500 === 0
  ) {
    console.log(
      `   ${label}: ${current}/${total}`
    );
  }
}

function normalizeCard(
  card: DlmRushCard
): NormalizedCard | null {
  const name = toStringOrNull(card.name);

  if (!name) {
    return null;
  }

  const monsterTypes = Array.isArray(
    card.monsterType
  )
    ? card.monsterType.filter(
        (value): value is string =>
          typeof value === "string"
      )
    : [];

  const mappedType = mapCardType(
    toStringOrNull(card.type),
    monsterTypes
  );

  const imageId = toStringOrNull(card._id);

  return {
    name,

    nameKey: normalizeName(name),

    konamiId: toKonamiId(card.konamiID),

    type: mappedType.type,

    frameType: mappedType.frameType,

    attribute: toStringOrNull(card.attribute),

    level: toNumberOrNull(card.level),

    attack: toNumberOrNull(card.atk),

    defense: toNumberOrNull(card.def),

    rarity: toStringOrNull(card.rarity),

    description: toStringOrNull(card.description),

    race: toStringOrNull(card.race),

    obtain: mapObtain(card.obtain),

    image: imageId
      ? `${IMAGE_BASE}/${imageId}_w420.webp`
      : null,
  };
}

function selectUniqueCards(
  cards: DlmRushCard[]
): DlmRushCard[] {
  const byName = new Map<string, DlmRushCard>();

  for (const card of cards) {
    const name = toStringOrNull(card.name);

    if (!name) {
      continue;
    }

    const key = normalizeName(name);

    const current = byName.get(key);

    if (
      !current ||
      scoreCard(card) > scoreCard(current)
    ) {
      byName.set(key, card);
    }
  }

  return [...byName.values()].sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );
}

function scoreCard(card: DlmRushCard): number {
  let score = 0;

  if (toKonamiId(card.konamiID) !== null) {
    score += 100;
  }

  if (toStringOrNull(card.rarity)) {
    score += 10;
  }

  if (toStringOrNull(card.description)) {
    score += 5;
  }

  if (toStringOrNull(card._id)) {
    score += 2;
  }

  return score;
}

function mapCardType(
  type: string | null,
  monsterTypes: string[]
): {
  type: string;

  frameType: string;
} {
  const normalizedType =
    type?.toLowerCase() ?? "";

  if (normalizedType === "spell") {
    return {
      type: "Spell Card",

      frameType: "Spell",
    };
  }

  if (normalizedType === "trap") {
    return {
      type: "Trap Card",

      frameType: "Trap",
    };
  }

  const tags = monsterTypes.map((value) =>
    value.toLowerCase()
  );

  if (tags.includes("fusion")) {
    return {
      type: "Fusion Monster",

      frameType: "Fusion",
    };
  }

  if (tags.includes("ritual")) {
    return {
      type: "Ritual Monster",

      frameType: "Ritual",
    };
  }

  if (tags.includes("maximum")) {
    return {
      type: "Maximum Monster",

      frameType: "Maximum",
    };
  }

  if (tags.includes("normal")) {
    return {
      type: "Normal Monster",

      frameType: "Normal",
    };
  }

  return {
    type: "Effect Monster",

    frameType: "Effect",
  };
}

function mapObtain(
  value: unknown
): Prisma.InputJsonValue {
  if (!Array.isArray(value)) {
    return [];
  }

  const entries = value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<
      string,
      unknown
    >;

    const source = record.source;

    if (!source || typeof source !== "object") {
      return [];
    }

    const sourceRecord = source as Record<
      string,
      unknown
    >;

    const name = toStringOrNull(
      sourceRecord.name
    );

    if (!name) {
      return [];
    }

    return [
      {
        name,

        type:
          typeof record.type === "string"
            ? record.type
            : null,

        amount:
          typeof record.amount === "number"
            ? record.amount
            : null,
      },
    ];
  });

  return entries;
}

function printSummary(
  plan: SyncPlan,
  totalCards: number,
  rushNames: number
) {
  console.log("\n📋 Plan de sincronización:");

  console.log(
    `   Cartas Rush a actualizar: ${plan.updates.length}`
  );

  console.log(
    `   Cartas Rush a insertar: ${plan.creates.length}`
  );

  console.log(
    `   Duplicados omitidos: ${plan.duplicates}`
  );

  console.log(
    `   Cartas Rush resultantes: ${
      plan.updates.length +
      plan.creates.length
    } de ${rushNames} nombres en la fuente.`
  );

  console.log(
    `   Cartas locales antes del reset: ${totalCards}`
  );
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

  console.log(
    "\n📊 Distribución actual del catálogo:"
  );

  for (const row of rows) {
    console.log(
      `   ${row.format}: ${row._count._all}`
    );
  }
}

async function verifyKnownCards() {
  const names = [
    "Sevens Road Magician",
    "Pot of Greed",
    "Trap Hole",
    "Dark Magician",
    "Dark Hole",
    "Cyber Shark",
  ];

  const cards = await prisma.card.findMany({
    where: {
      name: {
        in: names,
      },
    },

    select: {
      name: true,

      format: true,

      ygoproId: true,

      type: true,

      attack: true,

      defense: true,

      image: true,
    },

    orderBy: {
      name: "asc",
    },
  });

  console.log(
    "\n🔎 Verificación de cartas Rush conocidas:"
  );

  for (const name of names) {
    const card = cards.find(
      (item) => item.name === name
    );

    console.log(
      `   ${name}: ${
        card
          ? `${card.format} | ${card.type} | ATK ${card.attack ?? "—"} / DEF ${card.defense ?? "—"} | ${card.image ?? "sin imagen"}`
          : "NO ENCONTRADA"
      }`
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
    const cache = readCacheFile(
      CACHE_FILE
    );

    if (
      cache &&
      cache.cards &&
      cache.cards.length >=
        MIN_EXPECTED_RUSH
    ) {
      console.log(
        `📦 Usando caché local: ${CACHE_FILE}`
      );

      if (cache.fetchedAt) {
        console.log(
          `   Descargada: ${cache.fetchedAt}`
        );
      }

      return cache.cards;
    }

    console.log(
      "   Caché ignorada: no contiene suficientes cartas Rush."
    );
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
    const url = `${API_BASE}?rush=true&sort=name&page=${page}&limit=${PAGE_SIZE}`;

    const response = await fetch(url, {
      headers: {
        accept: "application/json",

        "user-agent":
          "card-meta-rush-sync/2.0",
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
        version: CACHE_VERSION,

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

function readCacheFile(
  file: string
): CachedRushCards | null {
  try {
    const parsed = JSON.parse(
      fs.readFileSync(file, "utf8")
    ) as
      | DlmRushCard[]
      | CachedRushCards;

    if (Array.isArray(parsed)) {
      return {
        cards: parsed,
      };
    }

    return parsed;
  } catch {
    return null;
  }
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

function toStringOrNull(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

function toNumberOrNull(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return null;
    }

    const parsed = Number(trimmed);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  }

  return null;
}

function toKonamiId(
  value: unknown
): number | null {
  const parsed = toNumberOrNull(value);

  if (
    parsed === null ||
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
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
      `${API_BASE}?rush=true&page=N&limit=${PAGE_SIZE}`
    }`
  );

  if (options.limit) {
    console.log(
      `   Límite de escritura: ${options.limit} cartas Rush`
    );
  }
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
