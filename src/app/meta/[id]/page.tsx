import {
notFound,
} from "next/navigation";

import {
findDeckByIdentifier,
} from "@/services/decks";

import DeckStats from "@/components/decks/DeckStats";
import DeckCardList from "@/components/decks/DeckCardList";

interface Props {
params: Promise<{
id: string;
}>;
}

export default async function MetaDeckPage({
params,
}: Props) {
const { id } = await params;

const deck =
await findDeckByIdentifier(id);

if (!deck) {
notFound();
}

return ( <main
   className="
     min-h-screen
     bg-zinc-950
     text-white
     p-6
   "
 > <div
     className="
       max-w-6xl
       mx-auto
     "
   > <DeckStats
       deck={deck}
     />

    <section
      className="
        mt-6
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        p-6
      "
    >
      <h2
        className="
          text-2xl
          font-bold
          mb-4
        "
      >
        Información del Deck
      </h2>

      <p
        className="
          text-zinc-400
          mb-5
        "
      >
        {deck.description ??
          "Deck competitivo del meta actual."}
      </p>

      <div
        className="
          grid
          md:grid-cols-4
          gap-4
        "
      >
        <div
          className="
            bg-zinc-950
            rounded-xl
            p-4
          "
        >
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            ARQUETIPO
          </p>

          <p
            className="
              font-bold
              mt-1
            "
          >
            {deck.archetype?.name ??
              "Unknown"}
          </p>
        </div>

        <div
          className="
            bg-zinc-950
            rounded-xl
            p-4
          "
        >
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            POPULARIDAD
          </p>

          <p
            className="
              font-bold
              mt-1
            "
          >
            {deck.popularity}%
          </p>
        </div>

        <div
          className="
            bg-zinc-950
            rounded-xl
            p-4
          "
        >
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            TOPS TORNEO
          </p>

          <p
            className="
              font-bold
              mt-1
            "
          >
            {deck.tournamentResults}
          </p>
        </div>

        <div
          className="
            bg-zinc-950
            rounded-xl
            p-4
          "
        >
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            FORMATO
          </p>

          <p
            className="
              font-bold
              mt-1
            "
          >
            {deck.format}
          </p>
        </div>
      </div>
    </section>

    <section
      className="
        mt-6
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        p-6
      "
    >
      <h2
        className="
          text-2xl
          font-bold
          mb-4
        "
      >
        Cartas del Deck
      </h2>

      <DeckCardList
        cards={deck.cards}
      />
    </section>

    <section
      className="
        mt-6
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        p-6
      "
    >
      <h2
        className="
          text-2xl
          font-bold
          mb-4
        "
      >
        📅 Información Meta
      </h2>

      <div
        className="
          grid
          md:grid-cols-3
          gap-4
        "
      >
        <div
          className="
            bg-zinc-950
            rounded-xl
            p-4
          "
        >
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            ACTUALIZADO
          </p>

          <p
            className="
              font-bold
              mt-1
            "
          >
            {new Date(
              deck.updatedAt
            ).toLocaleDateString(
              "es-ES"
            )}
          </p>
        </div>

        <div
          className="
            bg-zinc-950
            rounded-xl
            p-4
          "
        >
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            TENDENCIA
          </p>

          <p
            className="
              font-bold
              mt-1
            "
          >
            {deck.trend}
          </p>
        </div>

        <div
          className="
            bg-zinc-950
            rounded-xl
            p-4
          "
        >
          <p
            className="
              text-xs
              text-zinc-500
            "
          >
            POSICIÓN
          </p>

          <p
            className="
              font-bold
              mt-1
            "
          >
            #{deck.tierOrder}
          </p>
        </div>
      </div>
    </section>
  </div>
</main>


);
}
