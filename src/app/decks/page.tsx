import DeckList from "@/components/decks/DeckList";

import { getAllDecks } from "@/lib/decks";

export default async function DecksPage() {
  const decks = await getAllDecks();

  return (
    <main
      className="
        min-h-screen
        bg-zinc-950
        p-10
        text-white
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
        "
      >
        <h1
          className="
            text-4xl
            font-bold
          "
        >
          🔥 Decks Meta
        </h1>

        <p
          className="
            mt-3
            text-zinc-400
          "
        >
          Explora los decks competitivos utilizados actualmente.
        </p>

        <div className="mt-8">
          <DeckList decks={decks} />
        </div>
      </div>
    </main>
  );
}