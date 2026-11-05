import { NextResponse } from "next/server";

import { createDeck } from "@/lib/createDeck";

const validZones = [
"main",
"extra",
"side",
] as const;

type DeckZone = (typeof validZones)[number];

interface IncomingCard {
id: number;
quantity?: number;
zone?: string;
}

interface CreateDeckBody {
name: string;
archetypeId?: string | null;
cards: IncomingCard[];
}

export async function POST(
request: Request
) {
try {
const body: CreateDeckBody =
await request.json();

const {
  name,
  archetypeId,
  cards,
} = body;

if (
  typeof name !== "string" ||
  name.trim() === "" ||
  !Array.isArray(cards) ||
  cards.length === 0
) {
  return NextResponse.json(
    {
      error:
        "Nombre o cartas faltantes",
    },
    {
      status: 400,
    }
  );
}

const normalizedArchetypeId =
  typeof archetypeId === "string" &&
  archetypeId.trim() !== ""
    ? archetypeId.trim()
    : undefined;

const normalizedCards =
  cards.map((card) => {
    const zone: DeckZone =
      validZones.includes(
        card.zone as DeckZone
      )
        ? (card.zone as DeckZone)
        : "main";

    return {
      id: Number(card.id),

      quantity: Math.max(
        1,
        Number(card.quantity ?? 1)
      ),

      zone,
    };
  });

const deck = await createDeck({
  name: name.trim(),
  archetypeId:
    normalizedArchetypeId,
  cards: normalizedCards,
});

return NextResponse.json(
  {
    id: deck.id,

    name: deck.name,

    slug: deck.slug,

    identifier:
      deck.identifier,

    deckHash:
      deck.deckHash,

    archetype:
  typeof deck.archetype === "string"
    ? deck.archetype
    : deck.archetype?.name ?? null,
  },
  {
    status: 201,
  }
);


} catch (error) {
console.error(
"CREATE DECK ERROR:",
error
);


return NextResponse.json(
  {
    error:
      "Error creando deck",
  },
  {
    status: 500,
  }
);


}
}
