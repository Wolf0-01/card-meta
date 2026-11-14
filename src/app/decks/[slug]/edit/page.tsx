import type { Metadata } from "next";
import {
  notFound,
  redirect,
} from "next/navigation";

import DeckBuilderWorkspace, {
  type EditableDeckData,
} from "@/components/deck-builder/compact/DeckBuilderWorkspace";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { getDeckForViewer } from "@/lib/decks/service";

import type { DraftCard } from "@/types/deck-draft";

export const metadata: Metadata = {
  title: "Edit deck | Card Meta",

  description:
    "Edit the cards, strategy and visibility of your Duel Links deck.",
};

interface EditDeckPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditDeckPage({
  params,
}: EditDeckPageProps) {
  const user = await getCurrentUser();

  const { slug: deckId } = await params;

  if (!user) {
    redirect(
      `/login?next=/decks/${deckId}/edit`
    );
  }

  const deck = await getDeckForViewer(
    deckId,
    user.id
  ).catch(() => null);

  if (
    !deck ||
    deck.authorId !== user.id
  ) {
    notFound();
  }

  const cards: DraftCard[] =
    deck.cards.map((deckCard) => ({
      id: deckCard.cardId,

      quantity: deckCard.quantity,

      zone: deckCard.zone,

      card: deckCard.card,
    }));

  const initialDeck: EditableDeckData = {
    id: deck.id,

    name: deck.name,

    description: deck.description ?? "",

    skill: deck.skill ?? "",

    format:
      deck.format === "rush"
        ? "rush"
        : "speed",

    isPublic: deck.isPublic,

    cards,
  };

  return (
    <DeckBuilderWorkspace
      initialDeck={initialDeck}
    />
  );
}
