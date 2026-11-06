"use client";

import { DECK_RULES } from "@/lib/decks/rules";

export type DeckZone =
| "main"
| "extra"
| "side";

export interface DeckCard {
id: string;

name: string;

image: string;

quantity: number;
}

export interface DeckData {
main: DeckCard[];

extra: DeckCard[];

side: DeckCard[];
}

const STORAGE_KEY =
"duel-links-deck";

export const DECK_UPDATED_EVENT =
"deckUpdated";

let memoryDeck:
| DeckData
| null = null;

function emptyDeck(): DeckData {
return {
main: [],
extra: [],
side: [],
};
}

interface StoredCard {
id?: unknown;

name?: unknown;

image?: unknown;

quantity?: unknown;
}

function getZoneLimit(
zone: DeckZone
): number {
const limits:
Record<
DeckZone,
number
> = {
main: DECK_RULES.mainMax,
extra: DECK_RULES.extraMax,
side: DECK_RULES.sideMax,
};

return limits[zone];
}

function getMaxCopies(
zone: DeckZone
): number {
return zone === "main"
? 3
: 1;
}

function normalizeCard(
card: StoredCard,
zone: DeckZone
): DeckCard | null {
if (
typeof card.id !==
"string" &&
typeof card.id !==
"number"
) {
return null;
}

const rawQuantity =
typeof card.quantity ===
"number"
? Math.floor(
card.quantity
)
: 1;

const quantity =
Math.max(
1,
Math.min(
rawQuantity,
getMaxCopies(
zone
)
)
);

return {
id: String(
card.id
),


name:
  typeof card.name ===
  "string"
    ? card.name
    : "",

image:
  typeof card.image ===
  "string"
    ? card.image
    : "/cards/default.jpg",

quantity,


};
}

function normalizeCards(
cards: unknown,
zone: DeckZone
): DeckCard[] {
if (
!Array.isArray(
cards
)
) {
return [];
}

const normalizedCards =
cards
.map(
(card) =>
normalizeCard(
card as StoredCard,
zone
)
)
.filter(
(
card
): card is DeckCard =>
card !== null
);

const result: DeckCard[] =
[];

let total = 0;

for (
const card of
normalizedCards
) {
if (
total >=
getZoneLimit(
zone
)
) {
break;
}


const remaining =
  getZoneLimit(
    zone
  ) - total;

const quantity =
  Math.min(
    card.quantity,
    remaining
  );

result.push({
  ...card,
  quantity,
});

total += quantity;


}

return result;
}

function normalizeDeck(
deck: DeckData
): DeckData {
return {
main:
normalizeCards(
deck.main,
"main"
),


extra:
  normalizeCards(
    deck.extra,
    "extra"
  ),

side:
  normalizeCards(
    deck.side,
    "side"
  ),


};
}

function cloneDeckData(
deck: DeckData
): DeckData {
return {
main:
deck.main.map(
(card) => ({
...card,
})
),


extra:
  deck.extra.map(
    (card) => ({
      ...card,
    })
  ),

side:
  deck.side.map(
    (card) => ({
      ...card,
    })
  ),


};
}

function readDeckFromStorage():
DeckData {
if (
typeof window ===
"undefined"
) {
return emptyDeck();
}

const data =
localStorage.getItem(
STORAGE_KEY
);

if (!data) {
return emptyDeck();
}

try {
const parsed:
unknown =
JSON.parse(
data
);


if (
  typeof parsed !==
    "object" ||
  parsed === null
) {
  return emptyDeck();
}

const storedDeck =
  parsed as {
    main?: unknown;

    extra?: unknown;

    side?: unknown;
  };

return {
  main:
    normalizeCards(
      storedDeck.main,
      "main"
    ),

  extra:
    normalizeCards(
      storedDeck.extra,
      "extra"
    ),

  side:
    normalizeCards(
      storedDeck.side,
      "side"
    ),
};


} catch {
localStorage.removeItem(
STORAGE_KEY
);


return emptyDeck();


}
}

