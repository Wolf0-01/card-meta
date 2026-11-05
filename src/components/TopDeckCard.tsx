import Link from "next/link";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function TopDeckCard() {
  return (
    <Link href="/top-deck">
      <Card className="p-6">

        <h2
          className="
            text-2xl
            font-bold
            text-foreground
          "
        >
          🔥 Top Deck
        </h2>

        <p
          className="
            mt-3
            text-foreground-secondary
          "
        >
          Los decks más utilizados y competitivos
          actualmente.
        </p>

        <div className="mt-5">
          <Button
            variant="danger"
            className="pointer-events-none"
          >
            Ver Top Deck
          </Button>
        </div>

      </Card>
    </Link>
  );
}