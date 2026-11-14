import type {
  Prisma,
  Tournament,
} from "@prisma/client";

import { getRecentPublicDecks } from "@/lib/decks";

import { prisma } from "@/lib/prisma";

import type {
  TournamentDeckOption,
  TournamentEditorData,
  TournamentEditorStanding,
  TournamentMutationResult,
} from "./editor";

import { TournamentError } from "./errors";

import { slugifyTournamentName } from "./slug";

import {
  parseTournamentCreate,
  parseTournamentUpdate,
  type TournamentCreateInput,
} from "./validation";

interface NormalizedStanding {
  rank: number;

  player: string;

  archetype: string;

  deckId: string | null;
}

function normalizeStanding(
  standing: TournamentCreateInput["standings"][number]
): NormalizedStanding {
  return {
    rank: standing.rank,

    player: standing.player.trim(),

    archetype: standing.archetype.trim(),

    deckId:
      standing.deckId &&
      standing.deckId.trim().length > 0
        ? standing.deckId.trim()
        : null,
  };
}

function sortStandings(
  standings: NormalizedStanding[]
): NormalizedStanding[] {
  return [...standings].sort(
    (a, b) => a.rank - b.rank
  );
}

function buildStandings(
  standings: NormalizedStanding[]
): Prisma.InputJsonValue {
  return sortStandings(standings).map(
    (standing) => ({
      rank: standing.rank,

      player: standing.player,

      archetype: standing.archetype,

      ...(standing.deckId
        ? { deckId: standing.deckId }
        : {}),
    })
  ) as Prisma.InputJsonValue;
}

function parseDate(value: string) {
  const date = new Date(
    `${value}T12:00:00.000Z`
  );

  if (Number.isNaN(date.getTime())) {
    throw new TournamentError(
      "VALIDATION",
      "The date is not valid",
      [
        {
          path: "date",

          message:
            "Use a valid date (YYYY-MM-DD)",
        },
      ]
    );
  }

  return date;
}

async function ensureDecksExist(
  deckIds: string[]
) {
  if (deckIds.length === 0) {
    return;
  }

  const found = await prisma.deck.findMany({
    where: {
      id: {
        in: deckIds,
      },

      isPublic: true,
    },

    select: {
      id: true,
    },
  });

  const foundIds = new Set(
    found.map((deck) => deck.id)
  );

  const missing = deckIds.filter(
    (id) => !foundIds.has(id)
  );

  if (missing.length === 0) {
    return;
  }

  throw new TournamentError(
    "VALIDATION",
    "One or more linked decks are not public or do not exist",
    missing.slice(0, 10).map((id) => ({
      path: "standings",

      message: `The deck "${id}" is not a public deck`,
    }))
  );
}

async function uniqueTournamentSlug(
  name: string,
  excludeId?: string
) {
  const root = slugifyTournamentName(name);

  let candidate = root;

  let suffix = 2;

  for (;;) {
    const existing =
      await prisma.tournament.findFirst({
        where: {
          slug: candidate,

          ...(excludeId
            ? {
                id: {
                  not: excludeId,
                },
              }
            : {}),
        },

        select: {
          id: true,
        },
      });

    if (!existing) {
      return candidate;
    }

    candidate = `${root}-${suffix}`;

    suffix += 1;
  }
}

function toEditorStanding(
  value: unknown
): TournamentEditorStanding | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const record = value as Record<
    string,
    unknown
  >;

  const rank =
    typeof record.rank === "number" &&
    Number.isFinite(record.rank)
      ? Math.max(1, Math.floor(record.rank))
      : 0;

  const player =
    typeof record.player === "string"
      ? record.player
      : "";

  const archetype =
    typeof record.archetype === "string"
      ? record.archetype
      : "";

  if (!rank || !player || !archetype) {
    return null;
  }

  return {
    rank,

    player,

    archetype,

    deckId:
      typeof record.deckId === "string"
        ? record.deckId
        : "",
  };
}

function parseEditorStandings(
  value: Prisma.JsonValue
): TournamentEditorStanding[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(toEditorStanding)
    .filter(
      (
        standing
      ): standing is TournamentEditorStanding =>
        standing !== null
    )
    .sort((a, b) => a.rank - b.rank);
}

