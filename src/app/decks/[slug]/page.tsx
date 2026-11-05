import ArchetypeHeader from "@/components/decks/ArchetypeHeader";
import DeckList from "@/components/decks/DeckList";

import { getDecksBySlug } from "@/lib/decks";

import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DeckPage({
  params,
}: Props) {
  const { slug } = await params;

  const decks = await getDecksBySlug(slug);

  if (decks.length === 0) {
    notFound();
  }

  const mainDeck = decks[0];

  return (
    <main
      className="
        min-h-screen
        bg-zinc-950
        text-white
        p-6
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          space-y-8
        "
      >
        <ArchetypeHeader deck={mainDeck} />

        <section>
          <h2
            className="
              mb-5
              text-2xl
              font-bold
            "
          >
            Competitive Builds
          </h2>

          <DeckList decks={decks} />
        </section>
      </div>
    </main>
  );
}