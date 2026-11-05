import { prisma } from "@/lib/prisma";

interface DeckCardInput {
  id: number;
  quantity?: number;
  zone?: string;
}

interface ArchetypeCounter {
  [name: string]: number;
}

/*
 * Cuenta cuántas cartas pertenecen a cada arquetipo.
 */
export async function countArchetypes(
  cards: DeckCardInput[]
) {
  if (cards.length === 0) {
    return {};
  }

  const ids = cards.map(card => card.id);

  const dbCards = await prisma.card.findMany({
    where: {
      id: {
        in: ids
      }
    },
    select: {
      id: true,
      archetype: true
    }
  });

  const counter: ArchetypeCounter = {};

  for (const card of dbCards) {
    if (!card.archetype) {
      continue;
    }

    counter[card.archetype] =
      (counter[card.archetype] ?? 0) + 1;
  }

  return counter;
}

/*
 * Devuelve el nombre del arquetipo dominante.
 */
export function getDominantArchetype(
  counter: ArchetypeCounter
) {
  const entries = Object.entries(counter);

  if (entries.length === 0) {
    return null;
  }

  entries.sort((a, b) => b[1] - a[1]);

  return entries[0][0];
}

/*
 * Busca el arquetipo en la base de datos.
 */
export async function findArchetype(
  name: string
) {
  return prisma.archetype.findFirst({
    where: {
      OR: [
        {
          name: {
            equals: name,
            mode: "insensitive"
          }
        },
        {
          slug: {
            equals: name
              .toLowerCase()
              .replace(/\s+/g, "-"),
            mode: "insensitive"
          }
        }
      ]
    }
  });
}

/*
 * Función principal.
 */
export async function detectArchetype(
  cards: DeckCardInput[]
) {
  const counter =
    await countArchetypes(cards);

  const winner =
    getDominantArchetype(counter);

  if (!winner) {
    return null;
  }

  return findArchetype(winner);
}