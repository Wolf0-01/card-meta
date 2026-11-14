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
    slug: "meta-weekly-312-recap",
    title:
      "Meta Weekly #312 Recap: Snake-Eye Takes the Crown",
    summary:
      "Three copies of Poplar, a compact engine and a mirror match that came down to the first interruption. Here is everything that happened at Meta Weekly #312.",
    category: "UPDATES",
    coverUrl:
      "https://s3.duellinksmeta.com/img/content/box-reviews/shootingmajesty.webp",
    author: "Card Meta Staff",
    createdAt: "2026-11-10T09:30:00.000Z",
    tags: ["Meta Weekly", "Snake-Eye", "Competitive"],
    featuredCardNames: [
      "Snake-Eyes Poplar",
      "Snake-Eyes Flamberge Dragon",
      "Promethean Princess, Bestower of Flames",
      "S:P Little Knight",
    ],
    sections: [
      {
        heading: "The Weekend Result",
        paragraphs: [
          "Snake-Eye is back at the top of Meta Weekly. The winning list leans on a compact engine with three copies of Snake-Eyes Poplar and a package of extenders that lets it play through one interruption without committing the entire board.",
          "The most important takeaway is not the win but the consistency: the archetype appeared in four of the eight Top 8 slots. The community already treats it as the deck to beat, and sideboard plans are starting to reflect that.",
        ],
      },
      {
        heading: "The Winning List",
        paragraphs: [
          "The winning build prioritizes the ability to rebuild the board on turn two. Promethean Princess works as both an extension and a recurring threat, while S:P Little Knight offers a clean out to heavily loaded boards.",
          "The sideboard balances monster answers with tools for the mirror. There is no room for situational cards: every slot has to serve in at least two top-cut matchups.",
        ],
        bullets: [
          "Three Poplar to maximize opening odds.",
          "A hand-trap package tuned to the pace of the format.",
          "Close with Flamberge and keep pressure on the following turn.",
        ],
      },
      {
        heading: "What to Watch in the Mirror",
        paragraphs: [
          "The mirror comes down to who manages the first interruption better. Holding the right extender is worth more than forcing a full board, especially when the opponent has access to Kurikara or a targeted removal spell.",
          "Next week will be key to see whether the rest of the top cut adapts its lists or Snake-Eye keeps setting the pace of the format.",
        ],
      },
    ],
  },
  {
    slug: "community-clash-season-4",
    title:
      "Community Clash Season 4: Schedule and Format",
    summary:
      "The next Community Clash season opens registration this week. Here is the full schedule, the format rules and how the Top 8 will be published on Card Meta.",
    category: "EVENTS",
    coverUrl:
      "https://s3.duellinksmeta.com/img/content/box-reviews/AnnivBoxDragoon.webp",
    author: "Card Meta Staff",
    createdAt: "2026-11-07T12:00:00.000Z",
    tags: ["Community Clash", "Events", "Speed Duel"],
    featuredCardNames: [
      "Blue-Eyes White Dragon",
      "Dark Magician",
      "Sky Striker Ace - Raye",
    ],
    sections: [
      {
        heading: "Season Overview",
        paragraphs: [
          "Community Clash returns for a fourth season with a Speed Duel format and a Swiss bracket followed by a Top 8 cut. Registration is open to every player with a public deck list on Card Meta.",
          "The season runs for four weekends. Each event awards points toward the seasonal leaderboard, and the top players qualify for the invitational at the end of the cycle.",
        ],
      },
      {
        heading: "Schedule",
        paragraphs: [
          "Matches are played on Saturdays and Sundays, with check-in opening thirty minutes before the first round. Players who miss check-in are moved to the substitute pool for that weekend.",
        ],
        bullets: [
          "Week 1: Swiss rounds and Top 8.",
          "Week 2: Swiss rounds and Top 8.",
          "Week 3: Swiss rounds and Top 8.",
          "Week 4: Seasonal finals.",
        ],
      },
      {
        heading: "How Results Are Published",
        paragraphs: [
          "Every Top 8 list will be added to the tournaments section once the organizers confirm the standings. When a player publishes their deck, the placement links directly to the exact list.",
          "If a list is not public, the placement links to a reference build of the same archetype so you can still study the strategy.",
        ],
      },
    ],
  },
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
