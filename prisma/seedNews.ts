import "dotenv/config";

import { Prisma, PrismaClient } from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

type SeedCategory =
  | "UPDATES"
  | "EVENTS"
  | "BOXES"
  | "BANLIST";

interface NewsSectionSeed {
  heading: string;

  paragraphs: string[];

  bullets?: string[];
}

interface NewsSeed {
  slug: string;

  title: string;

  summary: string;

  category: SeedCategory;

  coverUrl: string;

  author: string;

  createdAt: string;

  tags: string[];

  featuredCardNames: string[];

  sections: NewsSectionSeed[];
}

const NEWS: NewsSeed[] = [
  {
    slug: "shooting-majesty-box-review",
    title:
      "Shooting Majesty Box Review: Dragons, Reprints and Value",
    summary:
      "The new box brings Dragon support, a handful of high-impact reprints and a few cards that could reshape the sideboard. We break down every rarity.",
    category: "BOXES",
    coverUrl:
      "https://s3.duellinksmeta.com/img/content/box-reviews/shootingmajesty.webp",
    author: "Card Meta Staff",
    createdAt: "2026-11-03T08:15:00.000Z",
    tags: ["Shooting Majesty", "Box Review", "Dragons"],
    featuredCardNames: [
      "Red-Eyes Black Dragon",
      "Blue-Eyes White Dragon",
      "Forbidden Droplet",
    ],
    sections: [
      {
        heading: "What Is Inside",
        paragraphs: [
          "Shooting Majesty focuses on Dragon support with a selection of cards that already have a place in competitive lists. The box also includes reprints aimed at lowering the entry cost for newer players.",
          "The banner and release window match the official Duel Links Meta database, so the contents can be treated as final.",
        ],
      },
      {
        heading: "Reprints That Matter",
        paragraphs: [
          "Forbidden Droplet remains one of the most demanded cards in the format. Its reprint has a direct impact on the market and makes several decks more accessible.",
        ],
        bullets: [
          "Forbidden Droplet as a high-impact reprint.",
          "Dragon support with direct synergy for Blue-Eyes and Red-Eyes.",
          "Removal cards for the current format's sideboard.",
        ],
      },
      {
        heading: "Should You Pull?",
        paragraphs: [
          "If you already play a Dragon deck, the box offers enough relevant cards to justify a pull. If you are building a different archetype, the reprints are the main reason to open packs.",
          "As always, compare the cost of the box against crafting the individual cards you need before committing your gems.",
        ],
      },
    ],
  },
  {
    slug: "banlist-impact-analysis",
    title:
      "Banlist Impact: What Changes for the Top Decks",
    summary:
      "The latest banlist hits several engine cards and opens room for slower strategies. We analyze the winners, the losers and the decks that could rise.",
    category: "BANLIST",
    coverUrl:
      "https://s3.duellinksmeta.com/img/content/box-reviews/destructiongeas.webp",
    author: "Card Meta Staff",
    createdAt: "2026-10-30T10:45:00.000Z",
    tags: ["Banlist", "Meta", "Competitive"],
    featuredCardNames: [
      "Snake-Eyes Poplar",
      "Dark Magician",
      "S:P Little Knight",
    ],
    sections: [
      {
        heading: "The Changes",
        paragraphs: [
          "The new banlist targets the consistency of the fastest engines in the format. Several starter cards move to limited, which forces decks to choose between explosive openings and resilient follow-up plays.",
          "The changes do not remove any archetype from the format, but they do slow down the pace of the first turns.",
        ],
      },
      {
        heading: "Winners and Losers",
        paragraphs: [
          "Decks that can function with fewer copies of their starter gain the most. Control strategies benefit from the slower pace and from the extra room in the sideboard.",
          "Explosive combo decks lose some of their redundancy. They remain viable, but they can no longer rely on opening the same line every game.",
        ],
        bullets: [
          "Control and midrange decks gain ground.",
          "One-card combo decks lose consistency.",
          "Sideboards will lean more heavily on back-row removal.",
        ],
      },
      {
        heading: "What Comes Next",
        paragraphs: [
          "The first events after a banlist usually define the new hierarchy. Watch the Top 8 lists in the tournaments section to see which adaptations actually perform.",
          "We will update the tier list once enough results are available to separate real trends from one-week surprises.",
        ],
      },
    ],
  },
];

async function main() {
  for (const article of NEWS) {
    const content = {
      tags: article.tags,

      featuredCardNames:
        article.featuredCardNames,

      sections: article.sections,
    } as unknown as Prisma.InputJsonValue;

    await prisma.newsArticle.upsert({
      where: {
        slug: article.slug,
      },

      create: {
        slug: article.slug,

        title: article.title,

        summary: article.summary,

        category: article.category,

        coverUrl: article.coverUrl,

        author: article.author,

        content,

        createdAt: new Date(
          article.createdAt
        ),
      },

      update: {
        title: article.title,

        summary: article.summary,

        category: article.category,

        coverUrl: article.coverUrl,

        author: article.author,

        content,

        createdAt: new Date(
          article.createdAt
        ),
      },
    });
  }

  console.log(
    `Seeded ${NEWS.length} news articles.`
  );
}

main()
  .catch((error) => {
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
