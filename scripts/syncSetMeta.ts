import "dotenv/config";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { prisma } from "../src/lib/prisma";

import { slugifySetName } from "../src/lib/setSlug";

const SITE_BASE = "https://www.duellinksmeta.com";

const BANNER_BASE = "https://s3.duellinksmeta.com";

const SETS_API = `${SITE_BASE}/api/v1/sets`;

const RUSH_SETS_API = `${SETS_API}?rush=true`;

const PAGE_SIZE = 1000;

const MAX_PAGES = 20;

const CACHE_VERSION = 2;

const CACHE_DIR = path.join(
  os.tmpdir(),
  "card-meta"
);

const CACHE_FILE = path.join(
  CACHE_DIR,
  "duel-links-sets.json"
);

const UPSERT_CHUNK_SIZE = 100;

/**
 * Dominio del que proceden los banners automáticos de
 * Duel Links Meta. Cualquier otra URL se considera una
 * edición manual y nunca se sobrescribe.
 */
const MANAGED_BANNER_HOST = "s3.duellinksmeta.com";

/**
 * Marca opcional para proteger manualmente una URL que
 * sí pertenece al dominio de S3 (por ejemplo, un banner
 * alternativo de DLM elegido a mano desde Prisma Studio).
 *
 * Ejemplo:
 *   https://s3.duellinksmeta.com/img/.../banner.jpg#manual
 *
 * El fragmento no se envía al servidor, así que la imagen
 * sigue cargando con normalidad.
 */
const MANUAL_BANNER_MARKER = "#manual";

interface DlmSet {
  name?: unknown;

  type?: unknown;

  release?: unknown;

  bannerImage?: unknown;

  linkedArticle?: {
    url?: unknown;
  } | null;
}

interface DlmSetEntry {
  name: string;

  slug: string;

  bannerUrl: string | null;

  releasedAt: Date | null;
}

interface DlmSetsSnapshot {
  sets?: DlmSet[];

  rushSets?: DlmSet[];
}

interface DesiredSet {
  slug: string;

  name: string;

  bannerUrl: string | null;

  releasedAt: Date | null;
}

interface DbSetRow {
  name: string;
}

interface CliOptions {
  apply: boolean;

  input?: string;

