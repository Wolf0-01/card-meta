import DeckBuilderContainer from "@/components/deck-builder/DeckBuilderContainer";
import { getAllCards } from "@/lib/cards";

export default async function DeckBuilderPage() {
  const availableCards = await getAllCards();

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
          mx-auto
          max-w-7xl
        "
      >
        <h1
          className="
            mb-8
            text-4xl
            font-bold
          "
        >
          🃏 Deck Builder
        </h1>

        <DeckBuilderContainer
          availableCards={availableCards}
        />
      </div>
    </main>
  );
}