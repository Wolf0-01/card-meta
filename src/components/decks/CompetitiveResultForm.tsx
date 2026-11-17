"use client";

import {
  ShieldCheck,
  Trophy,
} from "lucide-react";

import {
  getAchievementLabel,
  normalizeAchievement,
  TOURNAMENT_PLACEMENTS,
  type DeckAchievement,
  type TournamentPlacement,
} from "@/lib/decks/achievements";

export interface CompetitiveResultValue {
  achievement: DeckAchievement;

  placement: TournamentPlacement | "";

  notes: string;

  proofUrl: string;
}

export const EMPTY_COMPETITIVE_RESULT: CompetitiveResultValue =
  {
    achievement: "NONE",

    placement: "",

    notes: "",

    proofUrl: "",
  };

export function toCompetitiveResultValue(
  source:
    | {
        achievement?: string | null;

        placement?: string | null;

        notes?: string | null;

        proofUrl?: string | null;
      }
    | null
    | undefined
): CompetitiveResultValue {
  if (!source) {
    return EMPTY_COMPETITIVE_RESULT;
  }

  const placement = TOURNAMENT_PLACEMENTS.find(
    (value) => value === source.placement
  );

  return {
    achievement: normalizeAchievement(
      source.achievement
    ),

    placement: placement ?? "",

    notes: source.notes ?? "",

    proofUrl: source.proofUrl ?? "",
  };
}

interface CompetitiveResultFormProps {
  value: CompetitiveResultValue;

  onChange: (
    next: CompetitiveResultValue
  ) => void;

  isStaff?: boolean;

  disabled?: boolean;

  className?: string;
}

const FIELD_CLASS = `
  w-full
  rounded-lg
  border
  border-border
  bg-background-secondary
  px-3
  py-2
  text-xs
  text-foreground
  outline-none
  transition-colors
  placeholder:text-foreground-muted
  focus:border-primary
  focus:ring-2
  focus:ring-primary/20
`;

/**
 * Bloque opcional para declarar un resultado competitivo
 * (King of Games, KC Cup DLv. Max o torneo). El staff se
 * auto-aprueba en el servidor; los USER quedan pendientes.
 */
export default function CompetitiveResultForm({
  value,
  onChange,
  isStaff = false,
  disabled = false,
  className = "",
}: CompetitiveResultFormProps) {
  const hasResult = value.achievement !== "NONE";

  function patch(
    next: Partial<CompetitiveResultValue>
  ) {
    onChange({
      ...value,
      ...next,
    });
  }

  return (
    <section
      className={`
        space-y-2.5
        rounded-xl
        border
        border-border
        bg-background-secondary
        px-3.5
        py-3
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="
              flex
              items-center
              gap-1.5
              text-[10px]
              font-black
              uppercase
              tracking-[0.16em]
              text-foreground-muted
            "
          >
            <Trophy className="h-3.5 w-3.5 text-amber-300" />
            Submit Competitive Result
          </p>

          <p className="mt-1 text-[10px] leading-4 text-foreground-muted">
            Optional. Attach a tournament, KC Cup or
            King of Games result to this deck.
          </p>
        </div>

        {hasResult && (
          <span
            className={`
              inline-flex
              shrink-0
              items-center
              gap-1
              rounded-full
              border
              px-2
              py-0.5
              text-[9px]
              font-bold
              uppercase
              tracking-wide
              ${
                isStaff
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-300"
              }
            `}
          >
            <ShieldCheck className="h-2.5 w-2.5" />
            {isStaff ? "Auto-approved" : "Pending"}
          </span>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-foreground-muted">
            Achievement
          </span>

          <select
            value={value.achievement}
            onChange={(event) =>
              patch({
                achievement:
                  event.target
                    .value as DeckAchievement,
              })
            }
            disabled={disabled}
            className={FIELD_CLASS}
          >
            <option value="NONE">
              {getAchievementLabel("NONE")}
            </option>

            <option value="KOG">
              {getAchievementLabel("KOG")}
            </option>

            <option value="KC_MAX">
              {getAchievementLabel("KC_MAX")}
            </option>

            <option value="TOURNAMENT">
              {getAchievementLabel("TOURNAMENT")}
            </option>
          </select>
        </label>

        {value.achievement === "TOURNAMENT" ? (
          <label className="block">
            <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-foreground-muted">
              Placement
            </span>

            <select
              value={value.placement}
              onChange={(event) =>
                patch({
                  placement: event.target
                    .value as TournamentPlacement | "",
                })
              }
              disabled={disabled}
              className={FIELD_CLASS}
            >
              <option value="">
                Select placement
              </option>

              {TOURNAMENT_PLACEMENTS.map(
                (placement) => (
                  <option
                    key={placement}
                    value={placement}
                  >
                    {placement}
                  </option>
                )
              )}
            </select>
          </label>
        ) : (
          <div className="hidden sm:block" />
        )}
      </div>

      {hasResult && (
        <>
          <label className="block">
            <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-foreground-muted">
              Notes
            </span>

            <textarea
              value={value.notes}
              onChange={(event) =>
                patch({
                  notes: event.target.value,
                })
              }
              placeholder="Brief notes about the deck or the run"
              maxLength={280}
              rows={2}
              disabled={disabled}
              className={`${FIELD_CLASS} resize-y`}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[9px] font-black uppercase tracking-[0.14em] text-foreground-muted">
              Proof URL
            </span>

            <input
              type="url"
              value={value.proofUrl}
              onChange={(event) =>
                patch({
                  proofUrl: event.target.value,
                })
              }
              placeholder="https://imgur.com/your-screenshot"
              maxLength={2048}
              disabled={disabled}
              className={FIELD_CLASS}
            />
          </label>

          <p className="text-[10px] leading-4 text-foreground-muted">
            {isStaff
              ? "Staff submissions are verified automatically and show the official badge."
              : "Your result stays pending until an editor or admin reviews the proof."}
          </p>
        </>
      )}
    </section>
  );
}
