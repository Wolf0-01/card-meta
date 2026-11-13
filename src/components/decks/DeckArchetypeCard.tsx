import Image from "next/image";

import Link from "next/link";

interface DeckArchetypeCardProps {
  name: string;

  count: number;

  image: string | null;

  tier: string | null;

  href: string;

  active?: boolean;
}

const TIER_BADGE_CLASSES: Record<
  string,
  string
> = {
  "Tier 1":
    "border-blue-400/50 bg-blue-500/15 text-blue-200",
  "Tier 2":
    "border-sky-400/40 bg-sky-500/10 text-sky-200",
  "Tier 3":
    "border-slate-500/40 bg-slate-500/10 text-slate-300",
  "High Potential":
    "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
};

/**
 * Tarjeta compacta y horizontal de arquetipo, al estilo de
 * la cuadrícula de Duel Links Meta: miniatura, nombre y
 * contador real de mazos públicos.
 */
export default function DeckArchetypeCard({
  name,
  count,
  image,
  tier,
  href,
  active = false,
}: DeckArchetypeCardProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`
        group
        flex
        items-center
        gap-2.5
        rounded-lg
        border
        p-2
        ring-1
        ring-inset
        ring-white/5
        transition-colors
        ${
          active
            ? "border-blue-400/70 bg-blue-500/10"
            : "border-slate-700/60 bg-[#0B132B] hover:border-blue-400/60 hover:bg-[#101A36]"
        }
      `}
    >
      <span
        className="
          relative
          h-12
          w-12
          shrink-0
          overflow-hidden
          rounded-md
          border
          border-slate-700/80
          bg-slate-800
        "
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="48px"
            className="
              object-cover
              transition-transform
              duration-200
              group-hover:scale-[1.05]
            "
          />
        ) : (
          <span
            aria-hidden
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-[radial-gradient(circle_at_50%_20%,rgba(59,130,246,0.35),transparent_70%)]
              text-[10px]
              font-black
              uppercase
              text-slate-400
            "
          >
            {name.slice(0, 2)}
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className="
            block
            truncate
            text-[11px]
            font-black
            uppercase
            leading-tight
            tracking-[0.04em]
            text-white
            transition-colors
            group-hover:text-blue-100
          "
        >
          {name}
        </span>

        {tier ? (
          <span
            className={`
              mt-1
              inline-flex
              rounded
              border
              px-1
              py-0.5
              text-[8px]
              font-black
              uppercase
              tracking-[0.12em]
              ${
                TIER_BADGE_CLASSES[tier] ??
                "border-slate-600/50 bg-slate-600/10 text-slate-300"
              }
            `}
          >
            {tier}
          </span>
        ) : (
          <span
            className="
              mt-1
              block
              text-[8px]
              font-bold
              uppercase
              tracking-[0.14em]
              text-slate-500
            "
          >
            Archetype
          </span>
        )}
      </span>

      <span
        aria-label={`${count} ${
          count === 1 ? "mazo" : "mazos"
        }`}
        className="
          flex
          h-8
          min-w-8
          shrink-0
          items-center
          justify-center
          rounded-md
          border
          border-slate-700/70
          bg-[#070D1F]
          px-1.5
          text-xs
          font-black
          tabular-nums
          text-slate-200
        "
      >
        {count}
      </span>
    </Link>
  );
}
