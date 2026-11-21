import "dotenv/config";

import type { Prisma } from "@prisma/client";

import { prisma } from "../src/lib/prisma";

/**
 * Sincroniza el catálogo de Skills con Duel Links Meta.
 *
 * La API pública expone el nombre, la descripción y el
 * indicador `rush`, que se normaliza a "speed" | "rush".
 * `SkillMeta.id` conserva el `_id` estable de DLM para que
 * las actualizaciones sean idempotentes.
 */
const API_URL =
  "https://www.duellinksmeta.com/api/v1/skills";

const PAGE_SIZE = 1000;

const MAX_PAGES = 25;

const WRITE_BATCH_SIZE = 50;

const REQUEST_FIELDS =
  "name,description,rush";

const dryRun = process.argv.includes("--dry-run");

interface DlmSkill {
  _id?: unknown;

  name?: unknown;

  description?: unknown;

  rush?: unknown;
}

interface SkillRecord {
  id: string;

  name: string;

  description: string;

  format: "speed" | "rush";
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function fetchPage(
  page: number,
  attempt = 1
): Promise<DlmSkill[]> {
  const params = new URLSearchParams({
    page: String(page),

    limit: String(PAGE_SIZE),

    fields: REQUEST_FIELDS,
  });

  let response: Response;

  try {
    response = await fetch(
      `${API_URL}?${params.toString()}`,
      {
        headers: {
          accept: "application/json",

          "user-agent":
            "card-meta-skills-sync/1.0",
        },
      }
    );
  } catch (error) {
    if (attempt < 4) {
      console.warn(
        `   Reintentando página ${page} (${attempt}/3): ${String(
          error
        )}`
      );

      await sleep(500 * attempt);

      return fetchPage(page, attempt + 1);
    }

    throw error;
  }

  if (!response.ok) {
    if (response.status >= 500 && attempt < 4) {
      console.warn(
        `   Reintentando página ${page} (${attempt}/3): HTTP ${response.status}`
      );

      await sleep(500 * attempt);

      return fetchPage(page, attempt + 1);
    }

    throw new Error(
      `DLM skills página ${page}: HTTP ${response.status}`
    );
  }

  const payload: unknown =
    await response.json();

  if (!Array.isArray(payload)) {
    throw new Error(
      `DLM skills página ${page}: respuesta no válida.`
    );
  }

  return payload as DlmSkill[];
}

function toSkillRecord(
  skill: DlmSkill
): SkillRecord | null {
  const id =
    typeof skill._id === "string"
      ? skill._id.trim()
      : "";

  const name =
    typeof skill.name === "string"
      ? skill.name.trim()
      : "";

  if (!id || !name) {
    return null;
  }

  return {
    id,

    name,

    description:
      typeof skill.description === "string"
        ? skill.description.trim()
        : "",

    format: skill.rush === true ? "rush" : "speed",
  };
}

async function loadSkills(): Promise<SkillRecord[]> {
  const records = new Map<string, SkillRecord>();

  for (
    let page = 1;
    page <= MAX_PAGES;
    page += 1
  ) {
    const rows = await fetchPage(page);

    if (rows.length === 0) {
      break;
    }

    for (const row of rows) {
      const record = toSkillRecord(row);

      if (record) {
        records.set(record.id, record);
      }
    }

    if (rows.length < PAGE_SIZE) {
      break;
    }
  }

  return [...records.values()];
}

function isSameSkill(
  a: SkillRecord,
  b: SkillRecord
) {
  return (
    a.name === b.name &&
    a.description === b.description &&
    a.format === b.format
  );
}

async function main() {
  console.log("✨ Sincronizando Skills y efectos…");

  const skills = await loadSkills();

  console.log(
    `📚 Skills recibidas de Duel Links Meta: ${skills.length}`
  );

  const existingRows =
    await prisma.skillMeta.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        format: true,
      },
    });

  const existing = new Map<
    string,
    SkillRecord
  >(
    existingRows.map((row) => [
      row.id,
      {
        id: row.id,
        name: row.name,
        description: row.description,
        format:
          row.format === "rush"
            ? "rush"
            : "speed",
      },
    ])
  );

  const created: SkillRecord[] = [];

  const updated: SkillRecord[] = [];

  let unchanged = 0;

  for (const skill of skills) {
    const current = existing.get(skill.id);

    if (!current) {
      created.push(skill);

      continue;
    }

    if (isSameSkill(current, skill)) {
      unchanged += 1;

      continue;
    }

    updated.push(skill);
  }

  console.log(
    `➕ Nuevas: ${created.length} · ✏️  Actualizadas: ${updated.length} · ♻️  Sin cambios: ${unchanged}`
  );

  if (dryRun) {
    console.log(
      "🔍 Modo dry-run: no se escribe nada. Usa sin --dry-run para aplicar."
    );

    return;
  }

  const writes = [...created, ...updated];

  for (
    let index = 0;
    index < writes.length;
    index += WRITE_BATCH_SIZE
  ) {
    const batch = writes.slice(
      index,
      index + WRITE_BATCH_SIZE
    );

    await Promise.all(
      batch.map((skill) => {
        const data: Prisma.SkillMetaCreateInput = {
          id: skill.id,

          name: skill.name,

          description: skill.description,

          format: skill.format,
        };

        return prisma.skillMeta.upsert({
          where: {
            id: skill.id,
          },

          create: data,

          update: {
            name: skill.name,

            description: skill.description,

            format: skill.format,
          },
        });
      })
    );

    console.log(
      `   Guardadas ${Math.min(
        index + WRITE_BATCH_SIZE,
        writes.length
      )}/${writes.length}`
    );
  }

  console.log(
    `✅ SkillMeta sincronizado: ${created.length} insertadas, ${updated.length} actualizadas, ${unchanged} sin cambios.`
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
