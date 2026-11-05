import Link from "next/link";

import NewsCard from "@/components/NewsCard";
import TournamentCard from "@/components/TournamentCard";
import HomeDeckCard from "@/components/HomeDeckCard";
import TierListLinkCard from "@/components/home/TierListLinkCard";
import TopDeckCard from "@/components/TopDeckCard";

import {
findFeaturedDecks,
} from "@/services/decks";

export default async function Home() {
const featuredDecks =
await findFeaturedDecks();

return ( <main
   className="
     min-h-screen
     bg-zinc-950
     text-white
   "
 >
{/* HERO */}


  <section
    className="
      relative
      mx-auto
      max-w-7xl
      overflow-hidden
      px-10
      py-20
    "
  >
    <div
      className="
        absolute
        inset-0
        bg-gradient-to-r
        from-blue-900/20
        via-zinc-950
        to-purple-900/20
      "
    />

    <div
      className="
        relative
        max-w-3xl
      "
    >
      <h1
        className="
          text-5xl
          font-extrabold
          tracking-tight
          md:text-6xl
        "
      >
        El Meta de Duel Links

        <span className="text-blue-500">
          {" "}en un solo lugar
        </span>
      </h1>

      <p
        className="
          mt-6
          text-lg
          text-zinc-400
          md:text-xl
        "
      >
        Explora decks competitivos,
        tier lists,
        cartas,
        torneos y las últimas novedades
        de Yu-Gi-Oh! Duel Links.
      </p>

      <div
        className="
          mt-8
          flex
          flex-wrap
          gap-4
        "
      >
        <Link
          href="/decks"
          className="
            rounded-lg
            bg-blue-600
            px-6
            py-3
            font-semibold
            hover:bg-blue-500
          "
        >
          Explorar Decks
        </Link>

        <Link
          href="/cards"
          className="
            rounded-lg
            border
            border-zinc-700
            px-6
            py-3
            font-semibold
            hover:bg-zinc-800
          "
        >
          Ver Cartas
        </Link>
      </div>
    </div>
  </section>

  {/* NOTICIAS */}

  <section
    className="
      mx-auto
      max-w-7xl
      p-10
    "
  >
    <h2
      className="
        mb-5
        text-2xl
        font-bold
      "
    >
      📰 Últimas Noticias
    </h2>

    <div
      className="
        grid
        grid-cols-1
        gap-5
        md:grid-cols-3
      "
    >
      <NewsCard />
      <NewsCard />
      <NewsCard />
    </div>
  </section>

  {/* TORNEOS */}

  <section
    className="
      mx-auto
      max-w-7xl
      p-10
    "
  >
    <h2
      className="
        mb-5
        text-2xl
        font-bold
      "
    >
      🏆 Próximos Torneos
    </h2>

    <div
      className="
        grid
        grid-cols-1
        gap-5
        md:grid-cols-3
      "
    >
      <TournamentCard />
      <TournamentCard />
      <TournamentCard />
    </div>
  </section>

  {/* DECKS DESTACADOS */}

  <section
    className="
      mx-auto
      max-w-7xl
      p-10
    "
  >
    <div
      className="
        mb-5
        flex
        items-center
        justify-between
      "
    >
      <h2
        className="
          text-2xl
          font-bold
        "
      >
        🃏 Decks Destacados
      </h2>

      <Link
        href="/decks"
        className="
          text-blue-400
          hover:text-blue-300
        "
      >
        Ver todos →
      </Link>
    </div>

    <div
      className="
        grid
        grid-cols-1
        gap-5
        md:grid-cols-3
      "
    >
      {featuredDecks.map((deck) => (
        <HomeDeckCard
          key={deck.identifier}
          deck={deck}
        />
      ))}
    </div>
  </section>

  {/* TIER LIST + TOP DECK */}

  <section
    className="
      mx-auto
      grid
      max-w-7xl
      grid-cols-1
      gap-6
      p-10
      lg:grid-cols-2
    "
  >
    <TierListLinkCard />

    <TopDeckCard />
  </section>
</main>


);
}