  limit?: number;
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
    "🖼️  Sincronizador de banners de sets"
  );

  console.log(
    `   Modo: ${options.apply ? "APLICAR" : "DRY RUN"}`
  );

  console.log(
    `   Fuente: ${
      options.input ??
      `${SETS_API} + ${RUSH_SETS_API}`
    }`
  );

  console.log(
    "   Banners manuales: se conservan (fuera de s3.duellinksmeta.com o con #manual)"
  );

  if (options.limit) {
    console.log(
      `   Límite de escritura: ${options.limit} sets`
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

function parseReleaseDate(
  value: unknown
): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function resolveBannerUrl(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    return new URL(
      trimmed,
      BANNER_BASE
    ).toString();
  } catch {
    return null;
  }
}

/**
 * Indica si el banner actual lo gestiona el script.
 *
 * Se conserva (devuelve false) cuando:
 * - la URL no apunta a s3.duellinksmeta.com, o
 * - la URL incluye la marca `#manual`, o
 * - la URL no es válida.
 *
 * Un banner vacío se puede rellenar sin problema.
 */
function isManagedBannerUrl(
  value: string | null
): boolean {
  if (!value || !value.trim()) {
    return true;
  }

  if (
    value
      .toLowerCase()
      .includes(MANUAL_BANNER_MARKER)
  ) {
    return false;
  }

  try {
    const { hostname } = new URL(value);

    return (
      hostname === MANAGED_BANNER_HOST ||
      hostname.endsWith(
        `.${MANAGED_BANNER_HOST}`
      )
    );
  } catch {
    return false;
  }
}

function buildDlmEntries(
  sets: DlmSet[]
): DlmSetEntry[] {
  const entries = new Map<
    string,
    DlmSetEntry
  >();

  for (const raw of sets) {
    const name =
      typeof raw.name === "string"
        ? raw.name.trim()
        : "";

    if (!name) {
      continue;
    }

    const slug = slugifySetName(name);

    if (!slug) {
      continue;
    }

    const bannerUrl = resolveBannerUrl(
      raw.bannerImage
    );

    const releasedAt = parseReleaseDate(
      raw.release
    );

    const current = entries.get(slug);

    if (!current) {
      entries.set(slug, {
        name,
        slug,
        bannerUrl,
        releasedAt,
      });

      continue;
    }

    const nextBannerUrl =
      current.bannerUrl ?? bannerUrl;

    const nextReleasedAt =
      current.releasedAt ?? releasedAt;

    if (
      nextBannerUrl !== current.bannerUrl ||
      nextReleasedAt !== current.releasedAt
    ) {
      entries.set(slug, {
        name,
        slug,
        bannerUrl: nextBannerUrl,
        releasedAt: nextReleasedAt,
      });
    }
  }

  return [...entries.values()];
}

async function fetchDlmSets(
  page: number,
  rush: boolean,
  attempt = 1
): Promise<DlmSet[]> {
  const url = rush
    ? `${RUSH_SETS_API}&page=${page}&limit=${PAGE_SIZE}`
    : `${SETS_API}?page=${page}&limit=${PAGE_SIZE}`;

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json",

        "user-agent":
          "card-meta-set-banner-sync/2.0",
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

      return fetchDlmSets(page, rush, attempt + 1);
    }

    throw error;
  }

  if (!response.ok) {
    if (response.status >= 500 && attempt < 5) {
      console.warn(
        `   Reintentando página ${page} (${attempt}/4): HTTP ${response.status}`
      );

      await sleep(500 * attempt);

      return fetchDlmSets(page, rush, attempt + 1);
    }

    throw new Error(
      `DLM sets página ${page}: HTTP ${response.status}`
    );
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    throw new Error(
      `DLM sets página ${page}: respuesta no válida.`
    );
  }

  return payload as DlmSet[];
}

async function fetchAllDlmSets(
  rush: boolean
): Promise<DlmSet[]> {
  const sets: DlmSet[] = [];

  for (
    let page = 1;
    page <= MAX_PAGES;
    page++
  ) {
    const payload = await fetchDlmSets(
      page,
      rush
    );

    if (payload.length === 0) {
      break;
    }

    sets.push(...payload);

    console.log(
      `   ${rush ? "Rush" : "General"} página ${page}: ${payload.length} sets (${sets.length} acumulados).`
    );

    if (payload.length < PAGE_SIZE) {
      break;
    }

    if (sets.length > 5000) {
      throw new Error(
        "Se superó el límite de seguridad de 5.000 sets."
      );
    }

    await sleep(50);
  }

  return sets;
}

async function loadDlmSets(): Promise<{
  general: DlmSet[];

  rush: DlmSet[];
}> {
  if (options.input) {
    console.log(
      `📂 Leyendo snapshot local: ${options.input}`
    );

    return readSetsFile(options.input);
  }

  console.log(
    "🌐 Descargando catálogo completo de sets y banners (general + Rush)..."
  );

  const general = await fetchAllDlmSets(false);

  const rush = await fetchAllDlmSets(true);

  fs.mkdirSync(CACHE_DIR, {
    recursive: true,
  });

  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify(
      {
        version: CACHE_VERSION,

        source: SETS_API,

        rushSource: RUSH_SETS_API,

        fetchedAt: new Date().toISOString(),

        sets: general,

        rushSets: rush,
      },
      null,
      2
    )
  );

  console.log(
    `💾 Snapshot guardado en ${CACHE_FILE}`
  );

  return {
    general,
    rush,
  };
}

