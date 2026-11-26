import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us | Card Meta",
  description:
    "Contact the Card Meta team for support, tournament submissions, corrections, or inquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#070D1F] px-4 py-10 text-slate-200 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-[#0B132B] p-6 sm:p-10">
        <header className="space-y-2 border-b border-slate-800 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Support &amp; Inquiries
          </p>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Contact Card Meta
          </h1>
          <p className="text-sm text-slate-400">
            Questions, bug reports, tournament coverage, or data requests.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-[#070D1F]/70 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400">
              Editorial &amp; Support Email
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              For general inquiries, privacy requests, or advertising
              questions, write to us at:
            </p>
            <a
              href="mailto:contact@cardmeta.gg"
              className="mt-3 inline-block font-semibold text-white underline hover:text-sky-300"
            >
              contact@cardmeta.gg
            </a>
            <p className="mt-2 text-xs text-slate-500">
              We typically respond within 24–48 hours.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#070D1F]/70 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-sky-400">
              Submit Decks &amp; Guides
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Want to publish your King of Games or tournament decklist? Sign in
              with Discord and use our builder:
            </p>
            <Link
              href="/decks/new"
              className="mt-3 inline-block font-semibold text-white underline hover:text-sky-300"
            >
              Open Deck Builder →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
