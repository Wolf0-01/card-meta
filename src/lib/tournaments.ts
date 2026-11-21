import { cache } from "react";

import type { Prisma } from "@prisma/client";

import { mapPrismaDeck } from "@/lib/mappers/deckMapper";

import { prisma } from "@/lib/prisma";

import type { MetaDeck } from "@/types/meta";

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

  /** Deck.id público vinculado al puesto, si existe. */
  deckId: string | null;

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

export interface TournamentDeckEntry {
  placement: TournamentPlacement;

  deck: MetaDeck;
}

export interface TournamentDetail
  extends TournamentEvent {
  /** Listas completas del podio con un deckId público. */
  podiumDecks: TournamentDeckEntry[];
}

const tournamentDeckInclude = {
  archetype: true,

  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  },

  cards: {
    include: {
      card: true,
    },
  },
} satisfies Prisma.DeckInclude;

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

interface TournamentRow {
  id: string;

  slug: string;

  name: string;

  organizer: string;

  date: Date;

  playerCount: number;

  format: string;

  bannerUrl: string | null;
}

function buildTournamentEvent(
  tournament: TournamentRow,
  standings: TournamentStandingSeed[],
  decksById: Map<string, PublicDeckRow>
): TournamentEvent | null {
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

        deckId: deck?.id ?? null,

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
      .map((tournament) =>
        buildTournamentEvent(
          tournament,

          standingsBySlug.get(
            tournament.slug
          ) ?? [],

          decksById
        )
      )
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

/**
 * Detalle de un torneo por slug, incluyendo las listas
 * completas del podio que tienen un Deck.id público.
 */
export const getTournamentBySlug = cache(
  async (
    slug: string
  ): Promise<TournamentDetail | null> => {
    const tournament =
      await prisma.tournament.findUnique({
        where: {
          slug,
        },
      });

    if (!tournament) {
      return null;
    }

    const standings = parseTournamentStandings(
      tournament.standings
    );

    const deckIds = Array.from(
      new Set(
        standings.flatMap((standing) =>
          standing.deckId
            ? [standing.deckId]
            : []
        )
      )
    );

    const deckRows =
      deckIds.length > 0
        ? await prisma.deck.findMany({
            where: {
              id: {
                in: deckIds,
              },

              isPublic: true,
            },

            include: tournamentDeckInclude,
          })
        : [];

    const decksById = new Map<
      string,
      PublicDeckRow
    >(
      deckRows.map((deck) => [
        deck.id,
        {
          id: deck.id,
          name: deck.name,
          slug: deck.slug,
          identifier: deck.identifier,
          author: deck.author,
        },
      ])
    );

    const fullDecksById = new Map(
      deckRows.map((deck) => [deck.id, deck])
    );

    const event = buildTournamentEvent(
      tournament,
      standings,
      decksById
    );

    if (!event) {
      return null;
    }

    const podiumDecks: TournamentDeckEntry[] =
      event.placements
        .filter(
          (placement) =>
            placement.place <= 3 &&
            placement.deckId !== null
        )
        .flatMap((placement) => {
          const deck = placement.deckId
            ? fullDecksById.get(
                placement.deckId
              )
            : undefined;

          return deck
            ? [
                {
                  placement,

                  deck: mapPrismaDeck(deck),
                },
              ]
            : [];
        });

    return {
      ...event,

      podiumDecks,
    };
  }
);

export function getTournamentOrganizerLabel(
  organizer: TournamentOrganizer
): string {
  return organizer;
}
