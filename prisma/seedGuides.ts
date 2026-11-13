import "dotenv/config";

import { Prisma, PrismaClient } from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

interface GuideSectionSeed {
  heading: string;

  paragraphs: string[];

  bullets?: string[];
}

interface GuideSeed {
  slug: string;

  title: string;

  summary: string;

  author: string;

  featured: boolean;

  createdAt: string;

  /** Slug del set cuyo banner oficial se usa como portada. */
  coverSetSlug: string;

  tags: string[];

  featuredCardNames: string[];

  sections: GuideSectionSeed[];
}

const GUIDES: GuideSeed[] = [
  {
    slug: "blue-eyes-zephyr-guide",
    title:
      "Blue-Eyes: The Zephyr Guide for the Current Format",
    summary:
      "How to build the Dragon engine, which ratios survive the banlist, and why the Skill still makes the difference.",
    author: "Rin",
    featured: true,
    createdAt: "2026-11-10T10:00:00.000Z",
    coverSetSlug: "shooting-majesty",
    tags: ["Blue-Eyes", "Speed Duel", "Dragon"],
    featuredCardNames: [
      "Blue-Eyes White Dragon",
      "Blue-Eyes Alternative White Dragon",
      "Sage with Eyes of Blue",
      "The White Stone of Ancients",
      "Dragon Spirit of White",
      "Blue-Eyes Spirit Dragon",
    ],
    sections: [
      {
        heading: "The Engine",
        paragraphs: [
          "Blue-Eyes remains a deck of constant pressure. The Dragon base and the search cards allow a solid opening board, but the difference between a good list and an excellent one lies in the ratios.",
          "The goal is to maximize the chance of seeing a starter without filling the deck with pieces that only work in combination. Consistency matters more than the theoretical ceiling.",
        ],
      },
      {
        heading: "Ratios and Consistency",
        paragraphs: [
          "The banlist forces some configurations to be reconsidered. Ratios that used to be standard now leave the deck short on interaction, so it is worth reserving space for versatile answers.",
          "Sage with Eyes of Blue and The White Stone of Ancients are the backbone of the engine. Keep enough copies to open with them, but do not turn the deck into a pile of cards that do nothing on their own.",
        ],
        bullets: [
          "Prioritize starters that work without a second card.",
          "Avoid more than two copies of situational pieces.",
          "Reserve at least four slots for broad interaction.",
          "Tune the sideboard to the expected top cut.",
        ],
      },
      {
        heading: "The Skill",
        paragraphs: [
          "The Skill remains a central part of the plan. It not only improves consistency but also enables lines that would be impossible with a generic deck. Choosing the right Skill changes the recommended ratios.",
          "In the mirror, the Skill sets the pace. Whoever leverages it first usually forces the opponent to answer with resources they will need later.",
        ],
      },
      {
        heading: "Matchups",
        paragraphs: [
          "Against Snake-Eye, the plan is to interrupt the first extender and not spend all removal on the initial board. Against control decks, Blue-Eyes needs to close quickly before the opponent builds an advantage.",
          "The key is identifying which card the opponent cannot afford to lose and saving the answer for that moment. Blue-Eyes Spirit Dragon is the safest bridge between the early game and the closing turn.",
        ],
        bullets: [
          "Snake-Eye: break the first link of the chain.",
          "Control: pressure the backrow before it snowballs.",
          "Mirror: hold the Skill for the turn that matters.",
        ],
      },
    ],
  },
  {
    slug: "snake-eye-combo-guide",
    title:
      "Snake-Eye Guide: Lines, Extenders, and Closers",
    summary:
      "From the Poplar opener to the Flamberge line: how to chain the combo without running out of resources and when to break the turn.",
    author: "Wolf",
    featured: true,
    createdAt: "2026-11-08T12:00:00.000Z",
    coverSetSlug: "selection-box-mini-vol-8",
    tags: ["Snake-Eye", "Combos", "Fire"],
    featuredCardNames: [
      "Snake-Eyes Poplar",
      "Snake-Eyes Flamberge Dragon",
      "Promethean Princess, Bestower of Flames",
      "I:P Masquerena",
    ],
    sections: [
      {
        heading: "The Opener",
        paragraphs: [
          "The most efficient line starts with Poplar and a card that turns it into an extender. The goal is not to deploy everything, but to reach the first Link with enough resources to answer an interruption.",
          "If the hand cannot complete the sequence, prioritize an intermediate board with one negation and a recurring threat. Forcing the full combo usually leaves the turn with no cards and no backup plan.",
        ],
      },
      {
        heading: "Extenders",
        paragraphs: [
          "Promethean Princess is the piece that turns a correct opener into a multi-turn threat. Its value increases when the opponent relies on destroying monsters to activate their own conditions.",
          "I:P Masquerena lets you play on the opponent's turn and protects the closing board. You do not always have to use it immediately: sometimes it is better to save it to answer a key removal.",
        ],
      },
      {
        heading: "Closers and Board",
        paragraphs: [
          "The ideal board combines an early interruption with a source of pressure that forces the opponent to spend resources. Flamberge and S:P Little Knight fill that role without demanding too many extra cards.",
        ],
        bullets: [
          "Do not overextend if you already have an active interruption.",
          "Save one extender for the opponent's turn.",
          "Prioritize the line that survives a single negation.",
          "Track the graveyard: it is part of the engine.",
        ],
      },
      {
        heading: "Common Mistakes",
        paragraphs: [
          "The most frequent mistake is chaining the combo without reading the opponent's graveyard. Kurikara and other punish tools can turn a huge board into an immediate loss.",
          "The second mistake is ignoring the resource clock: Snake-Eye wins long games, but only if it keeps access to its engine. Managing the graveyard is as important as managing the hand.",
        ],
      },
    ],
  },
  {
    slug: "dark-magician-consistency-guide",
    title:
      "Dark Magician: Consistency Over Nostalgia",
    summary:
      "Ratio adjustments, search cards, and a clear game plan so the magician stops depending on the perfect hand.",
    author: "Dante",
    featured: false,
    createdAt: "2026-11-05T09:00:00.000Z",
    coverSetSlug:
      "dark-magician-the-magician-of-black-magic",
    tags: ["Dark Magician", "Consistency", "Control"],
    featuredCardNames: [
      "Dark Magician",
      "Dark Magical Circle",
      "Magician's Rod",
      "Eternal Soul",
      "I:P Masquerena",
      "Knightmare Phoenix",
    ],
    sections: [
      {
        heading: "The Consistency Problem",
        paragraphs: [
          "Dark Magician has a known problem: many good hands and very few perfect hands. The difference between winning and losing usually comes down to turning a mediocre opener into a functional board.",
          "The solution is not to add more combo cards but to reduce variance and ensure every card has a clear role in the opening hand.",
        ],
      },
      {
        heading: "Recommended Ratios",
        paragraphs: [
          "The deck's core must guarantee access to the magician and to an interaction card. Ratios that work in tournaments are usually more conservative than internet lists make them look.",
          "Magician's Rod and Dark Magical Circle provide the search engine. Eternal Soul is the payoff, but it should not be the only reason the deck functions.",
        ],
        bullets: [
          "Keep the main engine at the viable minimum.",
          "Include cards that work on their own in hand.",
          "Reserve space for broad-spectrum answers.",
          "Do not cut interaction to fit more copies of the boss.",
        ],
      },
      {
        heading: "Game Plan",
        paragraphs: [
          "The plan is simple: survive the first turn, recover resources, and win the exchange. Dark Magician does not need to close in one turn; it needs to avoid running out of cards.",
          "I:P Masquerena and Knightmare Phoenix provide flexibility to interact without committing the engine. They are support pieces, not the center of the combo.",
        ],
      },
      {
        heading: "Side Deck Adjustments",
        paragraphs: [
          "The sideboard must cover the most common top-cut matchups. Against Fire decks, prioritize early interruptions. Against control, add pressure and ways to break established boards.",
          "If the format speeds up, trim the slowest trap and bring hand traps. If it slows down, Eternal Soul becomes much more valuable and the deck can afford a longer game.",
        ],
      },
    ],
  },
  {
    slug: "labrynth-trap-control-guide",
    title:
      "Labrynth: Trap Control Without Wasting Resources",
    summary:
      "How to sequence the Welcome package, when to commit Lovely Labrynth, and which traps actually earn their slot in the current format.",
    author: "Mira",
    featured: false,
    createdAt: "2026-11-02T14:30:00.000Z",
    coverSetSlug: "the-end-of-dominion",
    tags: ["Labrynth", "Control", "Traps"],
    featuredCardNames: [
      "Labrynth Labyrinth",
      "Lovely Labrynth of the Silver Castle",
      "Arianna the Labrynth Servant",
      "Welcome Labrynth",
      "Big Welcome Labrynth",
      "Labrynth Chandraglier",
    ],
    sections: [
      {
        heading: "The Core Loop",
        paragraphs: [
          "Labrynth wins by trading one trap for one threat and then recovering the trap. The deck is not trying to build an unbeatable board; it is trying to make every opponent turn expensive.",
          "Labrynth Labyrinth is the card that turns the engine on. Without it, the deck still functions, but the recursion and the extra disruption disappear.",
        ],
      },
      {
        heading: "Sequencing the Welcome Package",
        paragraphs: [
          "Welcome Labrynth and Big Welcome Labrynth are not interchangeable. The first one starts the engine; the second one extends it and can return a monster for a second use.",
          "Do not fire both on the first turn unless the payoff wins the game. Holding Big Welcome for the opponent's turn is often the difference between a good and a great hand.",
        ],
        bullets: [
          "Open with Welcome Labrynth when you need a body.",
          "Save Big Welcome for the opponent's turn when possible.",
          "Use Arianna to find the trap you actually need.",
          "Do not commit Lovely without a follow-up trap.",
        ],
      },
      {
        heading: "Trap Selection",
        paragraphs: [
          "The trap lineup should answer the decks you expect, not the decks you fear. Broad cards that also trigger the Labrynth effects are worth more than narrow answers with a higher ceiling.",
          "Labrynth Chandraglier is a strong bridge between the monster and trap halves of the deck. It keeps the engine moving while leaving room for interaction.",
        ],
      },
      {
        heading: "Matchups and Sideboarding",
        paragraphs: [
          "Against combo, prioritize interruption that resolves before the opponent builds a board. Against midrange, the long game favors Labrynth as long as the trap count stays high.",
          "The sideboard should fix the worst matchup without turning the main deck into a pile of conditional cards. Two or three dedicated slots are usually enough.",
        ],
      },
    ],
  },
  {
    slug: "sky-striker-resource-guide",
    title:
      "Sky Striker: Resource Management and Board Breaking",
    summary:
      "A practical guide to the Engage loop, Widow Anchor timing, and the Extra Deck slots that matter in the current meta.",
    author: "Rin",
    featured: false,
    createdAt: "2026-10-29T11:15:00.000Z",
    coverSetSlug: "eternal-genesis",
    tags: ["Sky Striker", "Control", "Spells"],
    featuredCardNames: [
      "Sky Striker Ace - Raye",
      "Sky Striker Mobilize - Engage!",
      "Sky Striker Mecha - Widow Anchor",
      "Sky Striker Ace - Kagari",
      "Sky Striker Ace - Shizuku",
      "Forbidden Droplet",
    ],
    sections: [
      {
        heading: "The Engine",
        paragraphs: [
          "Sky Striker is a deck about converting one monster into a stream of spells. Raye is the starter, but the real engine is the graveyard: every spell you resolve makes the next one better.",
          "The first turn is usually defensive. Build a board that can survive, keep a spell in hand, and let the opponent commit before you choose the right answer.",
        ],
      },
      {
        heading: "Engage and the Spell Economy",
        paragraphs: [
          "Sky Striker Mobilize - Engage! is the card that refills the hand and keeps the engine running. Using it at the wrong time is the most common way to lose with the deck.",
          "Do not fire Engage just because you can. Ask what the extra card unlocks: a board breaker, a follow-up Raye, or the third spell for your next effect.",
        ],
        bullets: [
          "Keep three spells in the graveyard when possible.",
          "Use Engage to find the answer, not to cycle.",
          "Do not expose Raye without a recovery line.",
          "Track the opponent's backrow before committing.",
        ],
      },
      {
        heading: "Widow Anchor Timing",
        paragraphs: [
          "Sky Striker Mecha - Widow Anchor is the deck's most flexible interaction. It can steal a monster, negate an effect, or simply force a response.",
          "The best timing is usually the moment the opponent commits to a line that depends on one monster. Stealing the right body is often better than negating the first effect.",
        ],
      },
      {
        heading: "Extra Deck and Closing",
        paragraphs: [
          "Kagari recovers spells; Shizuku finds the next one. The rest of the Extra Deck should solve specific problems without diluting the core.",
          "Forbidden Droplet is a strong complement because it turns extra spells into interaction. The deck wins by exhausting the opponent, not by building a huge board.",
        ],
      },
    ],
  },
  {
    slug: "swordsoul-wyrm-tempo-guide",
    title:
      "Swordsoul: Wyrm Tempo for the New Format",
    summary:
      "Mo Ye lines, Chixiao timing, and the hand-trap package that keeps Swordsoul competitive without overcommitting.",
    author: "Wolf",
    featured: false,
    createdAt: "2026-10-25T08:45:00.000Z",
    coverSetSlug: "quest-of-transam",
    tags: ["Swordsoul", "Synchro", "Tempo"],
    featuredCardNames: [
      "Swordsoul of Mo Ye",
      "Swordsoul Grandmaster - Chixiao",
      "Swordsoul Supreme Sovereign - Chengying",
      "Ash Blossom & Joyous Spring",
      "Effect Veiler",
      "Nibiru, the Primal Being",
    ],
    sections: [
      {
        heading: "The Mo Ye Opener",
        paragraphs: [
          "Swordsoul of Mo Ye is the cleanest starter in the deck. The goal is to convert it into Chixiao while keeping a Wyrm in hand for the follow-up turn.",
          "The deck does not need to build five negations. A single well-timed Chixiao plus a hand trap is often enough to survive the first turn and take control.",
        ],
      },
      {
        heading: "Chixiao and Chengying",
        paragraphs: [
          "Swordsoul Grandmaster - Chixiao is the backbone: it searches, it negates, and it forces the opponent to play around it. Chengying is the closer that punishes trades and keeps the board stable.",
          "Do not make both without a reason. The Extra Deck is a resource, and the deck needs room for situational answers.",
        ],
        bullets: [
          "Make Chixiao when you need interaction.",
          "Make Chengying when the game goes long.",
          "Keep a Wyrm for the next turn.",
          "Do not overcommit into Nibiru.",
        ],
      },
      {
        heading: "Hand Traps",
        paragraphs: [
          "Ash Blossom & Joyous Spring and Effect Veiler are the default interaction package. They cover the most common combo starters without taking space from the engine.",
          "Nibiru, the Primal Being is a calculated risk. It is excellent against decks that build a full board, but it does nothing against a compact one.",
        ],
      },
      {
        heading: "Matchups",
        paragraphs: [
          "Against combo, the plan is to interrupt the first search and force the opponent to improvise. Against control, Swordsoul needs to pressure early and not give the opponent time to set up.",
          "The deck rewards patience. A mediocre board with two interaction points is usually better than an impressive board with none.",
        ],
      },
    ],
  },
];

