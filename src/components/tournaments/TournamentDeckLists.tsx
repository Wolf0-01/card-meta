import Link from "next/link";

import {
  Sparkles,
  Trophy,
} from "lucide-react";

import Button from "@/components/ui/Button";

import DeckExtraDeck from "@/components/decks/DeckExtraDeck";

import DeckMainDeck from "@/components/decks/DeckMainDeck";

import SkillLink from "@/components/skills/SkillLink";

import { prisma } from "@/lib/prisma";

import { getSkillMetaByNames } from "@/lib/skills/meta";

import { getSkillNameKey } from "@/lib/skills/slug";

import type { TournamentDeckEntry } from "@/lib/tournaments";

interface TournamentDeckListsProps {
  decks: TournamentDeckEntry[];
}

function formatTournamentPlace(place: number): string {
  if (place === 1) return "1st Place";
  if (place === 2) return "2nd Place";
  if (place === 3) return "3rd Place";
  if (place === 4) return "Top 4";
  return `Top ${place}`;
}

/**
 * Sección Top Deck Lists del detalle de un torneo.
 * Renderiza el encabezado "1st Place – Jugador" (en azul clicable
 * si el jugador tiene cuenta en Card Meta, o en blanco si no)
 * junto con la Skill y las listas Main + Extra.
 */
export default async function TournamentDeckLists({
  decks,
}: TournamentDeckListsProps) {
  if (decks.length === 0) {
    return null;
  }

  const playerNames = Array.from(
    new Set(
      decks
        .map(({ placement }) => placement.player?.trim())
        .filter((name): name is string => Boolean(name))
    )
  );

  const [skillMetaByName, matchedUsers] = await Promise.all([
    getSkillMetaByNames(
      decks.flatMap(({ deck }) =>
        deck.skill?.trim()
          ? [deck.skill.trim()]
          : []
      )
    ),
    playerNames.length > 0
      ? prisma.user.findMany({
          where: {
            OR: playerNames.flatMap((name) => [
              { username: { equals: name, mode: "insensitive" } },
              { displayName: { equals: name, mode: "insensitive" } },
            ]),
          },
          select: {
            username: true,
            displayName: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const usernameByPlayerKey = new Map<string, string>();
  for (const user of matchedUsers) {
    if (!user.username) continue;
    usernameByPlayerKey.set(user.username.toLowerCase(), user.username);
    if (user.displayName?.trim()) {
      usernameByPlayerKey.set(
        user.displayName.trim().toLowerCase(),
        user.username
      );
    }
  }

  return (
    <section
      aria-label="Top Deck Lists"
      className="space-y-4"
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          gap-2
          border-b
          border-slate-800
          pb-2
        "
      >
        <Trophy className="h-4 w-4 text-amber-300" />

        <h2
          className="
            text-[11px]
            font-black
            uppercase
            tracking-[0.2em]
            text-slate-200
          "
        >
          Top Deck Lists
        </h2>

        <span
          className="
            ml-auto
            text-[9px]
            font-black
            tabular-nums
            text-slate-500
          "
        >
          {decks.length}{" "}
          {decks.length === 1 ? "list" : "lists"}
        </span>
      </div>

      <div
        className="
          max-w-lg
          space-y-8
          divide-y
          divide-slate-800
        "
      >
        {decks.map(({ placement, deck }) => {
          const totalMain = deck.mainCards ?? 0;

          const skill =
            deck.skill?.trim() || null;

          const skillMeta = skill
            ? skillMetaByName.get(
                getSkillNameKey(skill)
              ) ?? null
            : null;

          const rawPlayer = placement.player?.trim() || "Duelist";
          const matchedUsername =
            usernameByPlayerKey.get(rawPlayer.toLowerCase()) ??
            (deck.author?.username &&
            !deck.playerName?.trim()
              ? deck.author.username
              : null);

          const placeLabel = formatTournamentPlace(placement.place);

          return (
            <article
              key={`${placement.place}-${deck.identifier}`}
              className="space-y-3 pt-6 first:pt-1"
            >
              <header className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5 text-lg font-black tracking-tight sm:text-xl">
                  <span className="text-slate-100">
                    {placeLabel}
                  </span>
                  <span className="text-slate-400">–</span>
                  {matchedUsername ? (
                    <Link
                      href={`/user/${matchedUsername}`}
                      className="text-[#1D7BFF] transition-colors hover:text-sky-400 hover:underline"
                    >
                      {rawPlayer}
                    </Link>
                  ) : (
                    <span className="text-white">
                      {rawPlayer}
                    </span>
                  )}
                </div>

                <div
                  className="
                    grid
                    grid-cols-[1fr_auto_1fr]
                    items-center
                    gap-2
                    pt-0.5
                  "
                >
                  <span aria-hidden />

                  <div
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-1.5
                      text-center
                    "
                  >
                    <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-300" />

                    {skill ? (
                      <SkillLink
                        name={skill}
                        meta={skillMeta}
                        className="
                          text-xs
                          font-bold
                          tracking-wide
                          text-sky-300
                        "
                      />
                    ) : (
                      <span
                        className="
                          text-xs
                          font-bold
                          tracking-wide
                          text-slate-400
                        "
                      >
                        No Skill
                      </span>
                    )}
                  </div>

                  <span
                    className="
                      text-right
                      text-[11px]
                      font-bold
                      tabular-nums
                      text-slate-300
                    "
                  >
                    {totalMain} cards
                  </span>
                </div>
              </header>

              <div className="py-1">
                <DeckMainDeck deck={deck} />

                <DeckExtraDeck deck={deck} />
              </div>

              <footer>
                <Button
                  variant="primary"
                  size="sm"
                  href={`/decks/new?clone=${deck.identifier}`}
                  className="w-full"
                >
                  Build in Deck Builder
                </Button>
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
