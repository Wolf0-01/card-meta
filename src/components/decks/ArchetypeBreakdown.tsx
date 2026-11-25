"use client";

import { X } from "lucide-react";

import SkillLink from "@/components/skills/SkillLink";

import type { ArchetypeBreakdown as ArchetypeBreakdownData } from "@/lib/decks";

import type { SkillMetaSummary } from "@/types/skill";

import ArchetypeBreakdownCardTile from "./ArchetypeBreakdownCardTile";

import { useArchetypeCardFilter } from "./ArchetypeCardFilterContext";

interface ArchetypeBreakdownProps {
  breakdown: ArchetypeBreakdownData;

  canFilterBreakdown?: boolean;

  skillMetas?: Record<string, SkillMetaSummary | null>;
}

function ColumnHeading({
  title,
  hint,
}: {
  title: string;

  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden
          className="h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]"
        />

        <h2 className="truncate text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
          {title}
        </h2>
      </div>

      {hint && (
        <span className="shrink-0 text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {hint}
        </span>
      )}
    </div>
  );
}

const PANEL_CLASSES =
  "rounded-xl border border-slate-700/60 bg-[#0B132B] p-3 ring-1 ring-inset ring-white/5";

export default function ArchetypeBreakdown({
  breakdown,
  canFilterBreakdown = false,
  skillMetas,
}: ArchetypeBreakdownProps) {
  const { mainDeck, extraDeck, skills } = breakdown;

  const filter = useArchetypeCardFilter();

  const selectedCardId =
    filter?.selected?.id ?? null;

  return (
    <section
      aria-label={breakdown.archetype + " deck breakdown"}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        <div className={PANEL_CLASSES + " lg:col-span-6"}>
          <ColumnHeading
            title="Top Main Deck"
            hint={
              canFilterBreakdown
                ? "Click to filter · Inclusion rate"
                : "Inclusion rate"
            }
          />

          {mainDeck.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 pt-2 sm:grid-cols-6">
              {mainDeck.map((entry) => (
                <ArchetypeBreakdownCardTile
                  key={entry.card.id}
                  card={entry.card}
                  copies={entry.copies}
                  percentage={entry.percentage}
                  interactive={canFilterBreakdown}
                  selected={
                    canFilterBreakdown &&
                    selectedCardId === entry.card.id
                  }
                  onToggle={() =>
                    filter?.toggle({
                      id: entry.card.id,

                      name: entry.card.name,
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              No Main Deck cards recorded yet.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:col-span-6">
          <div className={PANEL_CLASSES}>
            <ColumnHeading
              title="Top Extra Deck"
              hint="Inclusion rate"
            />

            {extraDeck.length > 0 ? (
              <div className="grid grid-cols-4 gap-2 pt-2 sm:grid-cols-6">
                {extraDeck.map((entry) => (
                  <ArchetypeBreakdownCardTile
                    key={entry.card.id}
                    card={entry.card}
                    copies={entry.copies}
                    percentage={entry.percentage}
                    interactive={canFilterBreakdown}
                    selected={
                      canFilterBreakdown &&
                      selectedCardId === entry.card.id
                    }
                    onToggle={() =>
                      filter?.toggle({
                        id: entry.card.id,

                        name: entry.card.name,
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                No Extra Deck cards recorded yet.
              </p>
            )}
          </div>

          <div className={PANEL_CLASSES}>
            <ColumnHeading title="Popular Skills" />

            {skills.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {skills.map((skill) => (
                  <li
                    key={skill.name}
                    className="flex items-center justify-between gap-2 rounded-md border border-slate-800/80 bg-slate-900/40 px-2 py-1"
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        aria-hidden
                        className="h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.55)]"
                      />

                      <SkillLink
  name={skill.name}
  meta={skillMetas?.[skill.name] ?? null}
  className="truncate text-[10px] font-bold text-slate-200 hover:text-sky-300"
/>

                    </span>

                    <span className="shrink-0 text-[10px] font-black tabular-nums text-amber-300">
                      {skill.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                No Skills recorded yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {canFilterBreakdown && filter?.selected && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-400/30 bg-blue-500/10 px-2.5 py-1.5">
          <p className="min-w-0 truncate text-[10px] font-bold text-blue-200">
            Filtering decks with{" "}
            <span className="font-black text-white">
              {filter.selected.name}
            </span>
          </p>

          <button
            type="button"
            onClick={filter.clear}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-blue-400/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-blue-200 transition-colors hover:bg-blue-500/20 hover:text-white"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        </div>
      )}
    </section>
  );
}
