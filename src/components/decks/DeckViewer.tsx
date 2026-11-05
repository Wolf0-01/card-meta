"use client";

import Card from "@/components/ui/Card";

import DeckStats from "./DeckStats";
import DeckSection from "./DeckSection";
import DeckGuide from "./DeckGuide";
import DeckCombos from "./DeckCombos";
import DeckMatchups from "./DeckMatchups";
import RelatedDecks from "./RelatedDecks";
import DeckHeader from "./DeckHeader";
import DeckOverview from "./DeckOverview";
import DeckMainDeck from "./DeckMainDeck";
import DeckExtraDeck from "./DeckExtraDeck";

import type { MetaDeck } from "@/types/meta";

interface Props {
deck: MetaDeck;
relatedDecks?: MetaDeck[];
}

export default function DeckViewer({
deck,
relatedDecks = [],
}: Props) {
const cards = deck.cards ?? [];

const sideDeck = cards.filter(
(card) => card.zone === "side"
);

const countCards = (
deckCards: typeof cards
) =>
deckCards.reduce(
(total, card) =>
total + (card.quantity ?? 1),
0
);

const totalCards =
deck.totalCards ??
countCards(cards);

return ( <div className="space-y-8"> <DeckHeader deck={deck} />

  <DeckStats deck={deck} />

  <DeckOverview deck={deck} />

  <DeckMainDeck deck={deck} />

  <DeckExtraDeck deck={deck} />

  {sideDeck.length > 0 && (
    <DeckSection
      title="SIDE DECK"
      cards={sideDeck}
    />
  )}

  <DeckGuide guide={deck.guide} />

  <DeckCombos
    combos={
      deck.combos
        ? [deck.combos]
        : null
    }
  />

  <DeckMatchups
    matchups={[]}
  />

  <RelatedDecks
    decks={relatedDecks}
  />

  <Card className="p-6">
    <div
      className="
        grid
        gap-4
        md:grid-cols-2
      "
    >
      <div>
        <p
          className="
            text-sm
            text-foreground-muted
          "
        >
          Total de cartas
        </p>

        <p
          className="
            mt-1
            text-2xl
            font-bold
            text-foreground
          "
        >
          {totalCards}
        </p>
      </div>

      <div>
        <p
          className="
            text-sm
            text-foreground-muted
          "
        >
          Deck Hash
        </p>

        <p
          className="
            mt-1
            font-mono
            text-sm
            text-foreground
          "
        >
          {deck.deckHash
            ? `${deck.deckHash.slice(0, 16)}...`
            : "No disponible"}
        </p>
      </div>
    </div>
  </Card>
</div>


);
}
