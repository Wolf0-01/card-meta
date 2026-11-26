import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Card Meta",
  description:
    "Learn about Card Meta, our mission for the Yu-Gi-Oh! Duel Links competitive community, and our tools.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#070D1F] px-4 py-10 text-slate-200 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-[#0B132B] p-6 sm:p-10">
        <header className="space-y-2 border-b border-slate-800 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Community Platform
          </p>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            About Card Meta
          </h1>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <p>
            <strong className="text-white">Card Meta</strong> is a dedicated
            competitive hub built for Yu-Gi-Oh! Duel Links players across both{" "}
            <strong className="text-white">Speed Duel</strong> and{" "}
            <strong className="text-white">Rush Duel</strong> formats. Our goal
            is to make deckbuilding, tournament tracking, and meta research
            fast, transparent, and accessible on any device.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">What We Offer</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-white">Top Decks &amp; KC Cup Lists:</strong>{" "}
              Curated King of Games, KC Cup Top 100, and community tournament
              decklists organized by archetype.
            </li>
            <li>
              <strong className="text-white">Gem Cost Breakdown:</strong>{" "}
              Automatic box-by-box gem estimation so players can plan their
              investments before opening packs.
            </li>
            <li>
              <strong className="text-white">Tier List &amp; Guides:</strong>{" "}
              Up-to-date competitive rankings, archetype breakdowns, combo
              lines, and matchup notes written by experienced duelists.
            </li>
            <li>
              <strong className="text-white">Interactive Deck Builder:</strong>{" "}
              Build, validate against active Forbidden/Limited lists, and share
              decklists directly on Discord and social platforms.
            </li>
          </ul>
        </section>

        <section className="space-y-3 border-t border-slate-800 pt-5 text-sm leading-relaxed text-slate-300">
          <p>
            Have feedback, tournament results to share, or partnership
            inquiries? Visit our{" "}
            <Link
              href="/contact"
              className="text-sky-400 underline hover:text-sky-300"
            >
              Contact page
            </Link>{" "}
            to get in touch with our editorial team.
          </p>
        </section>
      </div>
    </main>
  );
}
