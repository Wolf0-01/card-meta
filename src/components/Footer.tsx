import Link from "next/link";

const SOCIAL_LINKS = {
  discord: "https://discord.gg/VpacQDFPEz",
  twitch: "https://www.twitch.tv/thewolftp",
  youtube: "https://www.youtube.com/@WolfTP",
  
};

function DiscordLogo({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 127.14 96.36"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-slate-800/80 bg-[#050B1C] px-4 py-10 text-slate-200 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Banner panorámico estilo Duel Links Meta */}
        <a
          href={SOCIAL_LINKS.discord}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-xl border border-sky-500/35 bg-gradient-to-r from-[#061838] via-[#092452] to-[#051533] p-6 shadow-xl shadow-black/40 transition-all hover:border-sky-400/70 hover:shadow-sky-950/50 sm:px-10 sm:py-7"
        >
          {/* Patrón de nodos/cuadrícula tech de fondo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, #38bdf8 1px, transparent 1px), radial-gradient(circle at 75% 65%, #38bdf8 1.5px, transparent 1.5px), linear-gradient(to right, rgba(56,189,248,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(56,189,248,0.14) 1px, transparent 1px)",
              backgroundSize: "48px 48px, 64px 64px, 32px 32px, 32px 32px",
            }}
          />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            {/* Bloque izquierdo: Logo Discord + Estado activo + CTA */}
            <div className="space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#071B3E] shadow-md transition-transform group-hover:scale-105">
                  <DiscordLogo className="h-9 w-9" />
                </div>
                <div>
                  <span className="block text-2xl font-black tracking-wider text-white sm:text-3xl">
                    DISCORD
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300">
                    Card Meta Official Server
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-bold tracking-wider text-slate-200">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  ONLINE NOW
                </span>
                <span className="text-slate-500">•</span>
                <span className="uppercase tracking-[0.14em] text-sky-300 transition-colors group-hover:text-white">
                  JOIN THE COMMUNITY →
                </span>
              </div>
            </div>

            {/* Bloque derecho: Top Player Community + Viñetas */}
            <div className="space-y-2 md:max-w-md">
              <h2 className="text-lg font-black uppercase tracking-wide text-white sm:text-xl">
                TOP PLAYER COMMUNITY
              </h2>
              <ul className="space-y-1 text-xs text-slate-200/90 sm:text-[13px]">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                  Weekly Tournaments, Deck Breakdowns &amp; Tier List Updates
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                  Top Player Discussions with the best duelists in the meta
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" />
                  New Player Help, Deck Reviews &amp; Event Alerts
                </li>
              </ul>
            </div>
          </div>
        </a>

        {/* Botones cuadrados de redes sociales centrados */}
        <div className="flex items-center justify-center gap-3">
          <a
            href={SOCIAL_LINKS.discord}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-[#0B1530] text-slate-200 transition-all hover:-translate-y-0.5 hover:border-sky-400/60 hover:bg-[#112047] hover:text-white"
          >
            <DiscordLogo className="h-5 w-5" />
          </a>

          <a
            href={SOCIAL_LINKS.twitch}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitch"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-[#0B1530] text-slate-200 transition-all hover:-translate-y-0.5 hover:border-sky-400/60 hover:bg-[#112047] hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M4.265 3 3 6.236v13.223h4.502V21l2.531.85 2.392-2.391h3.658l4.923-4.924V3H4.265zm15.052 10.691-2.813 2.814h-4.502l-2.391 2.391v-2.391H5.813V4.688h13.504v9.003zm-2.812-5.767v4.923h-1.688V7.924h1.688zm-4.502 0v4.923h-1.688V7.924h1.688z" />
            </svg>
          </a>

          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/80 bg-[#0B1530] text-slate-200 transition-all hover:-translate-y-0.5 hover:border-sky-400/60 hover:bg-[#112047] hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>

        </div>

        {/* Copyright + Navegación rápida */}
        <div className="space-y-2 text-center text-xs text-slate-400">
          <p>© 2026 Card Meta · Competitive Yu-Gi-Oh! Duel Links Hub</p>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center justify-center gap-2 text-slate-400"
          >
            <Link href="/cards" className="transition hover:text-white">
              Cards
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/decks" className="transition hover:text-white">
              Top Decks
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/tier-list" className="transition hover:text-white">
              Tier List
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/tournaments" className="transition hover:text-white">
              Tournaments
            </Link>
            <span className="text-slate-600">|</span>
            <Link href="/news" className="transition hover:text-white">
              News
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
