import {
  getTierDecks
} from "@/lib/decks";

import TierList from "@/components/TierList";


export default async function TierListPage(){

  const decks = await getTierDecks();


  return (

    <main
      className="
      min-h-screen
      bg-zinc-950
      text-white
      p-6
      "
    >

      <div
        className="
        max-w-6xl
        mx-auto
        "
      >

        <header className="mb-8">

          <h1
            className="
            text-4xl
            font-bold
            mb-3
            text-center
            "
          >
            🔥 Tier List
          </h1>


          <p
            className="
            text-zinc-400
            text-center
            "
          >
            Ranking competitivo de decks basado en rendimiento y popularidad.
          </p>


          <div
            className="
            mt-4
            flex
            justify-center
            gap-4
            text-sm
            "
          >

            <span
              className="
              bg-zinc-900
              px-4
              py-2
              rounded-lg
              border
              border-zinc-800
              "
            >
              Última actualización: Hoy
            </span>


            <span
              className="
              bg-zinc-900
              px-4
              py-2
              rounded-lg
              border
              border-zinc-800
              "
            >
              Formato: Duel Links
            </span>

          </div>

        </header>


        <TierList
          decks={decks}
        />


      </div>

    </main>

  );
}