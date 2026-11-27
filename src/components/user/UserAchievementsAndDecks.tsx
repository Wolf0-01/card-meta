import Link from "next/link";
import { Award, Crown, Flame, LayoutGrid, Sparkles, Trophy } from "lucide-react";

import PublicDeckCard from "@/components/decks/PublicDeckCard";
import { formatDate } from "@/lib/format";

export interface TournamentResultRow {
  tournamentSlug: string;
  tournamentName: string;
  date: Date;
  placeLabel: string;
  deckId?: string;
}

interface Props {
  displayName: string;
  decks: React.ComponentProps<typeof PublicDeckCard>["deck"][];
  achievements: [string, number][];
  tournamentResults: TournamentResultRow[];
}

function normalizePlaceLabel(
  raw?: string | number | null,
  achievement?: string | null
): string {
  if (raw !== null && raw !== undefined) {
    const clean = String(raw).trim();
    const lower = clean.toLowerCase();
    if (clean === "1" || lower === "1st" || lower === "1st place") return "1st Place";
    if (clean === "2" || lower === "2nd" || lower === "2nd place") return "2nd Place";
    if (clean === "3" || lower === "3rd" || lower === "3rd place") return "3rd Place";
    if (clean === "4" || lower === "4th" || lower === "top 4") return "Top 4";
    if (clean === "8" || lower === "8th" || lower === "top 8") return "Top 8";
    if (clean === "16" || lower === "16th" || lower === "top 16") return "Top 16";
    if (/^\d+$/.test(clean)) return "Top " + clean;
    if (clean) return clean;
  }

  if (achievement === "KOG") return "King of Games";
  if (achievement === "KC_MAX") return "KC Cup Max";
  if (achievement === "TOURNAMENT") return "Tournament Top";
  return "-";
}

function getBadgeStyle(label: string): string {
  if (label === "1st Place") return "border-amber-400/40 bg-amber-400/10 text-amber-200";
  if (label === "2nd Place") return "border-slate-300/35 bg-slate-300/10 text-slate-100";
  if (label === "King of Games") return "border-rose-400/35 bg-rose-500/10 text-rose-200";
  return "border-sky-400/30 bg-sky-500/10 text-sky-200";
}

function BadgeIcon({ label }: { label: string }) {
  if (label === "1st Place") return <Crown className="mb-1.5 h-5 w-5 text-amber-300" />;
  if (label === "King of Games") return <Flame className="mb-1.5 h-5 w-5 text-rose-400" />;
  return <Award className="mb-1.5 h-5 w-5 text-sky-300" />;
}

export default function UserAchievementsAndDecks({
  displayName,
  decks,
  achievements,
  tournamentResults,
}: Props) {
  const tournamentByDeckId = new Map<string, TournamentResultRow>();
  for (const row of tournamentResults) {
    if (row.deckId && !tournamentByDeckId.has(row.deckId)) {
      tournamentByDeckId.set(row.deckId, row);
    }
  }

  return (
    <div className="space-y-4">
      <section
        aria-label="Achievements"
        className="rounded-2xl border border-slate-700/60 bg-[#0B132B] p-4 ring-1 ring-inset ring-white/5"
      >
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <Trophy className="h-3.5 w-3.5 text-amber-300" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
            Achievements
          </h2>
        </div>

        {achievements.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {achievements.map(([label, count]) => (
              <div
                key={label}
                className={[
                  "flex flex-col items-center justify-center rounded-xl border p-3 text-center",
                  getBadgeStyle(label),
                ].join(" ")}
              >
                <BadgeIcon label={label} />
                <span className="text-xs font-black tracking-wide">
                  {count > 1 ? label + " (" + count + "x)" : label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed border-slate-800 px-4 py-4 text-center text-xs text-slate-500">
            No tournament placements or KOG achievements recorded yet.
          </p>
        )}
      </section>

      <section
        aria-label={"Decks played by " + displayName}
        className="rounded-2xl border border-slate-700/60 bg-[#0B132B] p-4 ring-1 ring-inset ring-white/5"
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-3.5 w-3.5 text-blue-300" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
              Decks Played
            </h2>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {decks.length} {decks.length === 1 ? "deck" : "decks"}
          </span>
        </div>

        {decks.length > 0 ? (
          <div className="mt-3 space-y-2">
            {decks.map((deck) => {
              const tRow = tournamentByDeckId.get(deck.id);
              const placeText =
                tRow?.placeLabel ??
                normalizePlaceLabel(deck.placement, deck.achievement);

              return (
                <div key={deck.id} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-[#070D1F]/70 px-3 py-1.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-amber-200">{placeText}</span>
                      <span className="text-slate-600">•</span>
                      {tRow ? (
                        <Link
                          href={"/tournaments/" + tRow.tournamentSlug}
                          className="font-semibold text-sky-400 hover:underline"
                        >
                          {tRow.tournamentName}
                        </Link>
                      ) : (
                        <span className="text-slate-300">
                          {deck.achievement === "KOG"
                            ? "Ranked · King of Games"
                            : deck.achievement === "KC_MAX"
                            ? "KC Cup"
                            : "Community Deck"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                      {deck.skill?.trim() && (
                        <span className="inline-flex items-center gap-1 text-slate-300">
                          <Sparkles className="h-3 w-3 text-amber-300" />
                          {deck.skill.trim()}
                        </span>
                      )}
                      <span className="tabular-nums">{formatDate(deck.createdAt)}</span>
                    </div>
                  </div>

                  <PublicDeckCard deck={deck} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-slate-700 px-4 py-8 text-center text-xs text-slate-500">
            This player has not published any decks yet.
          </p>
        )}
      </section>
    </div>
  );
}
