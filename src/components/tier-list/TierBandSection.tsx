import type {
  DuelFormat,
  TierListBand,
} from "@/lib/tier-list";

import ArchetypeTierCard from "./ArchetypeTierCard";

import { TIER_BAND_META } from "./tierBands";

interface TierBandSectionProps {
  band: TierListBand;

  format: DuelFormat;
}

/**
 * Franja horizontal de un nivel competitivo. El color y el
 * degradado diferencian cada Tier de un vistazo.
 */
export default function TierBandSection({
  band,
  format,
}: TierBandSectionProps) {
  const meta = TIER_BAND_META[band.key];

  return (
    <section
      aria-labelledby={`tier-${band.key}`}
      className={`
        relative
        overflow-hidden
        rounded-xl
        border
        bg-[#0B132B]
        shadow-[0_16px_50px_-34px_rgba(0,0,0,0.95)]
        ring-1
        ring-inset
        ring-white/5
        ${meta.border}
      `}
    >
      <span
        aria-hidden
        className={`
          absolute
          inset-y-0
          left-0
          w-1
          ${meta.strip}
        `}
      />

      <span
        aria-hidden
        className={`
          pointer-events-none
          absolute
          inset-0
          ${meta.surface}
        `}
      />

      <div className="relative p-3 sm:p-4">
        <header
          className="
            flex
            flex-wrap
            items-center
            gap-x-2
            gap-y-1
            border-b
            border-slate-700/40
            pb-2.5
          "
        >
          <h2
            id={`tier-${band.key}`}
            className={`
              text-sm
              font-black
              uppercase
              tracking-[0.18em]
              ${meta.accent}
            `}
          >
            {meta.label}
          </h2>

          <span
            className={`
              rounded-md
              border
              px-1.5
              py-0.5
              text-[8px]
              font-black
              uppercase
              tracking-[0.12em]
              tabular-nums
              ${meta.badge}
            `}
          >
            {band.archetypes.length}{" "}
            {band.archetypes.length === 1
              ? "archetype"
              : "archetypes"}
          </span>

          <p
            className="
              ml-auto
              text-[9px]
              font-semibold
              text-slate-500
            "
          >
            {meta.description}
          </p>
        </header>

        {band.archetypes.length === 0 ? (
          <p
            className="
              px-1
              py-5
              text-[11px]
              text-slate-500
            "
          >
            No archetypes registered in this
            tier.
          </p>
        ) : (
          <div
            className="
              mt-2.5
              grid
              grid-cols-1
              gap-2.5
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >
            {band.archetypes.map((archetype) => (
              <ArchetypeTierCard
                key={archetype.key}
                archetype={archetype}
                format={format}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
