import type { Metadata } from "next";

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  Package,
} from "lucide-react";

import CatalogGrid from "@/components/cards/CatalogGrid";

import {
  RARITY_STYLES,
} from "@/components/cards/cardRarity";

import {
  getCardSetBySlug,
  getCardsForSet,
  groupCardsByRarity,
} from "@/lib/sets";

import { formatSetType } from "@/lib/setSlug";

interface CardSetPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CardSetPageProps): Promise<Metadata> {
  const { slug } = await params;

  const set = await getCardSetBySlug(slug);

  if (!set) {
    return {
      title: "Set no encontrado | Card Meta",
    };
  }

  return {
    title: `${set.name} | Cartas de Duel Links | Card Meta`,

    description: `Explora las ${set.cardCount} cartas disponibles en ${set.name} de Yu-Gi-Oh! Duel Links.`,
  };
}

export default async function CardSetPage({
  params,
}: CardSetPageProps) {
  const { slug } = await params;

  const set = await getCardSetBySlug(slug);

  if (!set) {
    notFound();
  }

  const cards = await getCardsForSet(set.name);

  const groups = groupCardsByRarity(cards);

  return (
    <main
      className="
        min-h-screen
        bg-zinc-950
        px-4
        py-8
        text-slate-100
        sm:px-6
        sm:py-10
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          space-y-6
        "
      >
        <Link
          href="/cards"
          className="
            inline-flex
            items-center
            gap-1.5
            text-[11px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-slate-500
            transition-colors
            hover:text-blue-300
          "
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al catálogo
        </Link>

        <section
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-slate-700/60
            bg-[#0B132B]
            p-5
            shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)]
            sm:p-7
          "
        >
          <div
            aria-hidden
            className="
              pointer-events-none
              absolute
              inset-0
              bg-[radial-gradient(circle_at_15%_-20%,rgba(37,99,235,0.22),transparent_55%),radial-gradient(circle_at_90%_120%,rgba(14,165,233,0.1),transparent_45%)]
            "
          />

          <div
            className="
              relative
              flex
              flex-wrap
              items-start
              justify-between
              gap-4
            "
          >
            <div className="min-w-0">
              <p
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-blue-500/30
                  bg-blue-500/10
                  px-2.5
                  py-1
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-blue-200
                "
              >
                {formatSetType(set.type)}
              </p>

              <h1
                className="
                  mt-3
                  text-3xl
                  font-black
                  leading-tight
                  tracking-tight
                  text-white
                  sm:text-4xl
                "
              >
                {set.name}
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-relaxed
                  text-slate-400
                "
              >
                Cartas de Yu-Gi-Oh! Duel Links
                disponibles en esta caja,
                agrupadas por rareza.
              </p>
            </div>

            <div
              className="
                flex
                shrink-0
                flex-wrap
                items-center
                gap-2
              "
            >
              <span
                className="
                  rounded-lg
                  border
                  border-slate-700/60
                  bg-[#070D1F]/80
                  px-3
                  py-2
                  text-center
                "
              >
                <span
                  className="
                    block
                    text-lg
                    font-black
                    tabular-nums
                    text-white
                  "
                >
                  {cards.length}
                </span>

                <span
                  className="
                    block
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-slate-500
                  "
                >
                  Cartas
                </span>
              </span>
            </div>
          </div>

          {/* Insertar Banner Aquí: reemplazar este bloque por el banner promocional del set */}
          <div
            className="
              relative
              mx-auto
              mt-5
              flex
              aspect-[3/1]
              w-full
              max-w-4xl
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              border
              border-dashed
              border-slate-600/60
              bg-slate-800/50
              md:aspect-[4/1]
            "
          >
            <span
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.24em]
                text-slate-500
              "
            >
              Insertar Banner Aquí
            </span>
          </div>

          {groups.length > 0 && (
            <div
              className="
                relative
                mt-5
                flex
                flex-wrap
                items-center
                gap-1.5
                border-t
                border-slate-700/40
                pt-3
              "
            >
              {groups.map((group) => (
                <span
                  key={group.rarity}
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-md
                    px-2
                    py-1
                    text-[10px]
                    font-black
                    tracking-wide
                    ${RARITY_STYLES[group.rarity].badge}
                  `}
                >
                  {group.rarity}

                  <span className="opacity-70">
                    {group.cards.length}
                  </span>
                </span>
              ))}
            </div>
          )}
        </section>

        {groups.length === 0 ? (
          <section
            className="
              rounded-2xl
              border
              border-dashed
              border-slate-700
              bg-[#0B132B]/60
              px-6
              py-16
              text-center
            "
          >
            <Package
              className="
                mx-auto
                h-8
                w-8
                text-slate-600
              "
            />

            <p
              className="
                mt-3
                text-sm
                font-bold
                text-slate-300
              "
            >
              No hay cartas registradas para
              este set.
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Vuelve al catálogo para explorar
              las demás cartas.
            </p>
          </section>
        ) : (
          groups.map((group) => (
            <section
              key={group.rarity}
              aria-labelledby={`rarity-${group.rarity}`}
              className="
                rounded-2xl
                border
                border-slate-700/60
                bg-[#0B132B]
                p-4
                sm:p-5
              "
            >
              <div
                className="
                  mb-3
                  flex
                  items-center
                  gap-3
                  border-b
                  border-slate-700/40
                  pb-2
                "
              >
                <span
                  aria-hidden
                  className={`
                    h-1.5
                    w-8
                    rounded-full
                    ${RARITY_STYLES[group.rarity].strip}
                    ${RARITY_STYLES[group.rarity].glow}
                  `}
                />

                <h2
                  id={`rarity-${group.rarity}`}
                  className="
                    text-sm
                    font-black
                    uppercase
                    tracking-[0.18em]
                    text-white
                  "
                >
                  {group.rarity}
                </h2>

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-slate-500
                  "
                >
                  {group.cards.length} cartas
                </span>
              </div>

              <CatalogGrid
                cards={group.cards}
                gridClassName="
                  grid-cols-4
                  gap-2
                  sm:grid-cols-6
                  lg:grid-cols-7
                  xl:grid-cols-8
                "
              />
            </section>
          ))
        )}
      </div>
    </main>
  );
}
