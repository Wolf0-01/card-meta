"use client";

import {
useEffect,
useMemo,
useState,
} from "react";

import {
useRouter,
} from "next/navigation";

import DeckCardComponent from "./DeckCard";

import {
DeckCard as StoredDeckCard,
DeckData,
loadDeck,
addCardToDeck,
updateCardQuantity,
removeCardCompletely,
moveCardBetweenZones,
DECK_UPDATED_EVENT,
} from "@/lib/deckStorage";

import type {
Card,
} from "@/types/card";

import {
detectArchetype,
} from "@/lib/archetypeClient";

import { DECK_RULES } from "@/lib/decks/rules";

type Zone =
| "main"
| "extra";

type DeckStatus =
| "ready"
| "incomplete"
| "invalid";

type DeckValidation = {
isValid: boolean;

status: DeckStatus;

messages: string[];
};

type DeckValidationInput = {
deckName: string;

mainCount: number;

extraCount: number;
};

const EMPTY_DECK: DeckData = {
main: [],
extra: [],
};

export default function DeckBuilder() {
const router = useRouter();

const [
deck,
setDeck,
] = useState<DeckData>(
EMPTY_DECK
);

const [
deckName,
setDeckName,
] = useState(
"Nuevo Deck"
);

const [
cards,
setCards,
] = useState<Card[]>([]);

const [
totalResults,
setTotalResults,
] = useState(0);

const [
isSaving,
setIsSaving,
] = useState(false);

const [
filters,
setFilters,
] = useState({
search: "",
type: "",
attribute: "",
rarity: "",
level: "",
monsterType: "",
archetype: "",
scale: "",
linkMarkers: "",
minAtk: "",
maxAtk: "",
minDef: "",
maxDef: "",
});

const mainCount = useMemo(
() =>
countCards(
deck.main
),
[deck.main]
);

const extraCount = useMemo(
() =>
countCards(
deck.extra
),
[deck.extra]
);

const totalDeckCards =
mainCount +
extraCount;

const detected = useMemo(
() =>
detectArchetype([
...deck.main,
...deck.extra,
]),
[
deck.main,
deck.extra,
]
);

const detectedArchetype =
detected?.name ?? "";

const detectedArchetypeId =
detected?.id ?? "";

const validation = useMemo(
() =>
getDeckValidation({
deckName,
mainCount,
extraCount,
}),
[
deckName,
mainCount,
extraCount,
]
);

function detectZone(
card: Card
): Zone {
console.log(
"Carta:",
card.name,
"Tipo:",
card.type
);


const type =
  card.type
    ?.toLowerCase()
    ?? "";

if (
  type.includes("fusion") ||
  type.includes("synchro") ||
  type.includes("xyz") ||
  type.includes("link")
) {
  return "extra";
}

return "main";


}

useEffect(() => {
function refresh() {
setDeck(
loadDeck()
);
}


refresh();

window.addEventListener(
  DECK_UPDATED_EVENT,
  refresh
);

return () => {
  window.removeEventListener(
    DECK_UPDATED_EVENT,
    refresh
  );
};


}, []);

useEffect(() => {
async function searchCards() {
const params =
new URLSearchParams();


  Object.entries(
    filters
  ).forEach(
    ([key, value]) => {
      if (value) {
        params.append(
          key,
          String(value)
        );
      }
    }
  );

  try {
    const url =
      params.toString()
        ? `/api/cards?${params.toString()}`
        : "/api/cards?random=true&limit=60";

    const response =
      await fetch(
        url
      );

    if (
      !response.ok
    ) {
      throw new Error(
        "No se pudieron cargar las cartas."
      );
    }

    const data =
      await response.json();

    setCards(
      data.cards ?? []
    );

    setTotalResults(
      data.total ?? 0
    );
  } catch (error) {
    console.error(
      error
    );

    setCards([]);

    setTotalResults(0);
  }
}

const timer =
  window.setTimeout(
    searchCards,
    300
  );

return () => {
  window.clearTimeout(
    timer
  );
};


}, [filters]);

function addCard(
  card: Card,
  zone?: Zone
) {
  try {
    const targetZone =
      zone ??
      detectZone(card);

    const updated =
      addCardToDeck(
        {
          id: String(
            card.id
          ),

          name:
            card.name,

          image:
            card.image ??
            "/cards/default.jpg",

          quantity:
            1,
        },
        targetZone
      );

    setDeck(updated);
  } catch (error) {
    if (
      error instanceof Error
    ) {
      alert(
        error.message
      );
    }
  }
}

function removeCard(
id: string,
zone: Zone
) {
try {
const updated =
removeCardCompletely(
id,
zone
);


  setDeck(
    updated
  );
} catch (error) {
  if (
    error instanceof Error
  ) {
    alert(
      error.message
    );
  }
}


}

function moveCard(
id: string,
from: Zone,
to: Zone
) {
try {
const updated =
moveCardBetweenZones(
id,
from,
to
);


  setDeck(
    updated
  );
} catch (error) {
  if (
    error instanceof Error
  ) {
    alert(
      error.message
    );
  }
}


}

function changeQuantity(
id: string,
quantity: number,
zone: Zone
) {
try {
const safeQuantity =
Math.max(
0,
quantity
);


  const updated =
    updateCardQuantity(
      id,
      safeQuantity,
      zone
    );

  setDeck(
    updated
  );
} catch (error) {
  if (
    error instanceof Error
  ) {
    alert(
      error.message
    );
  }
}


}

async function saveDeck() {
if (
!validation.isValid ||
isSaving
) {
return;
}


setIsSaving(
  true
);

try {
  const deckCards = [
    ...deck.main.map(
      (card) => ({
        id:
          Number(
            card.id
          ),

        quantity:
          card.quantity,

        zone:
          "main" as const,
      })
    ),

    ...deck.extra.map(
      (card) => ({
        id:
          Number(
            card.id
          ),

        quantity:
          card.quantity,

        zone:
          "extra" as const,
      })
    ),
  ];

  const response =
    await fetch(
      "/api/decks",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            name:
              deckName.trim(),

            archetypeId:
              detectedArchetypeId
              || null,

            cards:
              deckCards,
          }),
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      "No se pudo crear el deck."
    );
  }

  const createdDeck =
    await response.json();

  router.push(
    `/decks/${createdDeck.slug}/${createdDeck.identifier}`
  );
} catch (error) {
  console.error(
    error
  );

  alert(
    "No se pudo guardar el deck."
  );

  setIsSaving(
    false
  );
}


}

