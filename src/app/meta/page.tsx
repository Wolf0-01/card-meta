import TierList from "@/components/TierList";
import MetaStatsCard from "@/components/meta/MetaStats";

import {
  getTierDecks,
  getMetaSummary
} from "@/lib/decks";

export default async function MetaPage() {

  const decks = await getTierDecks();
  const stats = await getMetaSummary();

  return (
    <main
      className="
      min-h-screen
      bg-zinc-950
      text-white
      p-6
    "
    >
      <div className="max-w-6xl mx-auto">

        <header className="mb-8">

          <h1
            className="
            text-4xl
            font-black
            text-center
            mb-3
          "
          >
            🔥 Meta Actual
          </h1>

          <p
            className="
            text-zinc-400
            text-center
          "
          >
            Ranking competitivo de decks actualizado.
          </p>

        </header>

        <MetaStatsCard stats={stats} />

        <section className="mt-8">

          <TierList decks={decks} />

        </section>

      </div>
    </main>
  );
}