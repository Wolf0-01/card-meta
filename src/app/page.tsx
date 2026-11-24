import Link from "next/link";

import {
  ArrowRight,
  Hammer,
  Newspaper,
} from "lucide-react";

import HomeFeedCard from "@/components/home/HomeFeedCard";

import HomeShowcaseCard from "@/components/home/HomeShowcaseCard";

import {
  formatDate,
  formatNumber,
} from "@/lib/format";

import { getHomeData } from "@/lib/home";

export const dynamic = "force-dynamic";

const QUICK_LINK_CLASSES =
  "group flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-700/70 bg-[#0B132B] px-3 text-[9px] font-black uppercase tracking-[0.14em] text-slate-300 transition-colors hover:border-blue-400/70 hover:bg-[#101A36] hover:text-white";

export default async function Home() {
  const data = await getHomeData();

  return (
    <main className="min-h-screen bg-[#070D1F] px-3 py-5 text-slate-100 sm:px-6 sm:py-7">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
              The meta at a glance
            </h1>
          </div>

          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Updated {formatDate(new Date())}
          </p>
        </header>

        <section
          aria-label="Main sections"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <HomeShowcaseCard
            title="Tier List"
            subtitle="The competitive order of the meta"
            href="/tier-list"
            image={data.tierArt}
          />

          <HomeShowcaseCard
            title="Top Decks: Speed"
            subtitle={formatNumber(data.speedDeckCount) + " Speed decks"}
            href="/decks?format=speed"
            image={data.speedDeckArt}
          />

          <HomeShowcaseCard
            title="Top Decks: Rush"
            subtitle={formatNumber(data.rushDeckCount) + " Rush decks"}
            href="/decks?format=rush"
            image={data.rushDeckArt}
          />

          <HomeShowcaseCard
            title="Tournaments"
            subtitle="Results and events"
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
          aria-label="Quick links"
          className="grid max-w-3xl grid-cols-1 gap-2                 sm:grid-cols-2"
        >

          <Link
            href="/decks/new"
            className={QUICK_LINK_CLASSES}
          >
            <Hammer className="h-3.5 w-3.5 shrink-0 text-blue-300" />

            <span>Deck Builder</span>

            <ArrowRight className="ml-auto h-3 w-3 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>

          <Link
            href="/news"
            className={QUICK_LINK_CLASSES}
          >
            <Newspaper className="h-3.5 w-3.5 shrink-0 text-blue-300" />

            <span>News</span>

            <ArrowRight className="ml-auto h-3 w-3 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
          </Link>
        </section>

        <section
          aria-labelledby="latest-updates"
          className="space-y-3"
        >
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">
                Newsroom
              </p>

              <h2
                id="latest-updates"
                className="mt-0.5 text-xl font-black tracking-tight text-white sm:text-2xl"
              >
                Latest tournaments &amp; updates
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/tournaments"
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-300 transition-colors hover:text-blue-200"
              >
                Tournaments
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/news"
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.14em] text-blue-300 transition-colors hover:text-blue-200"
              >
                News &amp; updates
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {data.feed.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-[#0B132B]/60 px-6 py-10 text-center text-xs text-slate-400">
              No tournaments or news published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {data.feed.map((item) => (
                <HomeFeedCard
                  key={item.id}
                  item={item}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
