import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarDays,
  Package,
} from "lucide-react";

import { formatDate } from "@/lib/format";

import { getAllSetsWithBanners } from "@/lib/sets";

export const metadata: Metadata = {
  title: "Todas las expansiones | Card Meta",

  description:
    "Explora todas las cajas y expansiones de Yu-Gi-Oh! Duel Links, ordenadas por fecha de lanzamiento.",
};

export default async function SetsIndexPage() {
  const sets = await getAllSetsWithBanners();

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
          space-y-4
        "
      >
        <header>
          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.18em]
              text-slate-500
              transition-colors
              hover:text-blue-300
            "
          >
            <ArrowLeft className="h-3 w-3" />
            Inicio
          </Link>

          <h1
            className="
              mt-1
              text-2xl
              font-black
              uppercase
              tracking-tight
              text-white
              sm:text-3xl
            "
          >
            All Sets
          </h1>

          <p
            className="
              mt-1
              max-w-xl
              text-[11px]
              leading-relaxed
              text-slate-400
            "
          >
            Todas las cajas y expansiones de
            Yu-Gi-Oh! Duel Links con banner
            oficial, de la más reciente a la
            más antigua.
          </p>

          <p
            className="
              mt-2
              inline-flex
              items-center
              gap-1.5
              rounded-md
              border
              border-slate-700/70
              bg-[#0B132B]
              px-2
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-slate-400
            "
          >
            <Package className="h-3 w-3 text-blue-300" />
            <span className="tabular-nums text-slate-200">
              {sets.length}
            </span>
            expansiones
          </p>
        </header>

        {sets.length === 0 ? (
          <section
            className="
              rounded-xl
              border
              border-dashed
              border-slate-700
              bg-[#0B132B]/60
              px-6
              py-14
              text-center
            "
          >
            <Package className="mx-auto h-7 w-7 text-slate-600" />

            <p className="mt-2 text-sm font-bold text-slate-300">
              No hay expansiones con banner.
            </p>

            <Link
              href="/cards"
              className="
                mt-2
                inline-block
                text-[10px]
                font-black
                uppercase
                tracking-[0.14em]
                text-blue-300
                transition-colors
                hover:text-blue-200
              "
            >
              Ir al catálogo de cartas
            </Link>
          </section>
        ) : (
          <section
            aria-label="Expansiones"
            className="
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
            {sets.map((set) => (
              <Link
                key={set.slug}
                href={`/articles/sets/${set.slug}`}
                className="
                  group
                  relative
                  flex
                  min-h-[132px]
                  flex-col
                  justify-end
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-700/60
                  bg-[#0B132B]
                  p-3
                  ring-1
                  ring-inset
                  ring-white/5
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-blue-400/70
                  hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]
                "
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={set.bannerUrl}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    object-center
                    opacity-80
                    transition-transform
                    duration-300
                    group-hover:scale-105
                    group-hover:opacity-100
                  "
                />

                <span
                  aria-hidden
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-slate-950
                    via-slate-950/60
                    to-transparent
                  "
                />

                <span className="relative">
                  <span
                    className="
                      block
                      text-sm
                      font-black
                      uppercase
                      leading-tight
                      tracking-[0.05em]
                      text-white
                    "
                  >
                    {set.name}
                  </span>

                  <span
                    className="
                      mt-1
                      inline-flex
                      items-center
                      gap-1
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-slate-300
                    "
                  >
                    <CalendarDays className="h-3 w-3" />
                    {formatDate(set.releasedAt)}
                  </span>
                </span>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
