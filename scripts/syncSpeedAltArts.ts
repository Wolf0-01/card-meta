import "dotenv/config";

import { prisma } from "../src/lib/prisma";

/**
 * Restaura en el catálogo Speed Duel las cartas que quedaron
 * marcadas como Rush por error e importa sus artes
 * alternativos oficiales desde Duel Links Meta.
 *
 * La API de DLM devuelve Speed y Rush en el mismo endpoint;
 * `?rush=false` está roto (solo devuelve 3 filas), así que se
 * pagina el listado completo y se descartan las filas Rush.
 *
 * Uso:
 *   npx tsx scripts/syncSpeedAltArts.ts
 *   npx tsx scripts/syncSpeedAltArts.ts "Cyber Dragon" "Dark Magician Girl"
 *   npx tsx scripts/syncSpeedAltArts.ts --all
 *   npx tsx scripts/syncSpeedAltArts.ts --dry-run
 */

const API_BASE =
  "https://www.duellinksmeta.com/api/v1/cards";

const PAGE_SIZE = 100;

const IMAGE_BASE =
  "https://s3.duellinksmeta.com/cards";

const DEFAULT_TARGETS = [
  "Cyber Dragon",
  "Dark Magician Girl",
  "Super Polymerization",
];

interface DlmCard {
  _id?: unknown;
  konamiID?: unknown;
  name?: unknown;
  alternateArt?: unknown;
  rush?: unknown;
  release?: unknown;
  rarity?: unknown;
  type?: unknown;
}

interface SpeedEntry {
  dlmId: string;
  konamiId: string | null;
  name: string;
  nameKey: string;
  alternateArt: boolean;
  release: string | null;
  rarity: string | null;
  type: string | null;
}

const args = process.argv.slice(2);

const dryRun = args.includes("--dry-run");

const syncAll = args.includes("--all");

const targetNames = args.filter(
  (arg) => !arg.startsWith("--")
);

