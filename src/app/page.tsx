import Link from "next/link";

import {
  ArrowRight,
  Hammer,
  Newspaper,
  Trophy,
} from "lucide-react";

import PublicDeckCard from "@/components/decks/PublicDeckCard";

import HomeShowcaseCard from "@/components/home/HomeShowcaseCard";

import {
  formatDate,
  formatNumber,
} from "@/lib/format";

import { getHomeData } from "@/lib/home";

const QUICK_LINK_CLASSES = `
  group
  flex
  h-11
  items-center
  justify-center
  gap-2
  rounded-lg
  border
  border-slate-700/70
  bg-[#0B132B]
  px-3
  text-[9px]
  font-black
  uppercase
  tracking-[0.14em]
  text-slate-300
  transition-colors
  hover:border-blue-400/70
  hover:bg-[#101A36]
  hover:text-white
`;

export default async function Home() {
  const data = await getHomeData();

  return (
    <main
      className="
        min-h-screen
        bg-[#070D1F]
        px-3
        py-5
        text-slate-100
        sm:px-6
        sm:py-7
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          space-y-5
        "
      >
        <header
          className="
            flex
            flex-wrap
            items-end
            justify-between
            gap-2
          "
        >
          <div>
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.24em]
                text-blue-300
              "
            >
              Card Meta · Duel Links
            </p>

            <h1
              className="
                mt-1
                text-2xl
                font-black
                tracking-tight
                text-white
                sm:text-3xl
              "
            >
              El meta, en un vistazo
            </h1>
          </div>

          <p
            className="
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-slate-500
            "
          >
            Actualizado {formatDate(new Date())}
          </p>
        </header>

        <section
          aria-label="Accesos principales"
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          <HomeShowcaseCard
            title="Tier List"
            subtitle="El orden competitivo del meta"
            href="/tier-list"
            image={data.tierArt}
          />

          <HomeShowcaseCard
            title="Top Decks: Speed"
            subtitle={`${formatNumber(
              data.speedDeckCount
            )} mazos Speed`}
            href="/decks?format=speed"
            image={data.speedDeckArt}
          />

          <HomeShowcaseCard
            title="Top Decks: Rush"
            subtitle={`${formatNumber(
              data.rushDeckCount
            )} mazos Rush`}
            href="/decks?format=rush"
            image={data.rushDeckArt}
          />

          <HomeShowcaseCard
            title="Tournaments"
            subtitle="Resultados y torneos"
            href="/tournaments"
            image={data.tournamentArt}
          />

          <HomeShowcaseCard
            title="News & Updates"
            subtitle="Game news"
            href="/news"
            image={data.newsArt}
          />

          <HomeShowcaseCard
            title="Guides"
            subtitle="Guides collection"
            href="/guides"
            image={data.guidesArt}
          />
        </section>

        <section
          aria-label="Accesos rápidos"
          className="
            grid
            grid-cols-1
            gap-2
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          <Link
            href="/decks/new"
            className={QUICK_LINK_CLASSES}
          >
            <Hammer className="h-3.5 w-3.5 shrink-0 text-blue-300" />

            <span>Deck Builder</span>

            <ArrowRight
              className="
                ml-auto
                h-3
                w-3
                opacity-40
                transition-transform
                group-hover:translate-x-0.5
                group-hover:opacity-100
              "
            />
          </Link>

          <Link
            href="/tournaments"
            className={QUICK_LINK_CLASSES}
          >
            <Trophy className="h-3.5 w-3.5 shrink-0 text-blue-300" />

            <span>Tournaments</span>

            <ArrowRight
              className="
                ml-auto
                h-3
                w-3
                opacity-40
                transition-transform
                group-hover:translate-x-0.5
                group-hover:opacity-100
              "
            />
          </Link>

          <Link
            href="/news"
            className={QUICK_LINK_CLASSES}
          >
            <Newspaper className="h-3.5 w-3.5 shrink-0 text-blue-300" />

            <span>News</span>

            <ArrowRight
              className="
                ml-auto
                h-3
                w-3
                opacity-40
                transition-transform
                group-hover:translate-x-0.5
                group-hover:opacity-100
              "
            />
          </Link>
        </section>

        <section
          aria-labelledby="recent-decks"
          className="space-y-3"
        >
          <div
            className="
              flex
              flex-wrap
              items-end
              justify-between
              gap-2
            "
          >
            <div>
              <p
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-blue-300
                "
              >
                Comunidad
              </p>

              <h2
                id="recent-decks"
                className="
                  mt-0.5
                  text-xl
                  font-black
                  tracking-tight
                  text-white
                  sm:text-2xl
                "
              >
                Últimos mazos publicados
              </h2>
            </div>

            <Link
              href="/decks"
              className="
                inline-flex
                items-center
                gap-1
                text-[10px]
                font-black
                uppercase
                tracking-[0.14em]
                text-blue-300
                transition-colors
                hover:text-blue-200
              "
            >
              Ver todos los mazos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {data.recentDecks.length === 0 ? (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-slate-700
                bg-[#0B132B]/60
                px-6
                py-10
                text-center
                text-xs
                text-slate-400
              "
            >
              Todavía no hay mazos públicos.
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                gap-2.5
                md:grid-cols-2
              "
            >
              {data.recentDecks.map((deck) => (
                <PublicDeckCard
                  key={deck.identifier}
                  deck={deck}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
