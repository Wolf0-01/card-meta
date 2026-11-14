import Card from "@/components/ui/Card";
import Grid from "@/components/ui/Grid";

import HomeDeckCard from "@/components/HomeDeckCard";

import { MetaDeck } from "@/types/meta";

interface Props {
  title?: string;
  decks: MetaDeck[];
}

export default function RelatedDecks({
  title = "Decks Relacionados",
  decks,
}: Props) {
  if (decks.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">

      <h2
        className="
          text-2xl
          font-bold
          text-foreground
        "
      >
        {title}
      </h2>

      <p
        className="
          mt-2
          text-sm
          text-foreground-muted
        "
      >
        Other decks you might be interested in.
      </p>

      <div className="mt-6">
        <Grid cols={3} gap="lg">

          {decks.map((deck) => (
            <HomeDeckCard
              key={deck.id}
              deck={deck}
            />
          ))}

        </Grid>
      </div>

    </Card>
  );
}