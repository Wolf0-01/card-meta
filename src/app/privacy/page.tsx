import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Card Meta",
  description:
    "Privacy Policy, cookie usage, and third-party advertising disclosures for Card Meta.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#070D1F] px-4 py-10 text-slate-200 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-slate-800 bg-[#0B132B] p-6 sm:p-10">
        <header className="space-y-2 border-b border-slate-800 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Legal
          </p>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-400">
            Last updated: November 26, 2026
          </p>
        </header>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">1. Overview</h2>
          <p>
            Card Meta (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
            operates a community resource for Yu-Gi-Oh! Duel Links decklists,
            tier lists, tournament results, and strategy guides. This Privacy
            Policy explains how we collect, use, and protect information when
            you browse our website.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">
            2. Information We Collect
          </h2>
          <p>
            You can browse decks, cards, tier lists, and guides without
            creating an account. If you choose to sign in using Discord OAuth to
            submit or manage decklists, we store only your public Discord
            profile identifier, username, display name, and avatar URL to
            attribute your decks and manage session access.
          </p>
          <p>
            Like most websites, our servers and analytics providers may log
            standard technical data such as browser type, device type,
            referring pages, approximate region, and pages visited to keep the
            site fast and reliable.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">
            3. Cookies and Third-Party Advertising (Google AdSense)
          </h2>
          <p>
            We use essential cookies to keep you signed in and remember basic
            preferences. In addition, third-party vendors, including Google,
            use cookies to serve ads based on your prior visits to this website
            or other websites on the internet.
          </p>
          <p>
            Google&apos;s use of advertising cookies enables it and its partners
            to serve relevant advertisements to users based on their visit to
            Card Meta and/or other sites. You may opt out of personalized
            advertising by visiting{" "}
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 underline hover:text-sky-300"
            >
              Google Ads Settings
            </a>{" "}
            or{" "}
            <a
              href="https://aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 underline hover:text-sky-300"
            >
              www.aboutads.info
            </a>
            .
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-slate-300">
          <h2 className="text-lg font-bold text-white">
            4. Data Retention &amp; Your Rights
          </h2>
          <p>
            You may request deletion of your account data or submitted
            decklists at any time by reaching out through our{" "}
            <Link
              href="/contact"
              className="text-sky-400 underline hover:text-sky-300"
            >
              Contact page
            </Link>
            . We do not sell personal information to third parties.
          </p>
        </section>
      </div>
    </main>
  );
}