async function main() {
  const setSlugs = Array.from(
    new Set(GUIDES.map((guide) => guide.coverSetSlug))
  );

  const sets = await prisma.setMeta.findMany({
    where: {
      slug: {
        in: setSlugs,
      },
    },

    select: {
      slug: true,
      name: true,
      bannerUrl: true,
    },
  });

  const setsBySlug = new Map(
    sets.map((set) => [set.slug, set])
  );

  for (const guide of GUIDES) {
    const set = setsBySlug.get(guide.coverSetSlug);

    if (!set?.bannerUrl) {
      throw new Error(
        `No official banner found for set "${guide.coverSetSlug}" (guide "${guide.slug}").`
      );
    }

    const content = {
      tags: guide.tags,

      featuredCardNames: guide.featuredCardNames,

      sections: guide.sections,
    } as unknown as Prisma.InputJsonObject;

    await prisma.guide.upsert({
      where: {
        slug: guide.slug,
      },

      create: {
        slug: guide.slug,

        title: guide.title,

        summary: guide.summary,

        coverUrl: set.bannerUrl,

        author: guide.author,

        featured: guide.featured,

        content,

        createdAt: new Date(guide.createdAt),
      },

      update: {
        title: guide.title,

        summary: guide.summary,

        coverUrl: set.bannerUrl,

        author: guide.author,

        featured: guide.featured,

        content,
      },
    });

    console.log(
      `✔ ${guide.slug} · ${set.name}`
    );
  }

  console.log(
    `\n${GUIDES.length} guides seeded successfully.`
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
