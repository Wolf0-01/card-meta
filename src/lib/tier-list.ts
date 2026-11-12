import { cache } from "react";

import { prisma } from "@/lib/prisma";

export type TierBandKey =
  | "tier-1"
  | "tier-2"
  | "tier-3"
  | "high-potential";

export type DuelFormat = "speed" | "rush";

export interface TierListArchetype {
  key: string;

  name: string;

  /** Término que se envía a /decks?q= para abrir sus listas. */
  searchTerm: string;

  tier: TierBandKey;

  /** Puntuación 0-100 calculada con datos reales de la BD. */
  powerScore: number;

  /** Mazos públicos registrados para este arquetipo. */
  deckCount: number;

  /** Cartas del arquetipo disponibles en el catálogo. */
  cardCount: number;

  image: string | null;

  signatureName: string | null;
}

export interface TierListBand {
  key: TierBandKey;

  archetypes: TierListArchetype[];
}

export interface TierListData {
  format: DuelFormat;

  updatedAt: string;

  totalPublicDecks: number;

  totalArchetypes: number;

  hasData: boolean;

  bands: TierListBand[];
}

interface ArchetypeSeed {
  key: string;

  name: string;

  searchTerm: string;

  /** Nombre canónico en Card.archetype. */
  cardArchetype: string;

  /** Carta insignia que se muestra como miniatura. */
  signatureCard: string;

  /** Alias normalizados para relacionar mazos sin archetypeId. */
  aliases: string[];

  /** Tier editorial de respaldo cuando no hay datos de torneo. */
  fallbackTier: TierBandKey;
}

const TIER_ORDER: TierBandKey[] = [
  "tier-1",
  "tier-2",
  "tier-3",
  "high-potential",
];

const BAND_BASE_SCORE: Record<
  TierBandKey,
  number
> = {
  "tier-1": 80,
  "tier-2": 66,
  "tier-3": 52,
  "high-potential": 38,
};

const SEEDS: ArchetypeSeed[] = [
  {
    key: "snake-eye",
    name: "Snake-Eye",
    searchTerm: "Snake-Eye",
    cardArchetype: "Snake-Eye",
    signatureCard: "Snake-Eyes Poplar",
    aliases: ["snake eye", "snake-eye"],
    fallbackTier: "tier-1",
  },
  {
    key: "blue-eyes",
    name: "Blue-Eyes",
    searchTerm: "Blue Eyes",
    cardArchetype: "Blue-Eyes",
    signatureCard: "Blue-Eyes White Dragon",
    aliases: ["blue eyes", "blue-eyes"],
    fallbackTier: "tier-1",
  },
  {
    key: "dark-magician",
    name: "Dark Magician",
    searchTerm: "Dark Magician",
    cardArchetype: "Dark Magician",
    signatureCard: "Dark Magician",
    aliases: ["dark magician", "dark-magician"],
    fallbackTier: "tier-2",
  },
  {
    key: "salamangreat",
    name: "Salamangreat",
    searchTerm: "Salamangreat",
    cardArchetype: "Salamangreat",
    signatureCard: "Salamangreat Gazelle",
    aliases: ["salamangreat", "salamangreats"],
    fallbackTier: "tier-2",
  },
  {
    key: "elemental-hero",
    name: "Elemental HERO",
    searchTerm: "Elemental HERO",
    cardArchetype: "Elemental HERO",
    signatureCard: "Elemental HERO Stratos",
    aliases: ["elemental hero", "elemental-hero"],
    fallbackTier: "tier-2",
  },
  {
    key: "sky-striker",
    name: "Sky Striker",
    searchTerm: "Sky Striker",
    cardArchetype: "Sky Striker",
    signatureCard: "Sky Striker Ace - Raye",
    aliases: ["sky striker", "sky-striker"],
    fallbackTier: "tier-3",
  },
  {
    key: "blackwing",
    name: "Blackwing",
    searchTerm: "Blackwing",
    cardArchetype: "Blackwing",
    signatureCard: "Blackwing - Gale the Whirlwind",
    aliases: ["blackwing", "blackwings"],
    fallbackTier: "tier-3",
  },
  {
    key: "gladiator-beast",
    name: "Gladiator Beast",
    searchTerm: "Gladiator Beast",
    cardArchetype: "Gladiator Beast",
    signatureCard: "Gladiator Beast Bestiari",
    aliases: ["gladiator beast", "gladiator-beast"],
    fallbackTier: "tier-3",
  },
  {
    key: "phantom-knights",
    name: "Phantom Knights",
    searchTerm: "Phantom Knights",
    cardArchetype: "Phantom Knights",
    signatureCard:
      "The Phantom Knights of Rusty Bardiche",
    aliases: ["phantom knights", "phantom-knights"],
    fallbackTier: "high-potential",
  },
  {
    key: "six-samurai",
    name: "Six Samurai",
    searchTerm: "Six Samurai",
    cardArchetype: "Six Samurai",
    signatureCard:
      "Legendary Six Samurai - Shi En",
    aliases: ["six samurai", "six-samurai"],
    fallbackTier: "high-potential",
  },
  {
    key: "noble-knight",
    name: "Noble Knight",
    searchTerm: "Noble Knight",
    cardArchetype: "Noble Knight",
    signatureCard: "Noble Knight Medraut",
    aliases: ["noble knight", "noble-knight"],
    fallbackTier: "high-potential",
  },
  {
    key: "ancient-gear",
    name: "Ancient Gear",
    searchTerm: "Ancient Gear",
    cardArchetype: "Ancient Gear",
    signatureCard: "Ancient Gear Golem",
    aliases: ["ancient gear", "ancient-gear"],
    fallbackTier: "high-potential",
  },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}

