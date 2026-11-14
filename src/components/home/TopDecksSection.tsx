import Link from "next/link";

import Container from "@/components/ui/Container";
import Grid from "@/components/ui/Grid";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";

import HomeDeckCard from "@/components/HomeDeckCard";

interface Archetype {
  name: string;
}

interface Deck {
  name: string;
  tier: string | null;
  archetype?: Archetype | null;
  wins?: number;
  losses?: number;
  popularity: number;
  slug: string;
  identifier: string;
}

interface TopDecksSectionProps {
  decks: Deck[];
}

export default function TopDecksSection({
  decks,
}: TopDecksSectionProps) {
  return (
    <Section>

      <Container>

        <SectionHeader
          title="Top Decks"
          subtitle="The most played competitive decks in the current meta."
          action={
            <Button
              href="/decks"
              variant="outline"
            >
              View all
            </Button>
          }
        />

        <Grid cols={4}>

          {decks.map((deck) => (
            <HomeDeckCard
              key={`${deck.slug}-${deck.identifier}`}
              deck={deck}
            />
          ))}

        </Grid>

      </Container>

    </Section>
  );
}