const targets =
  targetNames.length > 0
    ? targetNames
    : DEFAULT_TARGETS;

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getString(value: unknown): string | null {
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

function getNumericId(
  value: string | null
): number | null {
  if (!value || !/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number(value);

  return Number.isSafeInteger(parsed)
    ? parsed
    : null;
}

function buildImageUrl(dlmId: string): string {
  return `${IMAGE_BASE}/${dlmId}_w420.webp`;
}

async function fetchPage(
  page: number
): Promise<DlmCard[]> {
  const url = `${API_BASE}?sort=name&page=${page}&limit=${PAGE_SIZE}`;

  const response = await fetch(url, {
    headers: {
      accept: "application/json",

      "user-agent":
        "card-meta-alt-art-sync/1.0",
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

  return payload as DlmCard[];
}

async function loadSpeedCards() {
  const byName = new Map<
    string,
    SpeedEntry[]
  >();

  let total = 0;

  for (let page = 1; ; page += 1) {
    const rows = await fetchPage(page);

    if (rows.length === 0) {
      break;
    }

    total += rows.length;

    for (const row of rows) {
      if (row.rush === true) {
        continue;
      }

      const dlmId = getString(row._id);

      const name = getString(row.name);

      if (!dlmId || !name) {
        continue;
      }

      const nameKey = normalizeName(name);

      if (!nameKey) {
        continue;
      }

      const entry: SpeedEntry = {
        dlmId,
        konamiId: getString(row.konamiID),
        name,
        nameKey,
        alternateArt:
          row.alternateArt === true,
        release: getString(row.release),
        rarity: getString(row.rarity),
        type: getString(row.type),
      };

      const list = byName.get(nameKey);

      if (list) {
        list.push(entry);
      } else {
        byName.set(nameKey, [entry]);
      }
    }

    console.log(
      `   página ${page}: ${rows.length} filas (Speed acumuladas: ${total})`
    );

    if (rows.length < PAGE_SIZE) {
      break;
    }
  }

  return { byName, total };
}

function sortEntries(
  entries: SpeedEntry[]
): SpeedEntry[] {
  return [...entries].sort((a, b) => {
    if (a.alternateArt !== b.alternateArt) {
      return a.alternateArt ? 1 : -1;
    }

    const releaseA = a.release ?? "";
    const releaseB = b.release ?? "";

    if (releaseA !== releaseB) {
      return releaseA.localeCompare(releaseB);
    }

    return a.dlmId.localeCompare(b.dlmId);
  });
}

async function main() {
  console.log(
    "🎨 Sincronizando artes Speed desde Duel Links Meta…"
  );

  const { byName, total } =
    await loadSpeedCards();

  console.log("");
  console.log(
    `📚 Filas DLM leídas: ${total} · nombres Speed únicos: ${byName.size}`
  );

  const namesToSync = syncAll
    ? [...byName.keys()]
    : targets.map(normalizeName);

  if (namesToSync.length === 0) {
    console.log(
      "⚠️  No hay nombres que sincronizar."
    );

    return;
  }

  const cards = await prisma.card.findMany({
    select: {
      id: true,
      name: true,
      format: true,
      ygoproId: true,
      image: true,
    },
  });

  const cardByName = new Map(
    cards.map((card) => [
      normalizeName(card.name),
      card,
    ])
  );

  const ygoproOwners = new Map<
    number,
    { id: number; name: string }
  >();

  for (const card of cards) {
    if (card.ygoproId !== null) {
      ygoproOwners.set(card.ygoproId, {
        id: card.id,
        name: card.name,
      });
    }
  }

  let updatedCards = 0;
  let upsertedArts = 0;
  let skipped = 0;

  for (const nameKey of namesToSync) {
    const entries = byName.get(nameKey);

    if (!entries || entries.length === 0) {
      console.log(
        `   ⚠️  ${nameKey}: sin resultados Speed en DLM`
      );

      skipped += 1;

      continue;
    }

    const card = cardByName.get(nameKey);

    if (!card) {
      console.log(
        `   ⚠️  ${nameKey}: no existe en la base de datos`
      );

      skipped += 1;

      continue;
    }

    const ordered = sortEntries(entries);

    const base =
      ordered.find((entry) => !entry.alternateArt) ??
      ordered[0];

    const baseKonamiId = getNumericId(
      base.konamiId
    );

    const owner =
      baseKonamiId !== null
        ? ygoproOwners.get(baseKonamiId)
        : undefined;

    const ygoproId =
      baseKonamiId !== null &&
      (!owner || owner.id === card.id)
        ? baseKonamiId
        : card.ygoproId;

    console.log("");
    console.log(
      `   ${card.name}: ${ordered.length} arte(s) · formato ${card.format} → speed`
    );

    console.log(
      `      base ${base.dlmId} · ygoproId ${card.ygoproId} → ${ygoproId}`
    );

    if (!dryRun) {
      await prisma.card.update({
        where: { id: card.id },

        data: {
          format: "speed",
          ygoproId,
          image: buildImageUrl(base.dlmId),
        },
      });
    }

    updatedCards += 1;

    for (const entry of ordered) {
      if (!dryRun) {
        await prisma.cardAltArt.upsert({
          where: { dlmId: entry.dlmId },

          create: {
            cardId: card.id,
            dlmId: entry.dlmId,
            konamiId: entry.konamiId,
            image: buildImageUrl(entry.dlmId),
            isDefault: !entry.alternateArt,
          },

          update: {
            cardId: card.id,
            konamiId: entry.konamiId,
            image: buildImageUrl(entry.dlmId),
            isDefault: !entry.alternateArt,
          },
        });
      }

      upsertedArts += 1;
    }
  }

  console.log("");
  console.log(
    `✅ Cartas corregidas: ${updatedCards} · artes sincronizados: ${upsertedArts} · omitidas: ${skipped}`
  );

  if (dryRun) {
    console.log(
      "🔍 Modo dry-run: no se escribió nada."
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
