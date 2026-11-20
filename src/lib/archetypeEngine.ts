import { prisma } from "@/lib/prisma";

import {
  matchArchetypesInText,
  suggestArchetypeName,
} from "@/lib/decks/archetypeSuggestion";

import { fetchDlmSkillByName } from "@/lib/skills/dlm";

export interface DeckCardInput {
  id: number;

  quantity?: number;

  zone?: string;
}

export interface DetectArchetypeInput {
  name?: string | null;

  skill?: string | null;

  cards: DeckCardInput[];
}

interface ArchetypeCounter {
  [name: string]: number;
}

/*
 * Cuenta cuántas copias pertenecen a cada arquetipo,
 * ponderando la cantidad y, opcionalmente, filtrando por
 * zona (por ejemplo, solo el Main Deck).
 */
export async function countArchetypes(
  cards: DeckCardInput[],
  options: {
    zone?: string;
  } = {}
) {
  const filtered = options.zone
    ? cards.filter(
        (card) =>
          (card.zone ?? "main") ===
          options.zone
      )
    : cards;

  if (filtered.length === 0) {
    return {} as ArchetypeCounter;
  }

  const ids = [
    ...new Set(filtered.map((card) => card.id)),
  ];

  const dbCards = await prisma.card.findMany({
    where: {
      id: {
        in: ids,
      },
    },

    select: {
      id: true,

      archetype: true,
    },
  });

  const archetypeById = new Map(
    dbCards.map((card) => [
      card.id,
      card.archetype,
    ])
  );

  const counter: ArchetypeCounter = {};

  for (const card of filtered) {
    const archetype =
      archetypeById.get(card.id)?.trim();

    if (!archetype) {
      continue;
    }

    const quantity = Math.max(
      card.quantity ?? 1,
      1
    );

    counter[archetype] =
      (counter[archetype] ?? 0) + quantity;
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

  entries.sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0])
  );

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
            mode: "insensitive",
          },
        },
        {
          slug: {
            equals: name
              .toLowerCase()
              .replace(/\s+/g, "-"),
            mode: "insensitive",
          },
        },
      ],
    },
  });
}

/*
 * Función principal. Prioriza el título y la Skill del
 * mazo, luego el arquetipo con más copias en el Main Deck
 * y, como respaldo, el conteo general de todo el mazo.
 *
 * Devuelve el nombre del arquetipo ganador para que el
 * llamador pueda resolverlo o crearlo en la base de datos.
 */
export async function detectArchetype({
  name,
  skill,
  cards,
}: DetectArchetypeInput) {
  if (cards.length === 0) {
    return null;
  }

  const ids = [
    ...new Set(cards.map((card) => card.id)),
  ];

  const dbCards = await prisma.card.findMany({
    where: {
      id: {
        in: ids,
      },
    },

    select: {
      id: true,

      archetype: true,
    },
  });

  const archetypeById = new Map(
    dbCards.map((card) => [
      card.id,
      card.archetype,
    ])
  );

  const archetypeNames = [
    ...new Set(
      dbCards
        .map((card) =>
          card.archetype?.trim()
        )
        .filter(
          (value): value is string =>
            Boolean(value)
        )
    ),
  ];

  const cardsWithArchetype = cards.map(
    (card) => ({
      quantity: card.quantity,

      zone: card.zone,

      card: {
        archetype:
          archetypeById.get(card.id) ?? null,
      },
    })
  );

  let skillText = skill ?? "";

  /*
   * La Skill guardada es solo su nombre. Cuando el
   * título no identifica el arquetipo, consultamos la
   * descripción y las cartas relacionadas de DLM para
   * detectar menciones como "Stardust".
   */
  if (
    skillText.trim() &&
    matchArchetypesInText(
      name,
      archetypeNames
    ).length === 0
  ) {
    const skillData =
      await fetchDlmSkillByName(
        skillText
      ).catch(() => null);

    if (skillData) {
      skillText = [
        skillText,
        skillData.description,
        ...(skillData.relatedCards ?? []).map(
          (card) => card.name
        ),
      ]
        .filter(Boolean)
        .join(" ");
    }
  }

  return suggestArchetypeName({
    name,

    skill: skillText,

    cards: cardsWithArchetype,
  });
}
