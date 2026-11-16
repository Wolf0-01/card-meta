import { cache } from "react";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type TournamentOrganizer = string;

export interface TournamentStandingSeed {
  rank: number;

  player: string;

  archetype: string;

  /** Deck.id de un mazo público real. */
  deckId?: string | null;
}

export interface TournamentSignatureCard {
  name: string;

  slug: string;

  ygoproId: number | null;

  image: string | null;
}

export interface TournamentDeckLink {
  name: string;

  slug: string;

  identifier: string;

  href: string;

  author: string | null;

  /**
   * `true` cuando el puesto enlaza exactamente el mazo
   * publicado por el jugador.
   */
  isExactList: boolean;
}

export interface TournamentPlacement {
  place: number;

  player: string;

  archetype: string;

  signatureCard: TournamentSignatureCard | null;

  deck: TournamentDeckLink | null;

  archetypeHref: string;
}

export interface TournamentEvent {
  id: string;

  slug: string;

  name: string;

  organizer: TournamentOrganizer;

  date: string;

  players: number;

  format: string;

  bannerUrl: string | null;

  placements: TournamentPlacement[];

  champion: TournamentPlacement;

  topCount: number;

  publicListCount: number;
}

export interface TournamentData {
  events: TournamentEvent[];

  totalPlayers: number;

  totalPublicLists: number;

  updatedAt: string;
}

function asRecord(
  value: unknown
): Record<string, unknown> | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseStanding(
  value: unknown
): TournamentStandingSeed | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const player =
    typeof record.player === "string"
      ? record.player.trim()
      : "";

  const archetype =
    typeof record.archetype === "string"
      ? record.archetype.trim()
      : "";

  const rank =
    typeof record.rank === "number" &&
    Number.isFinite(record.rank)
      ? Math.max(1, Math.floor(record.rank))
      : 0;

  if (!player || !archetype || rank === 0) {
    return null;
  }

  const deckId =
    typeof record.deckId === "string" &&
    record.deckId.trim().length > 0
      ? record.deckId.trim()
      : null;

  return {
    rank,

    player,

    archetype,

    deckId,
  };
}

export function parseTournamentStandings(
  value: Prisma.JsonValue
): TournamentStandingSeed[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(parseStanding)
    .filter(
      (
        standing
      ): standing is TournamentStandingSeed =>
        standing !== null
    )
    .sort((a, b) => a.rank - b.rank);
}

interface PublicDeckRow {
  id: string;

  name: string;

  slug: string;

  identifier: string;

  author: {
    username: string;

    displayName: string | null;
  } | null;
}

function toDeckLink(
  deck: PublicDeckRow
): TournamentDeckLink {
  return {
    name: deck.name,

    slug: deck.slug,

    identifier: deck.identifier,

    href: `/decks/${deck.slug}/${deck.identifier}`,

    author:
      deck.author?.displayName?.trim() ||
      deck.author?.username ||
      null,

    isExactList: true,
  };
}

/**
 * Construye la página de torneos a partir de los resultados
 * reales guardados en PostgreSQL. Cada puesto puede enlazar
 * el Deck.id exacto de un mazo público.
 */
export const getTournamentData = cache(
  async (): Promise<TournamentData> => {
    const tournaments =
      await prisma.tournament.findMany({
        orderBy: {
          date: "desc",
        },
      });

    const standingsBySlug = new Map(
      tournaments.map((tournament) => [
        tournament.slug,

        parseTournamentStandings(
          tournament.standings
        ),
      ])
    );

    const deckIds = Array.from(
      new Set(
        [...standingsBySlug.values()]
          .flatMap((standings) =>
            standings.flatMap((standing) =>
              standing.deckId
                ? [standing.deckId]
                : []
            )
          )
      )
    );

    const decks =
      deckIds.length > 0
        ? await prisma.deck.findMany({
            where: {
              id: {
                in: deckIds,
              },

              isPublic: true,
            },

            select: {
              id: true,

              name: true,

              slug: true,

              identifier: true,

              author: {
                select: {
                  username: true,

                  displayName: true,
                },
              },
            },
          })
        : [];

    const decksById = new Map(
      decks.map((deck) => [deck.id, deck])
    );

    const events: TournamentEvent[] = tournaments
      .map((tournament) => {
        const standings =
          standingsBySlug.get(tournament.slug) ??
          [];

        const placements: TournamentPlacement[] =
          standings.map((standing) => {
            const deck = standing.deckId
              ? decksById.get(standing.deckId) ??
                null
              : null;

            return {
              place: standing.rank,

              player: standing.player,

              archetype: standing.archetype,

              signatureCard: null,

              deck: deck ? toDeckLink(deck) : null,

              archetypeHref: `/decks?q=${encodeURIComponent(
                standing.archetype
              )}`,
            };
          });

        if (placements.length === 0) {
          return null;
        }

        return {
          id: tournament.id,

          slug: tournament.slug,

          name: tournament.name,

          organizer: tournament.organizer,

          date: tournament.date.toISOString(),

          players: tournament.playerCount,

          format: tournament.format,

          bannerUrl: tournament.bannerUrl,

          placements,

          champion: placements[0],

          topCount: placements.length,

          publicListCount: placements.filter(
            (placement) => placement.deck
          ).length,
        };
      })
      .filter(
        (
          event
        ): event is TournamentEvent =>
          event !== null
      );

    const uniquePublicDecks = new Set(
      events.flatMap((event) =>
        event.placements.flatMap((placement) =>
          placement.deck
            ? [placement.deck.identifier]
            : []
        )
      )
    );

    return {
      events,

      totalPlayers: events.reduce(
        (total, event) => total + event.players,
        0
      ),

      totalPublicLists: uniquePublicDecks.size,

      updatedAt:
        events[0]?.date ??
        new Date().toISOString(),
    };
  }
);

export function getTournamentOrganizerLabel(
  organizer: TournamentOrganizer
): string {
  return organizer;
}