function renderZone(
title: string,
zoneCards:
StoredDeckCard[],
limit: number,
zone: Zone
) {
const zoneCount =
countCards(
zoneCards
);


const isOverLimit =
  zoneCount >
  limit;

return (
  <section
    className="
      rounded-xl
      border
      border-zinc-800
      bg-zinc-950
      p-4
    "
  >
    <header
      className="
        mb-4
        flex
        items-center
        justify-between
      "
    >
      <h3
        className="
          font-bold
          text-white
        "
      >
        {title}
      </h3>

      <span
        className={`
          text-sm
          font-semibold
          ${
            isOverLimit
              ? "text-red-400"
              : "text-zinc-400"
          }
        `}
      >
        {zoneCount}
        /
        {limit}
      </span>
    </header>

    {zoneCards.length === 0 ? (
      <div
        className="
          rounded-lg
          border
          border-dashed
          border-zinc-800
          px-4
          py-8
          text-center
          text-sm
          text-zinc-600
        "
      >
        No hay cartas
        en esta zona.
      </div>
    ) : (
      <div
        className="
          grid
          grid-cols-3
          gap-3
          sm:grid-cols-4
          lg:grid-cols-6
        "
      >
        {zoneCards.map(
          (card) => (
            <DeckCardComponent
              key={
                `${zone}-${card.id}`
              }
              card={{
                ...card,
                zone,
              }}
              showControls
              showZone
              onIncrease={() => {
                const maxCopies =
                  zone ===
                  "main"
                    ? 3
                    : 1;

                if (
                  card.quantity >=
                  maxCopies
                ) {
                  return;
                }

                changeQuantity(
                  card.id,
                  card.quantity +
                  1,
                  zone
                );
              }}
              onDecrease={() =>
                changeQuantity(
                  card.id,
                  card.quantity -
                  1,
                  zone
                )
              }
              onRemove={() =>
                removeCard(
                  card.id,
                  zone
                )
              }
              onMove={(
                target
              ) =>
                moveCard(
                  card.id,
                  zone,
                  target
                )
              }
            />
          )
        )}
      </div>
    )}
  </section>
);


}

