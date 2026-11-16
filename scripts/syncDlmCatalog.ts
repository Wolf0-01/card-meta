import "dotenv/config";

import { Prisma } from "@prisma/client";

import { normalizeBanlistStatus } from "../src/lib/banlist";

import {
  slugifyCardName,
  uniqueCardSlug,
} from "../src/lib/cardSlug";

import { prisma } from "../src/lib/prisma";

/**
 * Sincroniza el catálogo completo de Duel Links Meta con
 * PostgreSQL:
 *
 * - Actualiza las cartas Speed con los datos reales de Speed
 *   Duel (rareza, banlist, descripción, obtención, tipo…).
 * - Restaura como Speed las cartas compartidas que quedaron
 *   marcadas como Rush por error.
 * - Inserta las cartas oficiales que falten en Speed y Rush.
 *
 * La API mezcla Speed y Rush en el listado principal;
 * `?rush=false` está roto (solo devuelve 3 filas), así que se
 * pagina todo y se separa por la bandera `rush`.
 *
 * Uso:
 *   npx tsx scripts/syncDlmCatalog.ts
 *   npx tsx scripts/syncDlmCatalog.ts --dry-run
 */

const API_BASE =
  "https://www.duellinksmeta.com/api/v1/cards";

const IMAGE_BASE =
  "https://s3.duellinksmeta.com/cards";

const PAGE_SIZE = 1000;

const MAX_PAGES = 40;

const WRITE_BATCH_SIZE = 50;

const dryRun = process.argv.includes("--dry-run");

interface DlmCard {
  _id?: unknown;

  konamiID?: unknown;

  name?: unknown;

  type?: unknown;

  monsterType?: unknown;

  race?: unknown;

  attribute?: unknown;

  level?: unknown;

  atk?: unknown;

  def?: unknown;

  description?: unknown;

  obtain?: unknown;

  rarity?: unknown;

  banStatus?: unknown;

  alternateArt?: unknown;

  rush?: unknown;

  scale?: unknown;

  linkRating?: unknown;

  linkArrows?: unknown;
}

interface NormalizedCard {
  dlmId: string;

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

  banlistStatus: string | null;

  description: string | null;

  race: string | null;

  obtain: Prisma.InputJsonValue;

  image: string;

  scale: number | null;

  linkRating: number | null;

  linkMarkers:
    | Prisma.InputJsonValue
    | typeof Prisma.DbNull;

  alternateArt: boolean;
}

interface ExistingCard {
  id: number;

  name: string;

  slug: string;

  format: string;

  ygoproId: number | null;

  rarity: string | null;

  banlistStatus: string | null;

  description: string | null;

  obtain: Prisma.JsonValue;

  type: string;

  frameType: string | null;

  attribute: string | null;

  level: number | null;

  attack: number | null;

  defense: number | null;

  race: string | null;

  scale: number | null;

  linkRating: number | null;

  linkMarkers: Prisma.JsonValue;

  image: string | null;
}

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toStringOrNull(
  value: unknown
): string | null {
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

function toNumberOrNull(
  value: unknown
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? value
      : null;
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

  return parsed !== null &&
    Number.isSafeInteger(parsed) &&
    parsed > 0
    ? parsed
    : null;
}

function buildImageUrl(dlmId: string): string {
  return `${IMAGE_BASE}/${dlmId}_w420.webp`;
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function fetchPage(
  url: string,
  attempt = 1
): Promise<DlmCard[]> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json",

        "user-agent":
          "card-meta-catalog-sync/1.0",
      },
    });
  } catch (error) {
    if (attempt < 5) {
      console.warn(
        `   Reintentando (${attempt}/4): ${String(
          error
        )}`
      );

      await sleep(500 * attempt);

      return fetchPage(url, attempt + 1);
    }

    throw error;
  }

  if (!response.ok) {
    if (response.status >= 500 && attempt < 5) {
      console.warn(
        `   Reintentando (${attempt}/4): HTTP ${response.status}`
      );

      await sleep(500 * attempt);

      return fetchPage(url, attempt + 1);
    }

    throw new Error(
      `DLM ${url}: HTTP ${response.status}`
    );
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    throw new Error(
      `DLM ${url}: respuesta no válida.`
    );
  }

  return payload as DlmCard[];
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

  if (normalizedType === "skill") {
    return {
      type: "Skill",

      frameType: "Skill",
    };
  }

  const tags = new Set(
    monsterTypes.map((value) =>
      value.toLowerCase()
    )
  );

  const frames: {
    tag: string;

    type: string;

    frameType: string;
  }[] = [
    {
      tag: "fusion",

      type: "Fusion Monster",

      frameType: "Fusion",
    },

    {
      tag: "ritual",

      type: "Ritual Monster",

      frameType: "Ritual",
    },

    {
      tag: "synchro",

      type: "Synchro Monster",

      frameType: "Synchro",
    },

    {
      tag: "xyz",

      type: "Xyz Monster",

      frameType: "Xyz",
    },

    {
      tag: "link",

      type: "Link Monster",

      frameType: "Link",
    },

    {
      tag: "pendulum",

      type: "Pendulum Monster",

      frameType: "Pendulum",
    },

    {
      tag: "maximum",

      type: "Maximum Monster",

      frameType: "Maximum",
    },
  ];

  for (const frame of frames) {
    if (tags.has(frame.tag)) {
      return {
        type: frame.type,

        frameType: frame.frameType,
      };
    }
  }

  if (tags.has("normal")) {
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

  return entries as Prisma.InputJsonValue;
}

