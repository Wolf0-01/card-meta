"use client";

import {
useEffect,
useMemo,
useState,
} from "react";

import type {
CardPreviewData,
} from "@/types/CardPreviewData";

import type {
DeckCard,
DeckCardInfo,
DeckZone,
} from "@/types/deck";

import { DECK_RULES } from "@/lib/decks/rules";

const STORAGE_KEY = "deck-builder";

const ZONE_LIMITS: Record<
DeckZone,
number

> = {
main: DECK_RULES.mainMax,
extra: DECK_RULES.extraMax,
};

const MAX_COPIES: Record<
DeckZone,
number

> = {
main: 3,
extra: 1,
};

function readStoredCards(
  fallback: DeckCard[]
): DeckCard[] {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const saved =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!saved) {
      return fallback;
    }

    const parsed: unknown =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? (parsed as DeckCard[])
      : fallback;
  } catch {
    return fallback;
  }
}

export default function useDeckBuilder(
initialCards: DeckCard[] = []
) {
/*
 * El estado se inicializa de forma perezosa.
 * En el servidor usa initialCards; en el cliente
 * recupera localStorage antes del primer render.
 */
  const [
  cards,
  setCards,
  ] = useState<DeckCard[]>(
  () => readStoredCards(initialCards)
  );

  /*
   * Bandera constante: no necesita setState porque
   * no cambia durante la vida del componente.
   */
  const [
  hasLoadedStorage,
  ] = useState(
  () => typeof window !== "undefined"
  );

/*
 * Persistir es una sincronización con un sistema
 * externo, así que vive en un efecto sin setState.
 */
  useEffect(() => {
  if (
  !hasLoadedStorage
  ) {
  return;
  }

try {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      cards
    )
  );
} catch {
  /*
   * Ignorar errores de almacenamiento.
   */
}

}, [
cards,
hasLoadedStorage,
]);

function addCard(
card: CardPreviewData,
zone: DeckZone = "main"
) {
const deckCard:
DeckCardInfo = {
id:
card.id,


    ygoproId:
      card.ygoproId,

    name:
      card.name,

    slug:
      card.slug,

    format:
      card.format,

    description:
      card.description ??
      "",

    image:
      card.image,

    type:
      card.type,

    attribute:
      card.attribute,

    race:
      card.race,

    archetype:
      card.archetype,

    level:
      card.level,

    attack:
      card.attack,

    defense:
      card.defense,

    rarity:
      card.rarity,

    banlistStatus:
      card.banlistStatus ?? null,

    frameType:
      card.frameType,

    scale:
      card.scale,

    linkRating:
      card.linkRating,

    linkMarkers:
      Array.isArray(
        card.linkMarkers
      )
        ? card.linkMarkers
        : null,
  };

setCards(
  (current) => {
    const existing =
      current.find(
        (item) =>
          item.card.id ===
            deckCard.id &&
          item.zone ===
            zone
      );

    if (
      existing
    ) {
      const maxCopies =
        MAX_COPIES[
          zone
        ];

      if (
        existing.quantity >=
        maxCopies
      ) {
        return current;
      }

      return current.map(
        (item) =>
          item.card.id ===
            deckCard.id &&
          item.zone ===
            zone
            ? {
                ...item,

                quantity:
                  item.quantity +
                  1,
              }
            : item
      );
    }

    const zoneTotal =
      current
        .filter(
          (item) =>
            item.zone ===
            zone
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,
          0
        );

    if (
      zoneTotal >=
      ZONE_LIMITS[
        zone
      ]
    ) {
      return current;
    }

    return [
      ...current,

      {
        id:
          `${zone}-${deckCard.id}`,

        quantity:
          1,

        zone,

        card:
          deckCard,
      },
    ];
  }
);


}

function removeCard(
cardId: number,
zone: DeckZone
) {
setCards(
(current) =>
current.flatMap(
(item) => {
if (
item.card.id !==
cardId ||
item.zone !==
zone
) {
return item;
}


        if (
          item.quantity >
          1
        ) {
          return {
            ...item,

            quantity:
              item.quantity -
              1,
          };
        }

        return [];
      }
    )
);


}

function setQuantity(
cardId: number,
zone: DeckZone,
quantity: number
) {
const safeQuantity =
Math.max(
0,
Math.min(
Math.floor(
quantity
),
MAX_COPIES[
zone
]
)
);


setCards(
  (current) => {
    if (
      safeQuantity ===
      0
    ) {
      return current.filter(
        (item) =>
          !(
            item.card.id ===
              cardId &&
            item.zone ===
              zone
          )
      );
    }

    return current.map(
      (item) =>
        item.card.id ===
          cardId &&
        item.zone ===
          zone
          ? {
              ...item,

              quantity:
                safeQuantity,
            }
          : item
    );
  }
);


}

function moveCard(
cardId: number,
from: DeckZone,
to: DeckZone
) {
if (
from === to
) {
return;
}


setCards(
  (current) => {
    const moving =
      current.find(
        (item) =>
          item.card.id ===
            cardId &&
          item.zone ===
            from
      );

    if (
      !moving
    ) {
      return current;
    }

    const target =
      current.find(
        (item) =>
          item.card.id ===
            cardId &&
          item.zone ===
            to
      );

    const targetTotal =
      current
        .filter(
          (item) =>
            item.zone ===
            to
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            item.quantity,
          0
        );

    if (
      !target &&
      targetTotal +
        moving.quantity >
        ZONE_LIMITS[
          to
        ]
    ) {
      return current;
    }

    const nextQuantity =
      target
        ? target.quantity +
          moving.quantity
        : moving.quantity;

    if (
      nextQuantity >
      MAX_COPIES[
        to
      ]
    ) {
      return current;
    }

    const withoutMoving =
      current.filter(
        (item) =>
          !(
            item.card.id ===
              cardId &&
            item.zone ===
              from
          )
      );

    if (
      target
    ) {
      return withoutMoving.map(
        (item) =>
          item.card.id ===
            cardId &&
          item.zone ===
            to
            ? {
                ...item,

                quantity:
                  nextQuantity,
              }
            : item
      );
    }

    return withoutMoving.map(
      (item) =>
        item.card.id ===
          cardId &&
        item.zone ===
          from
          ? {
              ...item,

              zone:
                to,

              id:
                `${to}-${cardId}`,
            }
          : item
    );
  }
);


}

function clearDeck() {
setCards(
[]
);
}

const stats =
useMemo(() => {
const main =
cards
.filter(
(card) =>
card.zone ===
"main"
)
.reduce(
(
total,
card
) =>
total +
card.quantity,
0
);


  const extra =
    cards
      .filter(
        (card) =>
          card.zone ===
          "extra"
      )
      .reduce(
        (
          total,
          card
        ) =>
          total +
          card.quantity,
        0
      );

  return {
    main,

    extra,

    total:
      main +
      extra,
  };
}, [
  cards,
]);


return {
cards,


stats,

setCards,

addCard,

removeCard,

setQuantity,

moveCard,

clearDeck,

hasLoadedStorage,


};
}