function readSetsFile(
  filePath: string
): {
  general: DlmSet[];

  rush: DlmSet[];
} {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `No existe el archivo: ${filePath}`
    );
  }

  const parsed = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as DlmSet[] | DlmSetsSnapshot;

  if (Array.isArray(parsed)) {
    return {
      general: parsed,

      rush: [],
    };
  }

  const general = parsed.sets;

  const rush = parsed.rushSets;

  if (!general && !rush) {
    throw new Error(
      "El archivo debe ser un array o contener las propiedades sets y/o rushSets."
    );
  }

  return {
    general: general ?? [],

    rush: rush ?? [],
  };
}

async function loadDatabaseSetNames(): Promise<
  string[]
> {
  const rows = await prisma.$queryRaw<
    DbSetRow[]
  >`
    SELECT DISTINCT elem->>'name' AS name
    FROM "Card" AS c
    CROSS JOIN LATERAL jsonb_array_elements(c."obtain") AS elem
    WHERE c."obtain" IS NOT NULL
      AND jsonb_typeof(c."obtain") = 'array'
      AND NULLIF(elem->>'name', '') IS NOT NULL
    ORDER BY 1 ASC
  `;

  return rows.map((row) => row.name);
}

function buildDesiredSets(
  dlmEntries: DlmSetEntry[],
  databaseNames: string[]
): DesiredSet[] {
  const bySlug = new Map(
    dlmEntries.map((entry) => [
      entry.slug,
      entry,
    ])
  );

  const byName = new Map<
    string,
    DlmSetEntry
  >();

  for (const entry of dlmEntries) {
    const key = normalizeName(entry.name);

    if (key && !byName.has(key)) {
      byName.set(key, entry);
    }
  }

  const desired = new Map<
    string,
    DesiredSet
  >();

  const matchedDlmSlugs = new Set<string>();

  /*
   * Priorizamos los sets que ya existen en las cartas
   * (campo obtain) para que el slug de SetMeta coincida
   * siempre con el de /articles/sets/[slug].
   */
  for (const rawName of databaseNames) {
    const name = rawName.trim();

    if (!name) {
      continue;
    }

    const slug = slugifySetName(name);

    const dlm =
      bySlug.get(slug) ??
      byName.get(normalizeName(name));

    if (dlm) {
      matchedDlmSlugs.add(dlm.slug);
    }

    const current = desired.get(slug);

    desired.set(slug, {
      slug,

      name: current?.name ?? name,

      bannerUrl:
        dlm?.bannerUrl ??
        current?.bannerUrl ??
        null,

      releasedAt:
        dlm?.releasedAt ??
        current?.releasedAt ??
        null,
    });
  }

  /*
   * Cualquier caja nueva publicada por Konami en la API
   * se registra automáticamente aunque todavía no tenga
   * cartas sincronizadas en la base de datos local.
   */
  for (const entry of dlmEntries) {
    if (matchedDlmSlugs.has(entry.slug)) {
      continue;
    }

    if (!desired.has(entry.slug)) {
      desired.set(entry.slug, {
        ...entry,
      });
    }
  }

  return [...desired.values()].sort((a, b) =>
    a.slug.localeCompare(b.slug, "en")
  );
}

