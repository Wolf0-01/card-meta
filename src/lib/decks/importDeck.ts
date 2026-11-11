import { prisma } from "@/lib/prisma";

import {
  parseYdk,
  ImportedDeck,
} from "@/utils/importDeck";

import type {
  ImportedDeckCard,
  ImportedDeckResult,
} from "@/types/imported-deck";

function groupIds(
  ids: number[]
) {
  const map = new Map<
    number,
    number
  >();

  for (const id of ids) {
    map.set(
      id,
      (map.get(id) ?? 0) + 1
    );
  }

  return map;
}

async function loadCards(
  ids: number[],
  zone: "main" | "extra"
): Promise<ImportedDeckCard[]> {
  const grouped = groupIds(ids);

  const cards =
    await prisma.card.findMany({
      where: {
        ygoproId: {
          in: [...grouped.keys()],
        },
      },
    });

  return cards.map((card) => ({
    quantity:
      grouped.get(card.ygoproId!) ?? 1,

    zone,

    card: {
      id: card.id,

      ygoproId: card.ygoproId,

      name: card.name,

      image: card.image,

      type: card.type,

      attribute: card.attribute,

      race: card.race,

      level: card.level,

      attack: card.attack,

      defense: card.defense,
    },
  }));
}

export async function importDeckFromYdk(
  content: string
): Promise<ImportedDeckResult> {
  const deck: ImportedDeck =
    parseYdk(content);

  const [
    main,
    extra,
  ] = await Promise.all([
    loadCards(
      deck.main,
      "main"
    ),

    loadCards(
      deck.extra,
      "extra"
    ),
  ]);

  return {
    main,
    extra,
  };
}