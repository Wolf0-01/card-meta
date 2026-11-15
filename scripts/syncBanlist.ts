import "dotenv/config";

import {
  normalizeBanlistStatus,
  type BanlistStatus,
} from "../src/lib/banlist";

import { prisma } from "../src/lib/prisma";

/**
 * Sincroniza la banlist de Duel Links (Speed Duel) desde
 * la API de Duel Links Meta.
 *
 * La API expone el estado real únicamente al filtrar por
 * `banStatus`, así que se hace una consulta por cada valor
 * oficial: Forbidden, Limited 1, Limited 2 y Limited 3.
 */
const API_BASE =
  "https://www.duellinksmeta.com/api/v1/cards";

const PAGE_SIZE = 1000;

const MAX_PAGES = 10;

const WRITE_BATCH_SIZE = 50;

const STATUS_QUERIES: {
  query: string;
  status: BanlistStatus;
}[] = [
  { query: "Forbidden", status: "forbidden" },
  { query: "Limited 1", status: "limited1" },
  { query: "Limited 2", status: "limited2" },
  { query: "Limited 3", status: "limited3" },
];

const STATUS_PRIORITY: Record<
  BanlistStatus,
  number
> = {
  forbidden: 4,
  limited1: 3,
  limited2: 2,
  limited3: 1,
};

interface DlmBanlistCard {
  name?: unknown;

  konamiID?: unknown;
}

const apply = !process.argv.includes(
  "--dry-run"
);

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

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function fetchPage(
  query: string,
  page: number,
  attempt = 1
): Promise<DlmBanlistCard[]> {
  const url = `${API_BASE}?banStatus=${encodeURIComponent(
    query
  )}&sort=name&page=${page}&limit=${PAGE_SIZE}`;

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        accept: "application/json",

        "user-agent":
          "card-meta-banlist-sync/1.0",
      },
    });
  } catch (error) {
    if (attempt < 5) {
      console.warn(
        `   Reintentando ${query} página ${page} (${attempt}/4): ${String(
          error
        )}`
      );

      await sleep(500 * attempt);

      return fetchPage(
        query,
        page,
        attempt + 1
      );
    }

    throw error;
  }

  if (!response.ok) {
    if (response.status >= 500 && attempt < 5) {
      console.warn(
        `   Reintentando ${query} página ${page} (${attempt}/4): HTTP ${response.status}`
      );

      await sleep(500 * attempt);

      return fetchPage(
        query,
        page,
        attempt + 1
      );
    }

    throw new Error(
      `DLM ${query} página ${page}: HTTP ${response.status}`
    );
  }

  const payload = (await response.json()) as unknown;

  if (!Array.isArray(payload)) {
    throw new Error(
      `DLM ${query} página ${page}: respuesta no válida.`
    );
  }

  return payload as DlmBanlistCard[];
}

function keepHigherPriority(
  current: BanlistStatus | undefined,
  next: BanlistStatus
): BanlistStatus {
  if (!current) {
    return next;
  }

  return STATUS_PRIORITY[next] >
    STATUS_PRIORITY[current]
    ? next
    : current;
}

async function loadBanlist() {
  const byKonamiId = new Map<
    string,
    BanlistStatus
  >();

  const byName = new Map<string, BanlistStatus>();

  const totals: Record<BanlistStatus, number> = {
    forbidden: 0,
    limited1: 0,
    limited2: 0,
    limited3: 0,
  };

  for (const { query, status } of STATUS_QUERIES) {
    let fetched = 0;

    for (
      let page = 1;
      page <= MAX_PAGES;
      page += 1
    ) {
      const rows = await fetchPage(
        query,
        page
      );

      if (rows.length === 0) {
        break;
      }

      fetched += rows.length;

      for (const row of rows) {
        const konamiId = getKonamiId(
          row.konamiID
        );

        if (konamiId) {
          byKonamiId.set(
            konamiId,
            keepHigherPriority(
              byKonamiId.get(konamiId),
              status
            )
          );
        }

        const name =
          typeof row.name === "string"
            ? row.name
            : "";

        const normalized = normalizeName(name);

        if (normalized) {
          byName.set(
            normalized,
            keepHigherPriority(
              byName.get(normalized),
              status
            )
          );
        }
      }

      if (rows.length < PAGE_SIZE) {
        break;
      }
    }

    totals[status] = fetched;

    console.log(
      `   ${query}: ${fetched} entradas`
    );
  }

  return {
    byKonamiId,
    byName,
    totals,
  };
}

async function main() {
  console.log("🃏 Sincronizando banlist de Duel Links…");

  const {
    byKonamiId,
    byName,
    totals,
  } = await loadBanlist();

  const cards = await prisma.card.findMany({
    select: {
      id: true,

      name: true,

      ygoproId: true,

      format: true,

      banlistStatus: true,
    },
  });

  const updates: {
    id: number;
    from: BanlistStatus | null;
    to: BanlistStatus | null;
  }[] = [];

  for (const card of cards) {
    /*
     * Rush Duel no usa esta banlist. Se limpia cualquier
     * valor heredado para no mostrar iconos incorrectos.
     */
    const desired =
      card.format === "rush"
        ? null
        : (card.ygoproId !== null
            ? byKonamiId.get(
                String(card.ygoproId)
              )
            : undefined) ??
          byName.get(normalizeName(card.name)) ??
          null;

    const current = normalizeBanlistStatus(
      card.banlistStatus
    );

    if (desired !== current) {
      updates.push({
        id: card.id,
        from: current,
        to: desired,
      });
    }
  }

  console.log("");
  console.log(
    `📚 Cartas locales: ${cards.length}`
  );

  console.log(
    `🎯 Coincidencias en la API: ${
      byKonamiId.size
    } por Konami ID, ${byName.size} por nombre`
  );

  console.log(
    `✏️  Cambios pendientes: ${updates.length}`
  );

  if (!apply) {
    console.log(
      "🔍 Modo dry-run: no se escribe nada. Usa sin --dry-run para aplicar."
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
      batch.map((update) =>
        prisma.card.update({
          where: {
            id: update.id,
          },

          data: {
            banlistStatus: update.to,
          },
        })
      )
    );
  }

  console.log(
    `✅ Banlist aplicada a ${updates.length} cartas.`
  );

  console.log(
    `   Forbidden: ${totals.forbidden} · Limited 1: ${totals.limited1} · Limited 2: ${totals.limited2} · Limited 3: ${totals.limited3}`
  );
}

main()
  .catch((error) => {
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