async function main() {
  logOptions();

  const { general, rush } = await loadDlmSets();

  const allSets = [...general, ...rush];

  const dlmEntries =
    buildDlmEntries(allSets);

  const databaseNames =
    await loadDatabaseSetNames();

  const desired =
    buildDesiredSets(
      dlmEntries,
      databaseNames
    );

  const existingRows =
    await prisma.setMeta.findMany({
      select: {
        slug: true,

        name: true,

        bannerUrl: true,

        releasedAt: true,
      },
    });

  const existing = new Map(
    existingRows.map((row) => [
      row.slug,
      row,
    ])
  );

  const creates: DesiredSet[] = [];

  const updates: DesiredSet[] = [];

  /* Banners editados a mano que el script debe respetar. */
  const protectedBanners: string[] = [];

  for (const item of desired) {
    const current = existing.get(item.slug);

    if (!current) {
      creates.push(item);

      continue;
    }

    const keepManualBanner =
      !isManagedBannerUrl(current.bannerUrl);

    const nextBannerUrl = keepManualBanner
      ? current.bannerUrl
      : item.bannerUrl;

    const nextReleasedAt =
      item.releasedAt ?? current.releasedAt;

    if (
      keepManualBanner &&
      current.bannerUrl !== item.bannerUrl
    ) {
      protectedBanners.push(item.slug);
    }

    if (
      current.name === item.name &&
      current.bannerUrl === nextBannerUrl &&
      current.releasedAt?.getTime() ===
        nextReleasedAt?.getTime()
    ) {
      continue;
    }

    updates.push({
      ...item,

      bannerUrl: nextBannerUrl,

      releasedAt: nextReleasedAt,
    });
  }

  const unchanged =
    desired.length -
    creates.length -
    updates.length;

  const withBanner = desired.filter(
    (item) => item.bannerUrl !== null
  ).length;

  printSummary({
    generalSets: general.length,

    rushSets: rush.length,

    dlmEntries: dlmEntries.length,

    databaseSets: databaseNames.length,

    desired: desired.length,

    creates: creates.length,

    updates: updates.length,

    unchanged,

    withBanner,

    protectedBanners:
      protectedBanners.length,
  });

  const pending = options.limit
    ? [...creates, ...updates].slice(
        0,
        options.limit
      )
    : [...creates, ...updates];

  if (pending.length > 0) {
    console.log(
      "\nMuestra de cambios:"
    );

    for (const item of pending.slice(0, 10)) {
      console.log(
        `   • ${item.slug} → ${
          item.bannerUrl ?? "(sin banner)"
        }`
      );
    }
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
      "\n✅ SetMeta ya está sincronizado."
    );

    return;
  }

  console.log(
    `\n💾 Aplicando ${pending.length} upserts en lotes de ${UPSERT_CHUNK_SIZE}...`
  );

  let processed = 0;

  for (
    let index = 0;
    index < pending.length;
    index += UPSERT_CHUNK_SIZE
  ) {
    const chunk = pending.slice(
      index,
      index + UPSERT_CHUNK_SIZE
    );

    await Promise.all(
      chunk.map((item) =>
        prisma.setMeta.upsert({
          where: {
            slug: item.slug,
          },

          update: {
            name: item.name,

            bannerUrl: item.bannerUrl,

            releasedAt: item.releasedAt,
          },

          create: {
            slug: item.slug,

            name: item.name,

            bannerUrl: item.bannerUrl,

            releasedAt: item.releasedAt,
          },
        })
      )
    );

    processed += chunk.length;

    console.log(
      `✅ ${Math.min(
        processed,
        pending.length
      )}/${pending.length}`
    );
  }

  console.log(
    `\n✅ SetMeta sincronizado: ${processed} filas escritas.`
  );
}

function printSummary(stats: {
  generalSets: number;

  rushSets: number;

  dlmEntries: number;

  databaseSets: number;

  desired: number;

  creates: number;

  updates: number;

  unchanged: number;

  withBanner: number;

  protectedBanners: number;
}) {
  console.log("\n====== Resumen ======");

  console.log(
    `Sets del endpoint general: ${stats.generalSets}`
  );

  console.log(
    `Sets del endpoint Rush: ${stats.rushSets}`
  );

  console.log(
    `Sets únicos DLM (por slug): ${stats.dlmEntries}`
  );

  console.log(
    `Sets en obtain (base local): ${stats.databaseSets}`
  );

  console.log(
    `Filas SetMeta esperadas: ${stats.desired}`
  );

  console.log(
    `Con banner: ${stats.withBanner}`
  );

  console.log(
    `Nuevas: ${stats.creates}`
  );

  console.log(
    `Actualizadas: ${stats.updates}`
  );

  console.log(
    `Sin cambios: ${stats.unchanged}`
  );

  console.log(
    `Banners manuales protegidos: ${stats.protectedBanners}`
  );
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
      "❌ Error sincronizando SetMeta:",
      error
    );

    await prisma.$disconnect();

    process.exit(1);
  });
