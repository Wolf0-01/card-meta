import "dotenv/config";

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { prisma } from "../src/lib/prisma";

import { slugifySetName } from "../src/lib/setSlug";

const SITE_BASE = "https://www.duellinksmeta.com";

const BANNER_BASE = "https://s3.duellinksmeta.com";

const SETS_API = `${SITE_BASE}/api/v1/sets`;

const PAGE_SIZE = 1000;

const MAX_PAGES = 20;

const CACHE_DIR = path.join(
  os.tmpdir(),
  "card-meta"
);

const CACHE_FILE = path.join(
  CACHE_DIR,
  "duel-links-sets.json"
);

const UPSERT_CHUNK_SIZE = 100;

interface DlmSet {
  name?: unknown;

  type?: unknown;

  bannerImage?: unknown;

  linkedArticle?: {
    url?: unknown;
  } | null;
}

interface DlmSetEntry {
  name: string;

  slug: string;

  bannerUrl: string | null;
}

interface DesiredSet {
  slug: string;

  name: string;

  bannerUrl: string | null;
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
    `   Fuente: ${options.input ?? SETS_API}`
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

    const current = entries.get(slug);

    if (!current) {
      entries.set(slug, {
        name,
        slug,
        bannerUrl,
      });

      continue;
    }

    if (!current.bannerUrl && bannerUrl) {
      entries.set(slug, {
        name,
        slug,
        bannerUrl,
      });
    }
  }

  return [...entries.values()];
}

async function fetchDlmSets(
  page: number,
  attempt = 1
): Promise<DlmSet[]> {
  const url = `${SETS_API}?page=${page}&limit=${PAGE_SIZE}`;

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json",

        "user-agent":
          "card-meta-set-banner-sync/1.0",
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

      return fetchDlmSets(page, attempt + 1);
    }

    throw error;
  }

  if (!response.ok) {
    if (response.status >= 500 && attempt < 5) {
      console.warn(
        `   Reintentando página ${page} (${attempt}/4): HTTP ${response.status}`
      );

      await sleep(500 * attempt);

      return fetchDlmSets(page, attempt + 1);
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

async function loadDlmSets(): Promise<DlmSet[]> {
  if (options.input) {
    console.log(
      `📂 Leyendo snapshot local: ${options.input}`
    );

    return readSetsFile(options.input);
  }

  console.log(
    "🌐 Descargando catálogo completo de sets y banners..."
  );

  const sets: DlmSet[] = [];

  for (
    let page = 1;
    page <= MAX_PAGES;
    page++
  ) {
    const payload = await fetchDlmSets(page);

    if (payload.length === 0) {
      break;
    }

    sets.push(...payload);

    console.log(
      `   Página ${page}: ${payload.length} sets (${sets.length} acumulados).`
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

  fs.mkdirSync(CACHE_DIR, {
    recursive: true,
  });

  fs.writeFileSync(
    CACHE_FILE,
    JSON.stringify(
      {
        source: SETS_API,

        fetchedAt: new Date().toISOString(),

        sets,
      },
      null,
      2
    )
  );

  console.log(
    `💾 Snapshot guardado en ${CACHE_FILE}`
  );

  return sets;
}

function readSetsFile(
  filePath: string
): DlmSet[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `No existe el archivo: ${filePath}`
    );
  }

  const parsed = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  ) as
    | DlmSet[]
    | {
        sets?: DlmSet[];
      };

  const sets = Array.isArray(parsed)
    ? parsed
    : parsed.sets;

  if (!sets) {
    throw new Error(
      "El archivo debe ser un array o contener una propiedad sets."
    );
  }

  return sets;
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

  const dlmSets = await loadDlmSets();

  const dlmEntries =
    buildDlmEntries(dlmSets);

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

  for (const item of desired) {
    const current = existing.get(item.slug);

    if (!current) {
      creates.push(item);

      continue;
    }

    if (
      current.name !== item.name ||
      current.bannerUrl !== item.bannerUrl
    ) {
      updates.push(item);
    }
  }

  const unchanged =
    desired.length -
    creates.length -
    updates.length;

  const withBanner = desired.filter(
    (item) => item.bannerUrl !== null
  ).length;

  printSummary({
    dlmSets: dlmSets.length,

    dlmEntries: dlmEntries.length,

    databaseSets: databaseNames.length,

    desired: desired.length,

    creates: creates.length,

    updates: updates.length,

    unchanged,

    withBanner,
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
          },

          create: {
            slug: item.slug,

            name: item.name,

            bannerUrl: item.bannerUrl,
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
  dlmSets: number;

  dlmEntries: number;

  databaseSets: number;

  desired: number;

  creates: number;

  updates: number;

  unchanged: number;

  withBanner: number;
}) {
  console.log("\n====== Resumen ======");

  console.log(
    `Sets en la API de DLM: ${stats.dlmSets}`
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
