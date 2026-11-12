import { cache } from "react";

import { getCardImageSrc } from "@/lib/cards/image";

import { getRecentPublicDecks } from "@/lib/decks";

import { prisma } from "@/lib/prisma";

import type { MetaDeck } from "@/types/meta";

export type TournamentOrganizer =
  | "Meta Weekly"
  | "Comunidad";

interface TournamentPlacementSeed {
  place: number;

  player: string;

  archetype: string;

  signatureCardName: string;

  /**
   * Identifier de un mazo público real. Solo se usa cuando
   * la lista del torneo está publicada en PostgreSQL.
   */
  deckIdentifier?: string;

  /** Término de búsqueda para abrir el arquetipo. */
  deckSearchTerm: string;
}

interface TournamentSeed {
  slug: string;

  name: string;

  organizer: TournamentOrganizer;

  date: string;

  players: number;

  format: "Speed Duel";

  placements: TournamentPlacementSeed[];
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
   * `true` cuando el identifier corresponde exactamente a
   * la lista publicada por el jugador del podio.
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
  slug: string;

  name: string;

  organizer: TournamentOrganizer;

  date: string;

  players: number;

  format: "Speed Duel";

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

const TOURNAMENT_SEEDS: TournamentSeed[] = [
  {
    slug: "meta-weekly-312",
    name: "Meta Weekly #312",
    organizer: "Meta Weekly",
    date: "2026-11-08T18:00:00.000Z",
    players: 128,
    format: "Speed Duel",
    placements: [
      {
        place: 1,
        player: "Kaito",
        archetype: "Snake-Eye",
        signatureCardName: "Snake-Eyes Poplar",
        deckIdentifier: "cmw8obfev000f6cu1uw7cdkec",
        deckSearchTerm: "Snake-Eye",
      },
      {
        place: 2,
        player: "Rin",
        archetype: "Blue-Eyes",
        signatureCardName: "Blue-Eyes White Dragon",
        deckSearchTerm: "Blue Eyes",
      },
      {
        place: 3,
        player: "Dante",
        archetype: "Dark Magician",
        signatureCardName: "Dark Magician",
        deckSearchTerm: "Dark Magician",
      },
      {
        place: 4,
        player: "Mika",
        archetype: "Sky Striker",
        signatureCardName: "Sky Striker Ace - Raye",
        deckSearchTerm: "Sky Striker",
      },
      {
        place: 5,
        player: "Sora",
        archetype: "Salamangreat",
        signatureCardName: "Salamangreat Gazelle",
        deckSearchTerm: "Salamangreat",
      },
      {
        place: 6,
        player: "Leo",
        archetype: "Elemental HERO",
        signatureCardName: "Elemental HERO Stratos",
        deckSearchTerm: "Elemental HERO",
      },
      {
        place: 7,
        player: "Ivan",
        archetype: "Blackwing",
        signatureCardName: "Blackwing - Gale the Whirlwind",
        deckSearchTerm: "Blackwing",
      },
      {
        place: 8,
        player: "Hugo",
        archetype: "Gladiator Beast",
        signatureCardName: "Gladiator Beast Bestiari",
        deckSearchTerm: "Gladiator Beast",
      },
    ],
  },
  {
    slug: "community-clash-47",
    name: "Community Clash #47",
    organizer: "Comunidad",
    date: "2026-11-02T17:00:00.000Z",
    players: 64,
    format: "Speed Duel",
    placements: [
      {
        place: 1,
        player: "Nova",
        archetype: "Blue-Eyes",
        signatureCardName: "Blue-Eyes White Dragon",
        deckSearchTerm: "Blue Eyes",
      },
      {
        place: 2,
        player: "Iris",
        archetype: "Dark Magician",
        signatureCardName: "Dark Magician",
        deckSearchTerm: "Dark Magician",
      },
      {
        place: 3,
        player: "Theo",
        archetype: "Snake-Eye",
        signatureCardName: "Snake-Eyes Poplar",
        deckSearchTerm: "Snake-Eye",
      },
      {
        place: 4,
        player: "Vera",
        archetype: "Sky Striker",
        signatureCardName: "Sky Striker Ace - Raye",
        deckSearchTerm: "Sky Striker",
      },
    ],
  },
  {
    slug: "meta-weekly-311",
    name: "Meta Weekly #311",
    organizer: "Meta Weekly",
    date: "2026-10-26T18:00:00.000Z",
    players: 112,
    format: "Speed Duel",
    placements: [
      {
        place: 1,
        player: "Rin",
        archetype: "Dark Magician",
        signatureCardName: "Dark Magician",
        deckSearchTerm: "Dark Magician",
      },
      {
        place: 2,
        player: "Kaito",
        archetype: "Snake-Eye",
        signatureCardName: "Snake-Eyes Poplar",
        deckSearchTerm: "Snake-Eye",
      },
      {
        place: 3,
        player: "Noa",
        archetype: "Blue-Eyes",
        signatureCardName: "Blue-Eyes White Dragon",
        deckSearchTerm: "Blue Eyes",
      },
      {
        place: 4,
        player: "Gael",
        archetype: "Salamangreat",
        signatureCardName: "Salamangreat Gazelle",
        deckSearchTerm: "Salamangreat",
      },
    ],
  },
  {
    slug: "speed-duel-community-cup",
    name: "Speed Duel Community Cup",
    organizer: "Comunidad",
    date: "2026-10-19T16:30:00.000Z",
    players: 48,
    format: "Speed Duel",
    placements: [
      {
        place: 1,
        player: "Dante",
        archetype: "Sky Striker",
        signatureCardName: "Sky Striker Ace - Raye",
        deckSearchTerm: "Sky Striker",
      },
      {
        place: 2,
        player: "Hugo",
        archetype: "Gladiator Beast",
        signatureCardName: "Gladiator Beast Bestiari",
        deckSearchTerm: "Gladiator Beast",
      },
      {
        place: 3,
        player: "Leo",
        archetype: "Elemental HERO",
        signatureCardName: "Elemental HERO Stratos",
        deckSearchTerm: "Elemental HERO",
      },
      {
        place: 4,
        player: "Ivan",
        archetype: "Blackwing",
        signatureCardName: "Blackwing - Gale the Whirlwind",
        deckSearchTerm: "Blackwing",
      },
    ],
  },
  {
    slug: "meta-weekly-310",
    name: "Meta Weekly #310",
    organizer: "Meta Weekly",
    date: "2026-10-12T18:00:00.000Z",
    players: 96,
    format: "Speed Duel",
    placements: [
      {
        place: 1,
        player: "Mika",
        archetype: "Salamangreat",
        signatureCardName: "Salamangreat Gazelle",
        deckSearchTerm: "Salamangreat",
      },
      {
        place: 2,
        player: "Sora",
        archetype: "Snake-Eye",
        signatureCardName: "Snake-Eyes Poplar",
        deckSearchTerm: "Snake-Eye",
      },
      {
        place: 3,
        player: "Axel",
        archetype: "Ancient Gear",
        signatureCardName: "Ancient Gear Golem",
        deckSearchTerm: "Ancient Gear",
      },
      {
        place: 4,
        player: "Noa",
        archetype: "Dark Magician",
        signatureCardName: "Dark Magician",
        deckSearchTerm: "Dark Magician",
      },
      {
        place: 5,
        player: "Vera",
        archetype: "Blue-Eyes",
        signatureCardName: "Blue-Eyes White Dragon",
        deckSearchTerm: "Blue Eyes",
      },
      {
        place: 6,
        player: "Theo",
        archetype: "Phantom Knights",
        signatureCardName:
          "The Phantom Knights of Rusty Bardiche",
        deckSearchTerm: "Phantom Knights",
      },
      {
        place: 7,
        player: "Iris",
        archetype: "Six Samurai",
        signatureCardName:
          "Legendary Six Samurai - Shi En",
        deckSearchTerm: "Six Samurai",
      },
      {
        place: 8,
        player: "Gael",
        archetype: "Noble Knight",
        signatureCardName: "Noble Knight Medraut",
        deckSearchTerm: "Noble Knight",
      },
    ],
  },
  {
    slug: "community-rookie-league",
    name: "Community Rookie League",
    organizer: "Comunidad",
    date: "2026-10-05T15:00:00.000Z",
    players: 32,
    format: "Speed Duel",
    placements: [
      {
        place: 1,
        player: "Axel",
        archetype: "Ancient Gear",
        signatureCardName: "Ancient Gear Golem",
        deckSearchTerm: "Ancient Gear",
      },
      {
        place: 2,
        player: "Leo",
        archetype: "Elemental HERO",
        signatureCardName: "Elemental HERO Stratos",
        deckSearchTerm: "Elemental HERO",
      },
      {
        place: 3,
        player: "Hugo",
        archetype: "Gladiator Beast",
        signatureCardName: "Gladiator Beast Bestiari",
        deckSearchTerm: "Gladiator Beast",
      },
      {
        place: 4,
        player: "Ivan",
        archetype: "Blackwing",
        signatureCardName: "Blackwing - Gale the Whirlwind",
        deckSearchTerm: "Blackwing",
      },
    ],
  },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function getDeckAuthor(deck: MetaDeck): string | null {
  return (
    deck.author?.displayName?.trim() ||
    deck.author?.username ||
    null
  );
}

function deckMatchesArchetype(
  deck: MetaDeck,
  archetype: string
): boolean {
  const target = normalize(archetype);

  if (target.length < 4) {
    return false;
  }

  const candidates = [
    deck.name,
    deck.archetype?.name,
    deck.archetypeName,
  ];

  return candidates.some((candidate) => {
    if (!candidate) {
      return false;
    }

    const normalized = normalize(candidate);

    if (normalized.length < 4) {
      return false;
    }

    return (
      normalized === target ||
      normalized.includes(target) ||
      target.includes(normalized)
    );
  });
}

function toDeckLink(
  deck: MetaDeck,
  isExactList: boolean
): TournamentDeckLink {
  return {
    name: deck.name,

    slug: deck.slug,

    identifier: deck.identifier,

    href: `/decks/${deck.slug}/${deck.identifier}`,

    author: getDeckAuthor(deck),

    isExactList,
  };
}

/**
 * Construye la página de torneos combinando resultados
 * editoriales con los mazos públicos reales de PostgreSQL.
 *
 * Cuando el identifier de la lista está disponible se enlaza
 * la lista exacta. Si no, se ofrece el mazo público del
 * arquetipo como referencia y, en su defecto, la búsqueda
 * del arquetipo en el explorador.
 */
export const getTournamentData = cache(
  async (): Promise<TournamentData> => {
    const signatureNames = Array.from(
      new Set(
        TOURNAMENT_SEEDS.flatMap((event) =>
          event.placements.map(
            (placement) => placement.signatureCardName
          )
        )
      )
    );

    const [publicDecks, signatureCards] =
      await Promise.all([
        getRecentPublicDecks(100),

        prisma.card.findMany({
          where: {
            name: {
              in: signatureNames,
            },
          },

          select: {
            name: true,
            slug: true,
            ygoproId: true,
            image: true,
          },
        }),
      ]);

    const signaturesByName = new Map(
      signatureCards.map((card) => [card.name, card])
    );

    const decksByIdentifier = new Map(
      publicDecks.map((deck) => [deck.identifier, deck])
    );

    const events = TOURNAMENT_SEEDS.map((seed) => {
      const placements: TournamentPlacement[] =
        seed.placements.map((placement) => {
          const exactDeck = placement.deckIdentifier
            ? decksByIdentifier.get(
                placement.deckIdentifier
              ) ?? null
            : null;

          const fallbackDeck =
            !exactDeck && !placement.deckIdentifier
              ? publicDecks.find((deck) =>
                  deckMatchesArchetype(
                    deck,
                    placement.archetype
                  )
                ) ?? null
              : null;

          const deck = exactDeck ?? fallbackDeck;

          const signature = signaturesByName.get(
            placement.signatureCardName
          );

          return {
            place: placement.place,

            player: placement.player,

            archetype: placement.archetype,

            signatureCard: signature
              ? {
                  name: signature.name,

                  slug: signature.slug,

                  ygoproId: signature.ygoproId,

                  image: getCardImageSrc(signature),
                }
              : null,

            deck: deck
              ? toDeckLink(deck, Boolean(exactDeck))
              : null,

            archetypeHref: `/decks?q=${encodeURIComponent(
              placement.deckSearchTerm
            )}`,
          };
        });

      return {
        slug: seed.slug,

        name: seed.name,

        organizer: seed.organizer,

        date: seed.date,

        players: seed.players,

        format: seed.format,

        placements,

        champion: placements[0],

        topCount: placements.length,

        publicListCount: placements.filter(
          (placement) => placement.deck
        ).length,
      };
    });

    events.sort((a, b) =>
      b.date.localeCompare(a.date)
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

      updatedAt: events[0]?.date ?? new Date().toISOString(),
    };
  }
);

export function getTournamentOrganizerLabel(
  organizer: TournamentOrganizer
): string {
  return organizer === "Meta Weekly"
    ? "Meta Weekly"
    : "Torneo comunitario";
}
