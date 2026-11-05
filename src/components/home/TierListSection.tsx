import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Grid from "@/components/ui/Grid";
import Section from "@/components/ui/Section";
import SectionHeader from "@/components/ui/SectionHeader";

import TierListCard from "@/components/TierListCard";

export interface TierDeck {
id: number;
name: string;
tier: string;
archetype?: string;
slug: string;
}

interface TierListSectionProps {
decks: TierDeck[];
}

export default function TierListSection({
decks,
}: TierListSectionProps) {
return ( <Section> <Container>
<SectionHeader
title="Tier List"
subtitle="Los mejores decks competitivos del formato actual."
action={ <Button
           href="/tier-list"
           variant="outline"
         >
Ver Tier List </Button>
}
/>


    <Grid cols={3}>
      {decks.map((deck) => (
        <TierListCard
          key={deck.id}
          deck={deck}
        />
      ))}
    </Grid>
  </Container>
</Section>


);
}
