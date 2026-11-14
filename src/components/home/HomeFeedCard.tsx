import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
} from "lucide-react";

import { formatDate } from "@/lib/format";

import type {
  HomeFeedItem,
  HomeFeedLabel,
} from "@/lib/home";

const LABEL_STYLES: Record<
  HomeFeedLabel,
  string
> = {
  TOURNAMENTS:
    "border-blue-400/30 bg-blue-400/10 text-blue-200",

  UPDATES:
    "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",

  EVENTS:
    "border-sky-400/30 bg-sky-400/10 text-sky-200",

  BOXES:
    "border-violet-400/30 bg-violet-400/10 text-violet-200",

  BANLIST:
    "border-amber-400/30 bg-amber-400/10 text-amber-200",
};

interface HomeFeedCardProps {
  item: HomeFeedItem;
}

/**
 * Tarjeta del feed cronológico de la portada. Combina
 * torneos y noticias reales en un mismo formato.
 */
export default function HomeFeedCard({
  item,
}: HomeFeedCardProps) {
  return (
    <Link
      href={item.href}
      className="
        group
        flex
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-slate-700/60
        bg-[#0B132B]
        ring-1
        ring-inset
        ring-white/5
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-blue-400/70
        hover:shadow-[0_0_28px_rgba(59,130,246,0.18)]
        sm:flex-row
      "
    >
      <div
        className="
          relative
          aspect-[16/9]
          w-full
          shrink-0
          overflow-hidden
          bg-[#070D1F]
          sm:aspect-auto
          sm:h-auto
          sm:w-48
          sm:self-stretch
        "
      >
        {item.image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
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
                opacity-90
                transition-transform
                duration-300
                group-hover:scale-[1.04]
              "
            />

            <span
              aria-hidden
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-[#0B132B]
                via-transparent
                to-transparent
                sm:bg-gradient-to-r
              "
            />
          </>
        ) : (
          <span
            aria-hidden
            className="
              absolute
              inset-0
              bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.35),transparent_60%),radial-gradient(circle_at_90%_100%,rgba(14,165,233,0.2),transparent_55%)]
            "
          />
        )}

        <span
          className={`
            absolute
            left-2.5
            top-2.5
            inline-flex
            items-center
            gap-1
            rounded
            border
            px-1.5
            py-0.5
            text-[8px]
            font-black
            uppercase
            tracking-[0.12em]
            backdrop-blur-sm
            ${LABEL_STYLES[item.label]}
          `}
        >
          {item.label}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3">
        <div
          className="
            flex
            items-center
            justify-between
            gap-2
            text-[9px]
            font-bold
            uppercase
            tracking-[0.12em]
            text-slate-500
          "
        >
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-2.5 w-2.5" />

            {formatDate(item.date)}
          </span>

          <span
            aria-hidden
            className="
              flex
              h-5
              w-5
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-slate-700
              bg-[#070D1F]
              text-slate-400
              transition-colors
              group-hover:border-blue-400/60
              group-hover:text-blue-200
            "
          >
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        <h3
          className="
            mt-1
            line-clamp-2
            text-sm
            font-black
            leading-snug
            text-white
            transition-colors
            group-hover:text-blue-100
          "
        >
          {item.title}
        </h3>

        {item.summary && (
          <p
            className="
              mt-1
              line-clamp-2
              text-[11px]
              leading-relaxed
              text-slate-400
            "
          >
            {item.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
