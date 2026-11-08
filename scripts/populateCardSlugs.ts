import "dotenv/config";

import { prisma } from "../src/lib/prisma";

import {
  slugifyCardName,
  uniqueCardSlug,
} from "../src/lib/cardSlug";

const CHUNK_SIZE = 500;

interface PlannedSlug {
  id: number;

  slug: string;
}

async function main() {
  const cards = await prisma.card.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },

    orderBy: {
      id: "asc",
    },
  });

  const used = new Set<string>();

  const planned: PlannedSlug[] = [];

  for (const card of cards) {
    const base =
      slugifyCardName(card.name) ||
      `card-${card.id}`;

    const slug = uniqueCardSlug(
      base,
      used
    );

    if (slug !== card.slug) {
      planned.push({
        id: card.id,
        slug,
      });
    }
  }

  console.log(
    `📚 Cartas revisadas: ${cards.length}`
  );

  console.log(
    `🔗 Slugs a actualizar: ${planned.length}`
  );

  if (planned.length === 0) {
    return;
  }

  /*
   * Fase 1: mover los slugs afectados a valores temporales
   * para evitar colisiones con el índice único al renombrar.
   */
  for (
    let index = 0;
    index < planned.length;
    index += CHUNK_SIZE
  ) {
    const chunk = planned.slice(
      index,
      index + CHUNK_SIZE
    );

    await Promise.all(
      chunk.map((item) =>
        prisma.card.update({
          where: {
            id: item.id,
          },

          data: {
            slug: `__slug_tmp_${item.id}`,
          },
        })
      )
    );
  }

  /*
   * Fase 2: escribir los slugs definitivos.
   */
  for (
    let index = 0;
    index < planned.length;
    index += CHUNK_SIZE
  ) {
    const chunk = planned.slice(
      index,
      index + CHUNK_SIZE
    );

    await Promise.all(
      chunk.map((item) =>
        prisma.card.update({
          where: {
            id: item.id,
          },

          data: {
            slug: item.slug,
          },
        })
      )
    );

    console.log(
      `✅ ${Math.min(
        index + CHUNK_SIZE,
        planned.length
      )}/${planned.length}`
    );
  }
}

main()
  .then(async () => {
    console.log("🎉 Slugs poblados correctamente.");

    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(
      "❌ Error poblando slugs:",
      error
    );

    await prisma.$disconnect();

    process.exit(1);
  });
