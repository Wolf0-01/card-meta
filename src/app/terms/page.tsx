import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Card Meta",
  description:
    "Terms of Service, intellectual property notice, and community guidelines for Card Meta.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[#070D1F] px-4 py-10 text-slate-200 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-[#0B132B] p-6 sm:p-10">
        <header className="space-y-2 border-b border-slate-800 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Legal
          </p>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-400">
            Last updated: November 26, 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Card Meta, you agree to comply with these
            Terms of Service. If you do not agree with any part of these terms,
            please discontinue using the website.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">
            2. Intellectual Property &amp; Fan-Site Disclaimer
          </h2>
          <p>
            Card Meta is an independent, unofficial community fan website
            created for educational and informational purposes. Yu-Gi-Oh!,
            Yu-Gi-Oh! Duel Links, card artwork, card names, and related
            trademarks are the sole property of Studio Dice / SHUEISHA, TV
            TOKYO, and Konami Digital Entertainment. Card Meta is not
            affiliated with, endorsed, sponsored, or approved by Konami.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">
            3. User-Submitted Content
          </h2>
          <p>
            Users who submit decklists, notes, or tournament entries retain
            ownership of their original written notes while granting Card Meta
            a non-exclusive, worldwide, royalty-free license to display, format,
            and index those decklists across the site. You agree not to submit
            spam, offensive material, or misleading tournament claims.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">
            4. Disclaimer of Warranties
          </h2>
          <p>
            All decklists, gem cost estimates, tier rankings, and card data are
            provided &quot;as is&quot; for informational purposes. In-game box
            availability, banlists, and skill effects may change with game
            updates.
          </p>
        </section>
      </div>
    </main>
  );
}