function bandFromTier(
  tier: string | null
): TierBandKey | null {
  if (!tier) {
    return null;
  }

  const value = tier
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  if (value.includes("tier 1") || value === "t1") {
    return "tier-1";
  }

  if (value.includes("tier 2") || value === "t2") {
    return "tier-2";
  }

  if (value.includes("tier 3") || value === "t3") {
    return "tier-3";
  }

  if (
    value.includes("rogue") ||
    value.includes("potential")
  ) {
    return "high-potential";
  }

  return null;
}

function bestBand(
  bands: (TierBandKey | null)[]
): TierBandKey | null {
  const found = bands.filter(
    (band): band is TierBandKey => band !== null
  );

  if (found.length === 0) {
    return null;
  }

  return found.reduce((best, current) =>
    TIER_ORDER.indexOf(current) <
    TIER_ORDER.indexOf(best)
      ? current
      : best
  );
}

function isRushFormat(format: string): boolean {
  return format.toLowerCase().includes("rush");
}

interface DeckForTierList {
  name: string;

  slug: string;

  format: string;

  tier: string | null;

  popularity: number;

  tournamentResults: number;

  updatedAt: Date;

  archetype: {
    name: string;
  } | null;

  cards: {
    quantity: number;

    card: {
      archetype: string | null;
    };
  }[];
}

function resolveDeckSeed(
  deck: DeckForTierList,
  aliasIndex: Map<string, ArchetypeSeed>
): ArchetypeSeed | null {
  const relationName = deck.archetype?.name;

  if (relationName) {
    const match = aliasIndex.get(
      normalize(relationName)
    );

    if (match) {
      return match;
    }
  }

  const deckIdentity = normalize(
    `${deck.name} ${deck.slug}`
  );

  for (const [alias, seed] of aliasIndex) {
    if (alias.length >= 4 && deckIdentity.includes(alias)) {
      return seed;
    }
  }

  const cardWeights = new Map<string, number>();

  for (const entry of deck.cards) {
    const archetype = entry.card.archetype;

    if (!archetype) {
      continue;
    }

    cardWeights.set(
      archetype,
      (cardWeights.get(archetype) ?? 0) +
        Math.max(entry.quantity, 1)
    );
  }

  let bestSeed: ArchetypeSeed | null = null;

  let bestWeight = 0;

  for (const [archetype, weight] of cardWeights) {
    const seed = aliasIndex.get(normalize(archetype));

    if (seed && weight > bestWeight) {
      bestSeed = seed;

      bestWeight = weight;
    }
  }

  return bestSeed;
}

function scoreArchetype({
  band,
  deckCount,
  tournamentResults,
  popularity,
  cardCount,
}: {
  band: TierBandKey;

  deckCount: number;

  tournamentResults: number;

  popularity: number;

  cardCount: number;
}): number {
  const base = BAND_BASE_SCORE[band];

  const deckBonus = Math.min(deckCount * 3, 9);

  const tournamentBonus = Math.min(
    tournamentResults,
    6
  );

  const popularityBonus = Math.min(
    popularity / 5,
    5
  );

  const poolBonus = Math.min(cardCount / 10, 4);

  return Math.round(
    clamp(
      base +
        deckBonus +
        tournamentBonus +
        popularityBonus +
        poolBonus,
      0,
      100
    )
  );
}

