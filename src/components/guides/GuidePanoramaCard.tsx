import Link from "next/link";

import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
} from "lucide-react";

import { formatDate } from "@/lib/format";

import type { GuideListItem } from "@/lib/guides";

interface GuidePanoramaCardProps {
  guide: GuideListItem;

  /**
   * Clases de proporción para la tarjeta. Las guías
   * destacadas usan un formato más panorámico.
   */
  aspectClassName?: string;

  showSummary?: boolean;
}

/**
 * Tarjeta horizontal panorámica al estilo Duel Links Meta:
 * portada de fondo, degradado oscuro inferior y título
 * grande con la fecha y el autor debajo.
 */
export default function GuidePanoramaCard({
  guide,
  aspectClassName = "aspect-[16/9]",
  showSummary = false,
}: GuidePanoramaCardProps) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={`
        group
        relative
        flex
        ${aspectClassName}
        flex-col
        justify-end
        overflow-hidden
        rounded-2xl
        border
        border-slate-700/60
        bg-[#0B132B]
        shadow-[0_16px_40px_-28px_rgba(0,0,0,0.95)]
        ring-1
        ring-inset
        ring-white/5
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-blue-400/70
        hover:shadow-[0_0_32px_rgba(59,130,246,0.2)]
      `}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={guide.coverUrl}
        alt={guide.title}
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
          from-[#050A18]
          via-[#070D1F]/70
          to-[#070D1F]/10
        "
      />

      <span
        aria-hidden
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-[#050A18]/70
          via-transparent
          to-transparent
        "
      />

      <div
        className="
          relative
          flex
          flex-col
          gap-1.5
          p-4
          sm:p-5
        "
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="
              inline-flex
              items-center
              gap-1
              rounded
              border
              border-sky-400/30
              bg-sky-400/10
              px-1.5
              py-0.5
              text-[8px]
              font-black
              uppercase
              tracking-[0.12em]
              text-sky-200
              backdrop-blur-sm
            "
          >
            <BookOpen className="h-2.5 w-2.5" />
            Guide
          </span>

          {guide.featured && (
            <span
              className="
                inline-flex
                items-center
                gap-1
                rounded
                border
                border-amber-400/30
                bg-amber-400/10
                px-1.5
                py-0.5
                text-[8px]
                font-black
                uppercase
                tracking-[0.12em]
                text-amber-200
                backdrop-blur-sm
              "
            >
              Popular
            </span>
          )}

          <span
            className="
              ml-auto
              inline-flex
              items-center
              gap-1
              rounded
              border
              border-white/10
              bg-slate-950/60
              px-1.5
              py-0.5
              text-[8px]
              font-bold
              text-slate-200
              backdrop-blur-sm
            "
          >
            <Clock3 className="h-2.5 w-2.5" />
            {guide.readingMinutes} min
          </span>
        </div>

        <h3
          className="
            line-clamp-2
            max-w-2xl
            text-lg
            font-black
            leading-tight
            tracking-tight
            text-white
            transition-colors
            group-hover:text-blue-100
            sm:text-xl
          "
        >
          {guide.title}
        </h3>

        {showSummary && (
          <p
            className="
              line-clamp-2
              max-w-xl
              text-[11px]
              leading-relaxed
              text-slate-300
            "
          >
            {guide.summary}
          </p>
        )}

        <p
          className="
            flex
            flex-wrap
            items-center
            gap-1.5
            text-[9px]
            font-black
            uppercase
            tracking-[0.14em]
            text-slate-300
          "
        >
          <CalendarDays className="h-3 w-3 text-sky-300" />

          Published {formatDate(guide.createdAt)}

          <span className="text-slate-500">by</span>

          <span className="text-sky-200">
            {guide.author}
          </span>
        </p>
      </div>

      <span
        aria-hidden
        className="
          absolute
          right-3
          top-3
          flex
          h-7
          w-7
          items-center
          justify-center
          rounded-full
          border
          border-white/15
          bg-slate-950/60
          text-slate-200
          backdrop-blur-sm
          transition-colors
          group-hover:border-blue-400/60
          group-hover:text-blue-200
        "
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
