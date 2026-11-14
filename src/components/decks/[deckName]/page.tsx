import DeckViewer from "@/components/decks/DeckViewer";

import { calculateDeckGemEstimate } from "@/lib/decks/gemCalculator";

import {
  findDeckByIdentifier,
} from "@/services/decks";

interface Props {
  params: Promise<{
    deckName: string;
  }>;
}

export default async function DeckPage({
  params,
}: Props) {
  const { deckName } =
    await params;

  const deck =
    await findDeckByIdentifier(
      deckName
    );

  if (!deck) {
    return (
      <main
        className="
          min-h-screen
          bg-zinc-950
          p-6
          text-white
        "
      >
        <div
          className="
            mx-auto
            max-w-6xl
          "
        >
          <h1 className="text-3xl font-bold">
            Deck not found
          </h1>
        </div>
      </main>
    );
  }

  const gemEstimate =
    await calculateDeckGemEstimate(deck);

  return (
    <main
      className="
        min-h-screen
        bg-zinc-950
        p-6
        text-white
      "
    >
      <div
        className="
          mx-auto
          max-w-6xl
        "
      >
        <h1
          className="
            mb-6
            text-3xl
            font-bold
          "
        >
          {deck.name}
        </h1>

        <DeckViewer
          deck={deck}
          gemEstimate={gemEstimate}
        />
      </div>
    </main>
  );
}