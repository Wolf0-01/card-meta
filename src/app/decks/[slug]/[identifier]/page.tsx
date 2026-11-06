import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";
import DeckViewer from "@/components/decks/DeckViewer";

import { getCurrentUser } from "@/lib/auth/currentUser";

import {
  findDeckByIdentifier,
} from "@/services/decks";

interface Props {
  params: Promise<{
    slug: string;
    identifier: string;
  }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { identifier } = await params;

  const user = await getCurrentUser();

  const deck =
    await findDeckByIdentifier(
      identifier,
      user?.id ?? null
    );

  if (!deck) {
    return {
      title: "Deck no encontrado",
    };
  }

  return {
    title: `${deck.name} | Card Meta`,
    description:
      deck.description ??
      `Guía completa del deck ${deck.name}, lista de cartas, estadísticas y estrategia.`,
  };
}

export default async function DeckPage({
  params,
}: Props) {
  const {
    slug,
    identifier,
  } = await params;

  const user = await getCurrentUser();

  const deck =
    await findDeckByIdentifier(
      identifier,
      user?.id ?? null
    );

  if (
    !deck ||
    deck.slug !== slug
  ) {
    notFound();
  }

  return (
    <main
      className="
        min-h-screen
        py-8
      "
    >
      <Container>
        <DeckViewer
          deck={deck}
        />
      </Container>
    </main>
  );
}