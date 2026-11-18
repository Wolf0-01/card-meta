import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";
import DeckViewer from "@/components/decks/DeckViewer";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import { getDeckArchetypeLabel } from "@/lib/decks/archetypeLabel";

import { calculateDeckGemEstimate } from "@/lib/decks/gemCalculator";

import { findGuideByArchetype } from "@/lib/guides";

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
      title: "Deck not found",
    };
  }

  return {
    title: `${deck.name} | Card Meta`,
    description:
      deck.description ??
      `Full guide to the ${deck.name} deck, card list, stats and strategy.`,
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

  const gemEstimate =
    await calculateDeckGemEstimate(deck);

  const archetypeLabel =
    getDeckArchetypeLabel(deck);

  const archetypeGuide =
    await findGuideByArchetype(archetypeLabel);

  const archetypeParams = new URLSearchParams({
    archetype: archetypeLabel,
  });

  if (deck.format === "rush") {
    archetypeParams.set("format", "rush");
  }

  const breakdownHref = archetypeGuide
    ? `/guides/${archetypeGuide.slug}`
    : `/decks?${archetypeParams.toString()}`;

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
          gemEstimate={gemEstimate}
          breakdownHref={breakdownHref}
          canViewPlayerProfile={canManageGuides(user)}
          isOwner={
            Boolean(user) &&
            user?.id === deck.authorId
          }
        />
      </Container>
    </main>
  );
}