import Image from "next/image";
import Link from "next/link";

import {
  CalendarDays,
  UserRound,
} from "lucide-react";

import { DuelLinksGemIcon } from "@/components/ui/DuelLinksIcons";


import { getCardImageSrc } from "@/lib/cards/image";

import { pickDeckEmblem } from "@/lib/decks/emblem";

import { getDeckArchetypeLabel } from "@/lib/decks/archetypeLabel";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import {
  estimateDeckGemCost,
  formatGemCost,
} from "@/lib/decks/gemCost";

import { formatDate } from "@/lib/format";

import type { MetaDeck } from "@/types/meta";

interface PublicDeckCardProps {
  deck: MetaDeck;
}

/**
 * Tarjeta compacta del explorador público, inspirada en
 * las filas de mazos de Duel Links Meta.
 */
export default function PublicDeckCard({
  deck,
}: PublicDeckCardProps) {
  const emblem = pickDeckEmblem(deck);

  const imageSrc = getCardImageSrc(emblem?.card);

  const gemCost = estimateDeckGemCost(deck);

  const archetype =
    getDeckArchetypeLabel(deck);

  const author =
    deck.author?.displayName?.trim() ||
    deck.author?.username ||
    "Anonymous";

  const authorHandle =
    deck.author?.username ?? null;

  const deckHref = `/decks/${deck.slug}/${deck.identifier}`;

  return (
    <article
      className="
        group
        rounded-xl
        border
        border-slate-700/60
        bg-[#0B132B]
        p-2.5
        ring-1
        ring-inset
        ring-white/5
        transition-all
        duration-200
        hover:border-blue-400/70
        hover:bg-[#101A36]
        hover:shadow-[0_0_24px_rgba(59,130,246,0.16)]
      "
    >
      <div className="flex gap-3">
        <Link
          href={deckHref}
          aria-label={`Open ${deck.name}`}
          className="
            relative
            aspect-[59/86]
            w-[62px]
            shrink-0
            overflow-hidden
            rounded-lg
            border
            border-slate-700/80
            bg-slate-800
            shadow-sm
            sm:w-[68px]
          "
        >
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={emblem?.card.name ?? deck.name}
              fill
              sizes="72px"
              className="
                object-cover
                transition-transform
                duration-200
                group-hover:scale-[1.04]
              "
            />
          ) : (
            <div
              aria-hidden
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.35),transparent_70%)]
                text-[9px]
                font-black
                uppercase
                tracking-widest
                text-slate-500
              "
            >
              Deck
            </div>
          )}

          <span
            aria-hidden
            className="
              pointer-events-none
              absolute
              inset-x-0
              top-0
              h-[3px]
              bg-gradient-to-r
              from-blue-400
              via-sky-400
              to-indigo-400
            "
          />
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={deckHref}
            className="block"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3
                  className="
                    truncate
                    text-sm
                    font-black
                    leading-4
                    text-white
                    transition-colors
                    group-hover:text-blue-100
                  "
                >
                  {deck.name}
                </h3>

                <p
                  className="
                    mt-0.5
                    flex
                    flex-wrap
                    items-center
                    gap-1
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-slate-500
                  "
                >
                  <span className="truncate">
                    {archetype}
                  </span>

                  {deck.tier && (
                    <span
                      className="
                        rounded
                        border
                        border-blue-500/30
                        bg-blue-500/10
                        px-1
                        py-0.5
                        text-[8px]
                        font-black
                        tracking-wide
                        text-blue-200
                      "
                    >
                      {deck.tier}
                    </span>
                  )}
                </p>
              </div>

              <span
                className="
                  shrink-0
                  rounded-md
                  border
                  border-slate-700/70
                  bg-[#070D1F]
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.1em]
                  text-slate-400
                "
              >
                {getDuelFormatLabel(deck.format)}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                aria-hidden
                className="
                  inline-block
                  h-1.5
                  w-1.5
                  shrink-0
                  rotate-45
                  border
                  border-amber-300/90
                  bg-amber-400/30
                  shadow-[0_0_7px_rgba(251,191,36,0.7)]
                "
              />

              <span
                className="
                  truncate
                  text-[10px]
                  font-semibold
                  text-amber-200
                "
              >
                {deck.skill ?? "No skill equipped"}
              </span>
            </div>

            <div
              className="
                mt-2
                flex
                flex-wrap
                items-center
                gap-x-3
                gap-y-1
                text-[9px]
                font-bold
                uppercase
                tracking-wide
                text-slate-500
              "
            >
              <span>
                Main{" "}
                <b className="text-slate-200">
                  {deck.mainCards ?? 0}
                </b>
              </span>

              <span>
                Extra{" "}
                <b className="text-slate-200">
                  {deck.extraCards ?? 0}
                </b>
              </span>

              <span className="inline-flex items-center gap-1 text-amber-300/90">
                <DuelLinksGemIcon className="h-3.5 w-3.5 shrink-0" />

                {formatGemCost(gemCost)}
              </span>
            </div>
          </Link>

          <div
            className="
              mt-1.5
              flex
              flex-wrap
              items-center
              gap-x-3
              gap-y-1
              text-[9px]
              text-slate-500
            "
          >
            <span className="inline-flex min-w-0 items-center gap-1">
              <UserRound className="h-3 w-3 shrink-0" />

              {authorHandle ? (
                <Link
                  href={`/user/${authorHandle}`}
                  className="
                    truncate
                    transition-colors
                    hover:text-blue-300
                  "
                >
                  {author}
                </Link>
              ) : (
                <span className="truncate">
                  {author}
                </span>
              )}
            </span>

            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3 w-3 shrink-0" />

              {formatDate(deck.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