function mapLinkMarkers(
  value: unknown
):
  | Prisma.InputJsonValue
  | typeof Prisma.DbNull {
  if (!Array.isArray(value)) {
    return Prisma.DbNull;
  }

  const markers = value.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0
  );

  return markers.length > 0
    ? (markers as Prisma.InputJsonValue)
    : Prisma.DbNull;
}

function normalizeCard(
  card: DlmCard
): NormalizedCard | null {
  const name = toStringOrNull(card.name);

  const dlmId = toStringOrNull(card._id);

  if (!name || !dlmId) {
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

  return {
    dlmId,

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

    banlistStatus: normalizeBanlistStatus(
      card.banStatus
    ),

    description: toStringOrNull(
      card.description
    ),

    race: toStringOrNull(card.race),

    obtain: mapObtain(card.obtain),

    image: buildImageUrl(dlmId),

    scale: toNumberOrNull(card.scale),

    linkRating: toNumberOrNull(
      card.linkRating
    ),

    linkMarkers: mapLinkMarkers(
      card.linkArrows
    ),

    alternateArt: card.alternateArt === true,
  };
}

function scoreCard(card: DlmCard): number {
  let score = 0;

  if (card.alternateArt !== true) {
    score += 100;
  }

  if (toStringOrNull(card.rarity)) {
    score += 20;
  }

  if (toStringOrNull(card.description)) {
    score += 10;
  }

  if (toKonamiId(card.konamiID) !== null) {
    score += 5;
  }

  if (toStringOrNull(card._id)) {
    score += 2;
  }

  return score;
}

function selectRepresentatives(
  cards: DlmCard[]
): NormalizedCard[] {
  const byName = new Map<
    string,
    DlmCard
  >();

  for (const card of cards) {
    const name = toStringOrNull(card.name);

    if (!name) {
      continue;
    }

    const key = normalizeName(name);

    if (!key) {
      continue;
    }

    const current = byName.get(key);

    if (
      !current ||
      scoreCard(card) > scoreCard(current)
    ) {
      byName.set(key, card);
    }
  }

  return [...byName.values()]
    .map(normalizeCard)
    .filter(
      (card): card is NormalizedCard =>
        card !== null
    );
}

async function loadCatalog() {
  const speedRows: DlmCard[] = [];

  const rushRows: DlmCard[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const rows = await fetchPage(
      `${API_BASE}?sort=name&page=${page}&limit=${PAGE_SIZE}`
    );

    if (rows.length === 0) {
      break;
    }

    speedRows.push(...rows);

    console.log(
      `   listado completo página ${page}: ${rows.length} filas`
    );

    if (rows.length < PAGE_SIZE) {
      break;
    }
  }

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const rows = await fetchPage(
      `${API_BASE}?rush=true&sort=name&page=${page}&limit=${PAGE_SIZE}`
    );

    if (rows.length === 0) {
      break;
    }

    rushRows.push(...rows);

    console.log(
      `   Rush página ${page}: ${rows.length} filas`
    );

    if (rows.length < PAGE_SIZE) {
      break;
    }
  }

  return {
    speed: selectRepresentatives(
      speedRows.filter((row) => row.rush !== true)
    ),

    rush: selectRepresentatives(rushRows),
  };
}

function jsonEqual(
  left: unknown,
  right: unknown
): boolean {
  return (
    JSON.stringify(left ?? null) ===
    JSON.stringify(right ?? null)
  );
}

function desiredFields(
  card: NormalizedCard,
  format: "speed" | "rush",
  ygoproId: number | null
) {
  return {
    format,

    ygoproId,

    rarity: card.rarity,

    banlistStatus:
      format === "speed"
        ? card.banlistStatus
        : null,

    description: card.description,

    obtain: card.obtain,

    type: card.type,

    frameType: card.frameType,

    attribute: card.attribute,

    level: card.level,

    attack: card.attack,

    defense: card.defense,

    race: card.race,

    scale: card.scale,

    linkRating: card.linkRating,

    linkMarkers: card.linkMarkers,

    image: card.image,
  };
}

function fieldsChanged(
  existing: ExistingCard,
  desired: ReturnType<typeof desiredFields>
): boolean {
  const keys = Object.keys(
    desired
  ) as (keyof typeof desired)[];

  return keys.some((key) => {
    if (key === "obtain") {
      return !jsonEqual(
        existing[key],
        desired[key]
      );
    }

    if (key === "linkMarkers") {
      const desiredValue =
        desired[key] === Prisma.DbNull
          ? null
          : desired[key];

      return !jsonEqual(
        existing[key],
        desiredValue
      );
    }

    return existing[key] !== desired[key];
  });
}

