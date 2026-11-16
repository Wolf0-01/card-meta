import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  Crown,
  Layers,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

import TournamentActions from "@/components/tournaments/TournamentActions";

import {
  formatDate,
  formatNumber,
} from "@/lib/format";

import type {
  TournamentEvent,
  TournamentPlacement,
} from "@/lib/tournaments";

interface TournamentResultCardProps {
  event: TournamentEvent;

  canManage?: boolean;
}

const PLACE_STYLES: Record<number, string> = {
  1: "border-amber-300/50 bg-amber-400/15 text-amber-200",
  2: "border-slate-300/40 bg-slate-300/10 text-slate-200",
  3: "border-orange-400/40 bg-orange-400/10 text-orange-200",
};

export default function TournamentResultCard({
  event,
  canManage = false,
}: TournamentResultCardProps) {
  const champion = event.champion;

  const championCard = champion.signatureCard;

  const championDeck = champion.deck;

  const championHref =
    championDeck?.href ?? champion.archetypeHref;

  return (
    <article
      className="
        overflow-hidden
        rounded-xl
        border
        border-slate-700/60
        bg-[#0B132B]
        ring-1
        ring-inset
        ring-white/5
      "
    >
      <header
        className="
          overflow-hidden
          border-b
          border-slate-700/50
          bg-[#0A1128]
        "
      >
        {event.bannerUrl && (
          <div className="relative h-24 w-full overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.bannerUrl}
              alt={`${event.name} banner`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />

            <span
              aria-hidden
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-[#0A1128]
                via-[#0A1128]/30
                to-transparent
              "
            />
          </div>
        )}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2
            px-3
            py-2.5
          "
        >
        <span
          aria-hidden
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            border-blue-500/30
            bg-blue-500/10
            text-blue-300
          "
        >
          <Trophy className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h2
              className="
                truncate
                text-sm
                font-black
                text-white
              "
            >
              {event.name}
            </h2>

            <span
              className={`
                rounded
                border
                px-1
                py-0.5
                text-[7px]
                font-black
                uppercase
                tracking-[0.12em]
                ${
                  event.organizer === "Meta Weekly"
                    ? "border-violet-400/30 bg-violet-400/10 text-violet-200"
                    : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                }
              `}
            >
              {event.organizer}
            </span>
          </div>

          <p
            className="
              mt-0.5
              flex
              flex-wrap
              items-center
              gap-x-2
              gap-y-0.5
              text-[8px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            <span className="inline-flex items-center gap-1">
              <Swords className="h-2.5 w-2.5" />
              {event.format}
            </span>

            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-2.5 w-2.5" />
              {formatDate(event.date)}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className="
              inline-flex
              items-center
              gap-1
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
              text-slate-300
            "
          >
            <Users className="h-2.5 w-2.5 text-blue-300" />

            {formatNumber(event.players)}
          </span>

          <span
            className="
              rounded-md
              border
              border-amber-400/30
              bg-amber-400/10
              px-1.5
              py-0.5
              text-[8px]
              font-black
              uppercase
              tracking-[0.1em]
              text-amber-200
            "
          >
            Top {event.topCount}
          </span>
        </div>

        {canManage && (
          <TournamentActions
            tournamentId={event.id}
            slug={event.slug}
          />
        )}
        </div>
      </header>

      <div className="space-y-2 p-2.5">
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-2.5
            rounded-lg
            border
            border-amber-400/25
            bg-gradient-to-r
            from-amber-500/10
            via-amber-500/5
            to-transparent
            p-2
          "
        >
          <div
            className="
              relative
              aspect-[59/86]
              w-[52px]
              shrink-0
              overflow-hidden
              rounded-md
              border
              border-amber-300/40
              bg-slate-800
              shadow-[0_0_18px_rgba(251,191,36,0.15)]
              sm:w-[58px]
            "
          >
            {championCard?.image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={championCard.image}
                  alt={championCard.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />

                <span
                  aria-hidden
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-6
                    bg-gradient-to-b
                    from-black/70
                    to-transparent
                  "
                />
              </>
            ) : (
              <div
                aria-hidden
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  text-amber-300/70
                "
              >
                <Crown className="h-5 w-5" />
              </div>
            )}

            <span
              className="
                absolute
                left-1
                top-1
                flex
                h-4
                w-4
                items-center
                justify-center
                rounded
                border
                border-amber-300/60
                bg-slate-950/80
                text-[8px]
                font-black
                text-amber-200
              "
            >
              1
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                inline-flex
                items-center
                gap-1
                text-[8px]
                font-black
                uppercase
                tracking-[0.16em]
                text-amber-300
              "
            >
              <Crown className="h-2.5 w-2.5" />
              Champion
            </p>

            <p
              className="
                truncate
                text-sm
                font-black
                leading-tight
                text-white
              "
            >
              {champion.player}
            </p>

            <p
              className="
                truncate
                text-[9px]
                font-bold
                uppercase
                tracking-[0.1em]
                text-slate-400
              "
            >
              {champion.archetype}
            </p>

            {championCard && (
              <p
                className="
                  mt-0.5
                  truncate
                  text-[9px]
                  text-slate-500
                "
                title={championCard.name}
              >
                {championCard.name}
              </p>
            )}
          </div>

          <div
            className="
              flex
              w-full
              flex-col
              items-start
              gap-1
              sm:w-auto
              sm:items-end
            "
          >
            <Link
              href={championHref}
              className="
                inline-flex
                h-8
                items-center
                gap-1
                rounded-lg
                border
                border-amber-400/40
                bg-amber-400/10
                px-2.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                text-amber-100
                transition-colors
                hover:border-amber-300
                hover:bg-amber-400/20
                hover:text-white
              "
              title={
                championDeck
                  ? championDeck.isExactList
                    ? "Open the champion's exact list"
                    : "Open a public list for this archetype"
                  : "Browse decks for this archetype"
              }
            >
              {championDeck ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <Layers className="h-3 w-3" />
              )}

              {championDeck
                ? championDeck.isExactList
                  ? "Open & clone"
                  : "Open list"
                : "View archetype"}
            </Link>

            <span
              className={`
                text-[7px]
                font-black
                uppercase
                tracking-[0.1em]
                ${
                  championDeck?.isExactList
                    ? "text-emerald-300"
                    : championDeck
                      ? "text-slate-400"
                      : "text-slate-600"
                }
              `}
            >
              {championDeck?.isExactList
                ? "Exact public list"
                : championDeck
                  ? "Public archetype list"
                  : "List not published"}
            </span>
          </div>
        </div>

        <div
          className="
            grid
            gap-1.5
            sm:grid-cols-2
          "
        >
          {event.placements
            .slice(1)
            .map((placement) => (
              <PodiumRow
                key={`${event.slug}-${placement.place}`}
                placement={placement}
              />
            ))}
        </div>
      </div>
    </article>
  );
}

interface PodiumRowProps {
  placement: TournamentPlacement;
}

function PodiumRow({
  placement,
}: PodiumRowProps) {
  const card = placement.signatureCard;

  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-lg
        border
        border-slate-700/50
        bg-[#070D1F]
        p-1.5
      "
    >
      <span
        className={`
          flex
          h-5
          w-5
          shrink-0
          items-center
          justify-center
          rounded
          border
          text-[8px]
          font-black
          tabular-nums
          ${
            PLACE_STYLES[placement.place] ??
            "border-slate-700 bg-slate-800/80 text-slate-400"
          }
        `}
      >
        {placement.place}
      </span>

      <div
        className="
          relative
          aspect-[59/86]
          w-[28px]
          shrink-0
          overflow-hidden
          rounded
          border
          border-slate-700
          bg-slate-800
        "
      >
        {card?.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image}
              alt={card.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              text-slate-600
            "
          >
            <Layers className="h-3 w-3" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className="
            truncate
            text-[11px]
            font-bold
            leading-tight
            text-slate-100
          "
        >
          {placement.player}
        </p>

        <p
          className="
            truncate
            text-[8px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-slate-500
          "
        >
          {placement.archetype}
        </p>
      </div>

      {placement.deck ? (
        <Link
          href={placement.deck.href}
          className="
            inline-flex
            shrink-0
            items-center
            gap-0.5
            rounded
            border
            border-blue-500/30
            bg-blue-500/10
            px-1.5
            py-1
            text-[7px]
            font-black
            uppercase
            tracking-[0.08em]
            text-blue-200
            transition-colors
            hover:border-blue-400/70
            hover:text-white
          "
          title={
            placement.deck.isExactList
              ? "Open the exact list"
              : "Open a public list for this archetype"
          }
        >
          {placement.deck.isExactList
            ? "Open"
            : "Ref. list"}

          <ArrowUpRight className="h-2.5 w-2.5" />
        </Link>
      ) : (
        <div className="shrink-0 text-right">
          <span
            className="
              block
              text-[6.5px]
              font-black
              uppercase
              tracking-[0.06em]
              text-slate-600
            "
          >
            No list
          </span>

          <Link
            href={placement.archetypeHref}
            className="
              text-[7px]
              font-black
              uppercase
              tracking-[0.06em]
              text-blue-300
              transition-colors
              hover:text-blue-200
            "
          >
            View archetype
          </Link>
        </div>
      )}
    </div>
  );
}
