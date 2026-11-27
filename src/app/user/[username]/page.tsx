import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import Container from "@/components/ui/Container";
import UserAchievementsAndDecks, {
  type TournamentResultRow,
} from "@/components/user/UserAchievementsAndDecks";
import { prisma } from "@/lib/prisma";
import { getPublicUserProfile } from "@/lib/users/profile";

interface Props {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicUserProfile(username);

  if (!profile) {
    return { title: "Player not found | Card Meta" };
  }

  const name = profile.user.displayName?.trim() || profile.user.username;

  return {
    title: [name, "(@", profile.user.username, ") | Card Meta"].join(""),
    description: ["Achievements and decks played by", name, "on Card Meta."].join(" "),
  };
}

const ROLE_BADGES: Record<string, { label: string; className: string }> = {
  ADMIN: {
    label: "Top Player Council · Admin",
    className: "border-sky-400/45 bg-sky-500/15 text-sky-200",
  },
  EDITOR: {
    label: "Top Player Council",
    className: "border-emerald-400/45 bg-emerald-500/15 text-emerald-200",
  },
};

function parsePlace(raw: unknown): string {
  if (raw === null || raw === undefined) return "Top Cut";
  const clean = String(raw).trim();
  const lower = clean.toLowerCase();
  if (clean === "1" || lower === "1st" || lower === "1st place") return "1st Place";
  if (clean === "2" || lower === "2nd" || lower === "2nd place") return "2nd Place";
  if (clean === "3" || lower === "3rd" || lower === "3rd place") return "3rd Place";
  if (clean === "4" || lower === "4th" || lower === "top 4") return "Top 4";
  if (clean === "8" || lower === "8th" || lower === "top 8") return "Top 8";
  if (clean === "16" || lower === "16th" || lower === "top 16") return "Top 16";
  if (/^\d+$/.test(clean)) return "Top " + clean;
  return clean || "Top Cut";
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const profile = await getPublicUserProfile(username);

  if (!profile) {
    notFound();
  }

    const { user, decks: rawDecks } = profile;
  const displayName = user.displayName?.trim() || user.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const roleBadge = ROLE_BADGES[user.role];

  const nameKeys = new Set(
    [user.username, user.displayName]
      .filter((v): v is string => Boolean(v?.trim()))
      .map((v) => v.trim().toLowerCase())
  );

  // Solo contar los mazos que pertenecen realmente a este jugador
  // (excluye mazos de torneos/KOG que un Admin subió con el nombre de otro jugador)
  const decks = rawDecks.filter((d) => {
    const customPlayer = d.playerName?.trim().toLowerCase();
    if (!customPlayer) return true;
    return nameKeys.has(customPlayer);
  });


    const tournaments = await prisma.tournament.findMany({
    select: {
      slug: true,
      name: true,
      date: true,
      standings: true,
    },
    orderBy: { date: "desc" },
    take: 60,
  });

  const tournamentResults: TournamentResultRow[] = [];

  for (const t of tournaments) {
    if (!Array.isArray(t.standings)) continue;
    for (const rawEntry of t.standings as Array<Record<string, unknown>>) {
      const entryDeckId =
        typeof rawEntry.deckId === "string" ? rawEntry.deckId : undefined;
      const entryPlayer =
        typeof rawEntry.player === "string"
          ? rawEntry.player.trim().toLowerCase()
          : typeof rawEntry.playerName === "string"
          ? rawEntry.playerName.trim().toLowerCase()
          : "";

      const matchesUser = Boolean(entryPlayer && nameKeys.has(entryPlayer));

      if (!matchesUser) continue;

      const rawPlace =
        rawEntry.placement ?? rawEntry.place ?? rawEntry.rank ?? null;

        tournamentResults.push({
        tournamentSlug: t.slug,
        tournamentName: t.name,
        date: t.date,
        placeLabel: parsePlace(rawPlace),
        deckId: entryDeckId,
      });
    }
  }

  const counts = new Map<string, number>();
  for (const row of tournamentResults) {
    counts.set(row.placeLabel, (counts.get(row.placeLabel) ?? 0) + 1);
  }
  for (const d of decks) {
    if (d.achievement === "KOG") {
      counts.set("King of Games", (counts.get("King of Games") ?? 0) + 1);
    } else if (d.achievement === "KC_MAX") {
      const label = d.placement?.trim() ? "KC Cup (" + d.placement.trim() + ")" : "KC Cup";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }

  const priority = [
    "1st Place",
    "2nd Place",
    "3rd Place",
    "Top 4",
    "Top 8",
    "Top 16",
    "King of Games",
  ];

  const achievements = Array.from(counts.entries()).sort(([a], [b]) => {
    const idxA = priority.indexOf(a);
    const idxB = priority.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return (
    <main className="min-h-screen bg-[#070D1F] px-3 py-6 text-slate-100 sm:px-6 sm:py-8">
      <Container size="xl">
        <Link
          href="/decks"
          className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-blue-300"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to decks
        </Link>

        <div className="mt-4 grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <aside className="rounded-2xl border border-slate-700/60 bg-[#0B132B] p-5 ring-1 ring-inset ring-white/5 lg:sticky lg:top-24">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-600 bg-slate-800 text-xl font-black text-slate-300 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <h1 className="mt-3 text-lg font-black text-white">{displayName}</h1>
              <p className="text-xs text-slate-500">@{user.username}</p>

              {roleBadge && (
                <span
                  className={[
                    "mt-2.5 inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em]",
                    roleBadge.className,
                  ].join(" ")}
                >
                  {roleBadge.label}
                </span>
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-slate-800 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <div className="flex items-center justify-between">
                <span>Decks played</span>
                <span className="tabular-nums text-slate-300">{decks.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tournament tops</span>
                <span className="tabular-nums text-amber-300">
                  {tournamentResults.length}
                </span>
              </div>
            </div>
          </aside>

          <UserAchievementsAndDecks
            displayName={displayName}
            decks={decks}
            achievements={achievements}
            tournamentResults={tournamentResults}
          />
        </div>
      </Container>
    </main>
  );
}
