import type { Metadata } from "next";
import { redirect } from "next/navigation";

import DeckBuilderWorkspace from "@/components/deck-builder/compact/DeckBuilderWorkspace";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import {
  findDeckByIdentifier,
} from "@/services/decks";

import type { DeckDraftSeed } from "@/hooks/useDeckDraft";

export const metadata: Metadata = {
  title: "New deck | Card Meta",

  description:
    "Build your competitive Yu-Gi-Oh! deck with the compact Card Meta editor.",
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

        archetype:
          deck.archetype?.name ?? "",

        format:
          deck.format === "rush"
            ? "rush"
            : "speed",

        isPublic: false,

        noLimits: deck.noLimits,

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
      isStaff={canManageGuides(user)}
    />
  );
}