export function loadDeck():
DeckData {
if (
typeof window ===
"undefined"
) {
return emptyDeck();
}

if (
memoryDeck === null
) {
memoryDeck =
readDeckFromStorage();
}

return cloneDeckData(
memoryDeck
);
}

export function saveDeck(
deck: DeckData
): DeckData {
const nextDeck =
normalizeDeck(
cloneDeckData(
deck
)
);

memoryDeck =
nextDeck;

if (
typeof window !==
"undefined"
) {
localStorage.setItem(
STORAGE_KEY,
JSON.stringify(
nextDeck
)
);


window.dispatchEvent(
  new Event(
    DECK_UPDATED_EVENT
  )
);


}

return cloneDeckData(
nextDeck
);
}

export function addCardToDeck(
card: DeckCard,
zone: DeckZone = "main"
): DeckData {
const deck =
loadDeck();

const target =
deck[zone];

const existing =
target.find(
(currentCard) =>
currentCard.id ===
card.id
);

const total =
target.reduce(
(
sum,
currentCard
) =>
sum +
currentCard.quantity,
0
);

if (
!existing &&
total >=
getZoneLimit(
zone
)
) {
throw new Error(
`${zone.toUpperCase()} Deck lleno`
);
}

if (existing) {
const maxCopies =
getMaxCopies(
zone
);


if (
  existing.quantity >=
  maxCopies
) {
  throw new Error(
    `Máximo ${maxCopies} copia${
      maxCopies === 1
        ? ""
        : "s"
    } de esta carta en ${
      zone.toUpperCase()
    }`
  );
}

existing.quantity += 1;


} else {
target.push({
...card,


  quantity: 1,
});


}

return saveDeck(
deck
);
}

export function updateCardQuantity(
id: string,
quantity: number,
zone: DeckZone = "main"
): DeckData {
const deck =
loadDeck();

const card =
deck[zone].find(
(currentCard) =>
currentCard.id ===
id
);

if (!card) {
return deck;
}

const safeQuantity =
Math.max(
0,
Math.min(
Math.floor(
quantity
),
getMaxCopies(
zone
)
)
);

if (
safeQuantity === 0
) {
deck[zone] =
deck[zone].filter(
(currentCard) =>
currentCard.id !==
id
);
} else {
card.quantity =
safeQuantity;
}

return saveDeck(
deck
);
}

export function removeCardCompletely(
id: string,
zone: DeckZone = "main"
): DeckData {
const deck =
loadDeck();

deck[zone] =
deck[zone].filter(
(card) =>
card.id !== id
);

return saveDeck(
deck
);
}

export function moveCardBetweenZones(
id: string,
from: DeckZone,
to: DeckZone
): DeckData {
const deck =
loadDeck();

if (
from === to
) {
return deck;
}

const card =
deck[from].find(
(currentCard) =>
currentCard.id ===
id
);

if (!card) {
return deck;
}

const destination =
deck[to];

const existing =
destination.find(
(currentCard) =>
currentCard.id ===
id
);

const destinationTotal =
destination.reduce(
(
sum,
currentCard
) =>
sum +
currentCard.quantity,
0
);

if (
!existing &&
destinationTotal +
card.quantity >
getZoneLimit(
to
)
) {
throw new Error(
`${to.toUpperCase()} Deck lleno`
);
}

const maxCopies =
getMaxCopies(
to
);

const nextQuantity =
existing
? existing.quantity +
card.quantity
: card.quantity;

if (
nextQuantity >
maxCopies
) {
throw new Error(
`No se puede mover: ${
        to.toUpperCase()
      } permite un máximo de ${
        maxCopies
      } copia${
        maxCopies === 1
          ? ""
          : "s"
      }`
);
}

deck[from] =
deck[from].filter(
(currentCard) =>
currentCard.id !==
id
);

if (existing) {
existing.quantity =
nextQuantity;
} else {
destination.push({
...card,
});
}

return saveDeck(
deck
);
}

export function cloneDeck():
DeckData {
return loadDeck();
}

export function clearDeck():
DeckData {
return saveDeck(
emptyDeck()
);
}