function resolveYgoproId(
  existing: ExistingCard | undefined,
  desired: number | null,
  owners: Map<number, number>
): number | null {
  if (desired === null) {
    return existing?.ygoproId ?? null;
  }

  const owner = owners.get(desired);

  if (
    owner !== undefined &&
    owner !== existing?.id
  ) {
    return existing?.ygoproId ?? null;
  }

  return desired;
}

async function main() {
  console.log(
    "🃏 Sincronizando catálogo completo de Duel Links Meta…"
  );

  const { speed, rush } = await loadCatalog();

  console.log("");
  console.log(
    `📚 DLM: ${speed.length} nombres Speed · ${rush.length} nombres Rush`
  );

  const cards = (await prisma.card.findMany({
    select: {
      id: true,

      name: true,

      slug: true,

      format: true,

      ygoproId: true,

      rarity: true,

      banlistStatus: true,

      description: true,

      obtain: true,

      type: true,

      frameType: true,

      attribute: true,

      level: true,

      attack: true,

      defense: true,

      race: true,

      scale: true,

      linkRating: true,

      linkMarkers: true,

      image: true,
    },
  })) as ExistingCard[];

  const byExactName = new Map(
    cards.map((card) => [card.name, card])
  );

  const byNameKey = new Map<
    string,
    ExistingCard[]
  >();

  for (const card of cards) {
    const key = normalizeName(card.name);

    const list = byNameKey.get(key);

    if (list) {
      list.push(card);
    } else {
      byNameKey.set(key, [card]);
    }
  }

  const owners = new Map<number, number>();

  for (const card of cards) {
    if (card.ygoproId !== null) {
      owners.set(card.ygoproId, card.id);
    }
  }

  const usedSlugs = new Set(
    cards.map((card) =>
      card.slug.toLowerCase()
    )
  );

  const usedNames = new Set(
    cards.map((card) => card.name)
  );

  const speedNames = new Set(
    speed.map((card) => card.nameKey)
  );

  const updates: {
    card: ExistingCard;
    data: Prisma.CardUpdateInput;
  }[] = [];

  const creates: Prisma.CardCreateManyInput[] = [];

  let unchanged = 0;

  let skippedConflicts = 0;

  function findExisting(
    card: NormalizedCard
  ): ExistingCard | undefined {
    const exact = byExactName.get(card.name);

    if (exact) {
      return exact;
    }

    const candidates =
      byNameKey.get(card.nameKey) ?? [];

    return candidates.length === 1
      ? candidates[0]
      : undefined;
  }

  function planCard(
    card: NormalizedCard,
    format: "speed" | "rush"
  ) {
    const existing = findExisting(card);

    const ygoproId = resolveYgoproId(
      existing,
      card.konamiId,
      owners
    );

    const desired = desiredFields(
      card,
      format,
      ygoproId
    );

    if (existing) {
      if (fieldsChanged(existing, desired)) {
        updates.push({
          card: existing,

          data: desired,
        });

        if (ygoproId !== null) {
          owners.set(ygoproId, existing.id);
        }
      } else {
        unchanged += 1;
      }

      return;
    }

    if (usedNames.has(card.name)) {
      skippedConflicts += 1;

      return;
    }

    const slug = uniqueCardSlug(
      slugifyCardName(card.name),
      usedSlugs
    );

    creates.push({
      name: card.name,

      slug,

      ...desired,
    });

    usedNames.add(card.name);

    if (ygoproId !== null) {
      owners.set(ygoproId, -1);
    }
  }

  for (const card of speed) {
    planCard(card, "speed");
  }

  for (const card of rush) {
    if (speedNames.has(card.nameKey)) {
      continue;
    }

    planCard(card, "rush");
  }

  console.log(
    `✏️  Actualizaciones: ${updates.length} · Sin cambios: ${unchanged}`
  );

  console.log(
    `➕ Cartas nuevas: ${creates.length} · Conflictos omitidos: ${skippedConflicts}`
  );

  if (dryRun) {
    console.log(
      "🔍 Modo dry-run: no se escribió nada."
    );

    return;
  }

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
      batch.map(({ card, data }) =>
        prisma.card.update({
          where: {
            id: card.id,
          },

          data,
        })
      )
    );
  }

  for (
    let index = 0;
    index < creates.length;
    index += WRITE_BATCH_SIZE
  ) {
    const batch = creates.slice(
      index,
      index + WRITE_BATCH_SIZE
    );

    await prisma.card.createMany({
      data: batch,

      skipDuplicates: true,
    });
  }

  const [total, byFormat] = await Promise.all([
    prisma.card.count(),

    prisma.card.groupBy({
      by: ["format"],

      _count: {
        _all: true,
      },
    }),
  ]);

  console.log("");
  console.log(
    `✅ Catálogo sincronizado. Total: ${total} cartas`
  );

  for (const row of byFormat) {
    console.log(
      `   ${row.format}: ${row._count._all}`
    );
  }
}

main()
  .catch((error) => {
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
