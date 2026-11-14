import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section
      className="
        border-b
        border-border
        bg-gradient-to-b
        from-background
        to-surface
      "
    >
      <Container>

        <div
          className="
            flex
            flex-col
            items-center
            py-20
            text-center
          "
        >

          <span
            className="
              rounded-full
              border
              border-primary/30
              bg-primary/10
              px-4
              py-1
              text-sm
              font-semibold
              text-primary
            "
          >
            Yu-Gi-Oh! Duel Links
          </span>

          <h1
            className="
              mt-6
              text-5xl
              font-black
              tracking-tight
              text-foreground
              lg:text-6xl
            "
          >
            Card Meta
          </h1>

          <p
            className="
              mt-6
              max-w-3xl
              text-lg
              leading-8
              text-foreground-secondary
            "
          >
            Explore the best competitive decks, check the Tier List,
            search cards and stay up to date with the Duel Links meta.
          </p>

          <div
            className="
              mt-10
              flex
              flex-wrap
              justify-center
              gap-4
            "
          >

            <Button href="/decks">
              View Decks
            </Button>

            <Button
              href="/tier-list"
              variant="outline"
            >
              Tier List
            </Button>

          </div>

        </div>

      </Container>
    </section>
  );
}