const statusClasses = {
ready:
"border-emerald-500/40 bg-emerald-500/10",


incomplete:
  "border-amber-500/40 bg-amber-500/10",

invalid:
  "border-red-500/40 bg-red-500/10",


};

const statusTextClasses = {
ready:
"text-emerald-400",


incomplete:
  "text-amber-400",

invalid:
  "text-red-400",


};

const statusLabel = {
ready:
"✓ Listo para publicar",


incomplete:
  "⚠ Deck incompleto",

invalid:
  "✕ Deck inválido",

};

return ( <section
   className="
     mx-auto
     max-w-7xl
     rounded-xl
     border
     border-zinc-800
     bg-zinc-950
     p-5
   "
 > <div
     className="
       mb-6
       rounded-xl
       border
       border-zinc-800
       bg-zinc-900
       p-5
     "
   > <h1
       className="
         text-3xl
         font-bold
         text-white
       "
     >
🃏 Constructor
de Deck </h1>


    <p
      className="
        mt-2
        text-zinc-400
      "
    >
      Construye tu deck
      competitivo y publícalo
      en Card Meta.
    </p>

    {detectedArchetype && (
      <p
        className="
          mt-3
          text-sm
          text-blue-400
        "
      >
        Arquetipo
        detectado:

        <span
          className="
            ml-2
            font-bold
          "
        >
          {detectedArchetype}
        </span>
      </p>
    )}
  </div>

  <div
    className="
      mb-5
      grid
      gap-4
      md:grid-cols-2
    "
  >
    <input
      value={
        deckName
      }
      onChange={(
        event
      ) =>
        setDeckName(
          event.target.value
        )
      }
      placeholder="
        Nombre del Deck
      "
      maxLength={80}
      className="
        rounded-xl
        border
        border-zinc-700
        bg-zinc-800
        px-4
        py-3
        text-white
        outline-none
        transition
        focus:border-blue-500
      "
    />

    <div
      className="
        rounded-xl
        border
        border-zinc-700
        bg-zinc-800
        px-4
        py-3
      "
    >
      {detectedArchetype ? (
        <>
          Arquetipo:

          <span
            className="
              ml-2
              font-bold
              text-blue-400
            "
          >
            {detectedArchetype}
          </span>
        </>
      ) : (
        <span
          className="
            text-zinc-500
          "
        >
          Sin detectar
        </span>
      )}
    </div>
  </div>

  <div
    className={`
      mb-5
      rounded-xl
      border
      p-4
      ${
        statusClasses[
          validation.status
        ]
      }
    `}
  >
    <div
      className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div>
        <p
          className={`
            font-bold
            ${
              statusTextClasses[
                validation.status
              ]
            }
          `}
        >
          {
            statusLabel[
              validation.status
            ]
          }
        </p>

        <p
          className="
            mt-1
            text-sm
            text-zinc-400
          "
        >
          {totalDeckCards}
          {" "}
          cartas en total
        </p>
      </div>

      <div
        className="
          flex
          gap-3
          text-sm
          text-zinc-300
        "
      >
        <span>
          Main:
          {" "}
          {mainCount}
          /{DECK_RULES.mainMax}
        </span>

        <span>
          Extra:
          {" "}
          {extraCount}
          /{DECK_RULES.extraMax}
        </span>
      </div>
    </div>

    {validation.messages.length >
      0 && (
      <ul
        className="
          mt-3
          space-y-1
          text-sm
          text-zinc-300
        "
      >
        {validation.messages.map(
          (message) => (
            <li
              key={
                message
              }
            >
              •
              {" "}
              {message}
            </li>
          )
        )}
      </ul>
    )}
  </div>

  <div
    className="
      grid
      gap-6
      lg:grid-cols-2
    "
  >
    <section
      className="
        rounded-xl
        border
        border-zinc-700
        bg-zinc-900
        p-5
      "
    >
      <h2
        className="
          mb-5
          text-xl
          font-bold
          text-white
        "
      >
        🔍 Buscar Cartas
      </h2>

      <input
        value={
          filters.search
        }
        onChange={(
          event
        ) =>
          setFilters({
            ...filters,
            search:
              event.target.value,
          })
        }
        placeholder="
          Buscar carta...
        "
        className="
          mb-4
          w-full
          rounded-xl
          border
          border-zinc-700
          bg-zinc-800
          px-4
          py-3
          text-white
          outline-none
          focus:border-blue-500
        "
      />

      <div
        className="
          mt-4
          text-sm
          text-zinc-400
        "
      >
        Resultados:

        <span
          className="
            ml-2
            font-bold
            text-white
          "
        >
          {totalResults.toLocaleString(
            "es-ES"
          )}
        </span>
      </div>

      <div
        className="
          mt-5
          grid
          grid-cols-3
          gap-3
          sm:grid-cols-4
        "
      >
        {cards.map(
          (card) => (
            <DeckCardComponent
  key={card.id}
  card={{
    id: String(
      card.id
    ),

    name:
      card.name,

    image:
      card.image ??
      "/cards/default.jpg",

    type:
      card.type,

    quantity:
      1,
  }}
  showAddButtons
  onClick={() =>
    addCard(
      card,
      detectZone(card)
    )
  }
  onAddToZone={(
    zone
  ) =>
    addCard(
      card,
      zone
    )
  }
/>
          )
        )}
      </div>
    </section>

    <section
      className="
        rounded-xl
        border
        border-zinc-700
        bg-zinc-900
        p-5
      "
    >
      <h2
        className="
          mb-5
          text-xl
          font-bold
          text-white
        "
      >
        ⚔️ Deck Actual
      </h2>

      {renderZone(
        "MAIN DECK",
        deck.main,
        DECK_RULES.mainMax,
        "main"
      )}

      <div
        className="
          mt-5
        "
      >
        {renderZone(
          "EXTRA DECK",
          deck.extra,
          DECK_RULES.extraMax,
          "extra"
        )}
      </div>
    </section>
  </div>

  <button
    type="button"
    onClick={
      saveDeck
    }
    disabled={
      !validation.isValid ||
      isSaving
    }
    className="
      mt-8
      w-full
      rounded-xl
      bg-blue-600
      py-4
      font-bold
      text-white
      transition
      hover:bg-blue-500
      disabled:cursor-not-allowed
      disabled:bg-zinc-700
      disabled:text-zinc-400
      disabled:hover:bg-zinc-700
    "
  >
    {isSaving
      ? "Guardando deck..."
      : validation.isValid
        ? "💾 Publicar Deck"
        : "Completa el deck para publicar"}
  </button>
</section>


);
}