/**
 * Construye la Tier List competitiva combinando:
 *
 * - La clasificación editorial de arquetipos (Tier 1/2/3/High Potential).
 * - El tier real de los mazos públicos cuando existe.
 * - Resultados de torneo, popularidad y profundidad del pool de cartas.
 * - El contador de mazos públicos registrados por arquetipo.
 */
export const getTierList = cache(
  async (
    format: DuelFormat = "speed"
  ): Promise<TierListData> => {
    const decks = await prisma.deck.findMany({
      where: {
        isPublic: true,
      },

      select: {
        name: true,

        slug: true,

        format: true,

        tier: true,

        popularity: true,

        tournamentResults: true,

        updatedAt: true,

        archetype: {
          select: {
            name: true,
          },
        },

        cards: {
          select: {
            quantity: true,

            card: {
              select: {
                archetype: true,
              },
            },
          },
        },
      },
    });

    const formatDecks = decks.filter((deck) =>
      format === "rush"
        ? isRushFormat(deck.format)
        : !isRushFormat(deck.format)
    );

    const [cardCountRows, signatureCards] =
      await Promise.all([
        prisma.card.groupBy({
          by: ["archetype"],

          where: {
            archetype: {
              in: SEEDS.map(
                (seed) => seed.cardArchetype
              ),
            },
          },

          _count: {
            _all: true,
          },
        }),

        prisma.card.findMany({
          where: {
            name: {
              in: SEEDS.map(
                (seed) => seed.signatureCard
              ),
            },
          },

          select: {
            name: true,
            ygoproId: true,
            image: true,
          },
        }),
      ]);

    const cardCounts = new Map(
      cardCountRows.map((row) => [
        row.archetype ?? "",
        row._count._all,
      ])
    );

    const signatures = new Map(
      signatureCards.map((card) => [
        card.name,
        card,
      ])
    );

    const aliasIndex = new Map<
      string,
      ArchetypeSeed
    >();

    for (const seed of SEEDS) {
      aliasIndex.set(normalize(seed.name), seed);

      aliasIndex.set(
        normalize(seed.cardArchetype),
        seed
      );

      for (const alias of seed.aliases) {
        aliasIndex.set(normalize(alias), seed);
      }
    }

    const decksBySeed = new Map<
      string,
      DeckForTierList[]
    >();

    for (const deck of formatDecks) {
      const seed = resolveDeckSeed(deck, aliasIndex);

      if (!seed) {
        continue;
      }

      const current =
        decksBySeed.get(seed.key) ?? [];

      current.push(deck);

      decksBySeed.set(seed.key, current);
    }

    const archetypes: TierListArchetype[] =
      SEEDS.map((seed) => {
        const seedDecks =
          decksBySeed.get(seed.key) ?? [];

        const band =
          bestBand(
            seedDecks.map((deck) =>
              bandFromTier(deck.tier)
            )
          ) ?? seed.fallbackTier;

        const cardCount =
          cardCounts.get(seed.cardArchetype) ?? 0;

        const signature =
          signatures.get(seed.signatureCard);

        const tournamentResults = seedDecks.reduce(
          (total, deck) =>
            total + deck.tournamentResults,
          0
        );

        const popularity = seedDecks.reduce(
          (total, deck) => total + deck.popularity,
          0
        );

        return {
          key: seed.key,

          name: seed.name,

          searchTerm: seed.searchTerm,

          tier: band,

          powerScore: scoreArchetype({
            band,
            deckCount: seedDecks.length,
            tournamentResults,
            popularity,
            cardCount,
          }),

          deckCount: seedDecks.length,

          cardCount,

          image:
            signature?.image ??
            (signature?.ygoproId
              ? `/cards/${signature.ygoproId}.jpg`
              : null),

          signatureName:
            signature?.name ?? null,
        };
      });

    const bands: TierListBand[] = TIER_ORDER.map(
      (key) => ({
        key,

        archetypes: archetypes
          .filter(
            (archetype) => archetype.tier === key
          )
          .sort(
            (a, b) =>
              b.powerScore - a.powerScore ||
              b.deckCount - a.deckCount ||
              a.name.localeCompare(b.name)
          ),
      })
    );

    const latestUpdate = formatDecks.reduce(
      (latest, deck) =>
        deck.updatedAt.getTime() > latest
          ? deck.updatedAt.getTime()
          : latest,
      0
    );

    return {
      format,

      updatedAt: new Date(
        latestUpdate || Date.now()
      ).toISOString(),

      totalPublicDecks: formatDecks.length,

      totalArchetypes: archetypes.length,

      hasData: formatDecks.length > 0,

      bands,
    };
  }
);