function toEditorData(
  tournament: Tournament
): TournamentEditorData {
  return {
    id: tournament.id,

    slug: tournament.slug,

    name: tournament.name,

    organizer: tournament.organizer,

    format: tournament.format,

    playerCount: tournament.playerCount,

    date: tournament.date
      .toISOString()
      .slice(0, 10),

    standings: parseEditorStandings(
      tournament.standings
    ),
  };
}

export async function getTournamentDeckOptions(): Promise<
  TournamentDeckOption[]
> {
  const decks = await getRecentPublicDecks(100);

  return decks.map((deck) => ({
    id: deck.id,

    name: deck.name,

    slug: deck.slug,

    identifier: deck.identifier,

    author:
      deck.author?.displayName?.trim() ||
      deck.author?.username ||
      null,

    archetype:
      deck.archetype?.name ??
      deck.archetypeName ??
      null,
  }));
}

export async function getTournamentForEditorBySlug(
  slug: string
): Promise<TournamentEditorData | null> {
  const tournament =
    await prisma.tournament.findUnique({
      where: {
        slug,
      },
    });

  return tournament
    ? toEditorData(tournament)
    : null;
}

export async function getTournamentForEditorById(
  id: string
): Promise<TournamentEditorData | null> {
  const tournament =
    await prisma.tournament.findUnique({
      where: {
        id,
      },
    });

  return tournament
    ? toEditorData(tournament)
    : null;
}

export async function createTournament(
  body: unknown
): Promise<TournamentMutationResult> {
  const input = parseTournamentCreate(body);

  const standings = sortStandings(
    input.standings.map(normalizeStanding)
  );

  await ensureDecksExist(
    standings.flatMap((standing) =>
      standing.deckId ? [standing.deckId] : []
    )
  );

  const slug =
    await uniqueTournamentSlug(input.name);

  return prisma.tournament.create({
    data: {
      slug,

      name: input.name,

      organizer: input.organizer,

      format: input.format,

      playerCount: input.playerCount,

      date: parseDate(input.date),

      standings: buildStandings(standings),
    },

    select: {
      id: true,

      slug: true,
    },
  });
}

export async function updateTournament(
  tournamentId: string,
  body: unknown
): Promise<TournamentMutationResult> {
  const patch = parseTournamentUpdate(body);

  const existing =
    await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },
    });

  if (!existing) {
    throw new TournamentError(
      "NOT_FOUND",
      "The tournament does not exist"
    );
  }

  const standings = patch.standings
    ? sortStandings(
        patch.standings.map(normalizeStanding)
      )
    : null;

  if (standings) {
    await ensureDecksExist(
      standings.flatMap((standing) =>
        standing.deckId
          ? [standing.deckId]
          : []
      )
    );
  }

  const name = patch.name ?? existing.name;

  const slug =
    patch.name && patch.name !== existing.name
      ? await uniqueTournamentSlug(
          name,
          existing.id
        )
      : existing.slug;

  return prisma.tournament.update({
    where: {
      id: existing.id,
    },

    data: {
      slug,

      name,

      organizer:
        patch.organizer ?? existing.organizer,

      format: patch.format ?? existing.format,

      playerCount:
        patch.playerCount ?? existing.playerCount,

      date: patch.date
        ? parseDate(patch.date)
        : existing.date,

      standings: standings
        ? buildStandings(standings)
        : (existing.standings as Prisma.InputJsonValue),
    },

    select: {
      id: true,

      slug: true,
    },
  });
}

export async function deleteTournament(
  tournamentId: string
): Promise<TournamentMutationResult> {
  const existing =
    await prisma.tournament.findUnique({
      where: {
        id: tournamentId,
      },

      select: {
        id: true,

        slug: true,
      },
    });

  if (!existing) {
    throw new TournamentError(
      "NOT_FOUND",
      "The tournament does not exist"
    );
  }

  await prisma.tournament.delete({
    where: {
      id: tournamentId,
    },
  });

  return existing;
}