function countCards(
cards:
StoredDeckCard[]
) {
return cards.reduce(
(
total,
card
) =>
total +
card.quantity,
0
);
}

function getDeckValidation({
deckName,
mainCount,
extraCount,
}: DeckValidationInput): DeckValidation {
const messages:
string[] = [];

const cleanName =
deckName.trim();

if (
!cleanName
) {
messages.push(
"Ingresa un nombre para el deck."
);
}

if (
mainCount < DECK_RULES.mainMin
) {
messages.push(
`Faltan ${
        DECK_RULES.mainMin - mainCount
      } cartas en el Main Deck.`
);
}

if (
mainCount > DECK_RULES.mainMax
) {
messages.push(
`El Main Deck supera el límite por ${
        mainCount - DECK_RULES.mainMax
      } cartas.`
);
}

if (
extraCount > DECK_RULES.extraMax
) {
messages.push(
`El Extra Deck supera el límite por ${
        extraCount - DECK_RULES.extraMax
      } cartas.`
);
}

const hasLimitError =
mainCount > DECK_RULES.mainMax ||
extraCount > DECK_RULES.extraMax;

const isIncomplete =
!cleanName ||
mainCount < DECK_RULES.mainMin;

let status:
DeckStatus;

if (
hasLimitError
) {
status =
"invalid";
} else if (
isIncomplete
) {
status =
"incomplete";
} else {
status =
"ready";
}

return {
isValid:
status ===
"ready",


status,

messages,


};
}
