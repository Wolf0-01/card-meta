import type { Metadata } from "next";
import { redirect } from "next/navigation";

import DeckBuilderWorkspace from "@/components/deck-builder/compact/DeckBuilderWorkspace";

import { getCurrentUser } from "@/lib/auth/currentUser";

import {
  findDeckByIdentifier,
} from "@/services/decks";

import type { DeckDraftSeed } from "@/hooks/useDeckDraft";

export const metadata: Metadata = {
  title: "Nuevo mazo | Card Meta",

  description:
    "Construye tu mazo competitivo de Yu-Gi-Oh! con el editor compacto de Card Meta.",
};

interface NewDeckPageProps {
  /*
   * Identificador de un mazo publicado desde el que
   * partir (botón "Build in Deck Builder").
   */
  searchParams: Promise<{
    clone?: string;
  }>;
}

export default async function NewDeckPage({
  searchParams,
}: NewDeckPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/decks/new");
  }

  const { clone } = await searchParams;

  let templateDeck:
    | DeckDraftSeed
    | undefined;

  if (clone) {
    const deck = await findDeckByIdentifier(
      clone,
      user.id
    ).catch(() => null);

    if (deck) {
      templateDeck = {
        name: deck.name,

        description:
          deck.description ?? "",

        skill: deck.skill ?? "",

        format:
          deck.format === "rush"
            ? "rush"
            : "speed",

        isPublic: false,

        cards: deck.cards.map(
          (deckCard) => ({
            id: deckCard.card.id,

            quantity:
              deckCard.quantity,

            zone: deckCard.zone,

            card: deckCard.card,
          })
        ),
      };
    }
  }

  return (
    <DeckBuilderWorkspace
      templateDeck={templateDeck}
    />
  );
}
