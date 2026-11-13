import { cache } from "react";

import { getCardImageSrc } from "@/lib/cards/image";

import { mapPrismaCardPreview } from "@/lib/mappers/cardMapper";

import type { NewsCategoryKey } from "@/lib/newsCategories";

import { prisma } from "@/lib/prisma";

import type { CardPreviewData } from "@/types/CardPreviewData";

export {
  getNewsCategory,
  NEWS_CATEGORIES,
  type NewsCategoryDefinition,
  type NewsCategoryKey,
} from "@/lib/newsCategories";

export interface NewsSection {
  heading: string;

  paragraphs: string[];

  bullets?: string[];
}

interface NewsBannerSeed {
  kind: "set" | "card";

  slug: string;
}

interface NewsArticleSeed {
  slug: string;

  title: string;

  summary: string;

  category: NewsCategoryKey;

  author: string;

  publishedAt: string;

  tags: string[];

  banner: NewsBannerSeed | null;

  featuredCardNames: string[];

  sections: NewsSection[];
}

export interface NewsArticle {
  slug: string;

  title: string;

  summary: string;

  category: NewsCategoryKey;

  author: string;

  publishedAt: string;

  readingMinutes: number;

  tags: string[];

  bannerUrl: string | null;

  bannerAlt: string;

  featuredCards: CardPreviewData[];

  sections: NewsSection[];
}

const ARTICLE_SEEDS: NewsArticleSeed[] = [
  {
    slug: "snake-eye-domina-meta-weekly-312",
    title: "Snake-Eye Dominates Meta Weekly #312",
    summary:
      "The Fire archetype once again posted the best result of the weekend: three copies of Poplar, an untouched sideboard, and a mirror match that already has an answer.",
    category: "updates",
    author: "Card Meta Staff",
    publishedAt: "2026-11-10T09:30:00.000Z",
    tags: ["Snake-Eye", "Meta Weekly", "Competitive"],
    banner: {
      kind: "set",
      slug: "shooting-majesty",
    },
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
    slug: "guia-snake-eye-combos",
    title: "Snake-Eye Guide: Lines, Extenders, and Closers",
    summary:
      "From the Poplar opener to the Flamberge line: how to chain the combo without running out of resources and when to break the turn.",
    category: "guides",
    author: "Wolf",
    publishedAt: "2026-11-08T12:00:00.000Z",
    tags: ["Snake-Eye", "Guide", "Combos"],
    banner: {
      kind: "card",
      slug: "Snake-Eyes-Poplar",
    },
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
          "I:P Masquerena lets you play on the opponent's turn and protects the combo's closing board. You do not always have to use it immediately: sometimes it is better to save it to answer a key removal.",
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
    slug: "filtracion-shooting-majesty",
    title: "Shooting Majesty: Leaks, Reprints, and Key Cards",
    summary:
      "The next box arrives with Dragon support and a selection of reprints that could move the UR market.",
    category: "leaks",
    author: "Card Meta Staff",
    publishedAt: "2026-11-06T08:15:00.000Z",
    tags: ["Shooting Majesty", "Leaks", "Box"],
    banner: {
      kind: "set",
      slug: "shooting-majesty",
    },
    featuredCardNames: [
      "Red-Eyes Black Dragon",
      "Blue-Eyes White Dragon",
      "Forbidden Droplet",
    ],
    sections: [
      {
        heading: "What the Leak Suggests",
        paragraphs: [
          "The first Shooting Majesty leaks point to a box focused on Dragon support, with several cards that already have a place in competitive lists. The information is not official yet, so treat the ratios as provisional.",
          "The set banner is already available in the Duel Links Meta database and matches the visual line of recent releases. That does not confirm the contents, but it does confirm the release window.",
        ],
      },
      {
        heading: "Reprints That Matter",
        paragraphs: [
          "If the leaked reprints are confirmed, the box could lower the entry cost for several archetypes. Forbidden Droplet remains one of the most demanded cards, and its reprint would have a direct impact on the market.",
        ],
        bullets: [
          "Forbidden Droplet as a high-impact reprint.",
          "Dragon support with direct synergy for Blue-Eyes and Red-Eyes.",
          "Removal cards for the current format's sideboard.",
        ],
      },
      {
        heading: "Competitive Impact",
        paragraphs: [
          "A box with Dragon support and staple reprints usually moves the meta in two directions: it improves the consistency of existing decks and lowers the entry barrier for new players.",
          "The key will be whether the new cards solve Blue-Eyes' current problems or simply add extra lines to an already strong archetype.",
        ],
      },
      {
        heading: "What Remains to Be Confirmed",
        paragraphs: [
          "Rarities, ratios, and the exact in-game availability date remain unconfirmed. Until then, the recommendation is not to spend gems based on a leak and to wait for official information.",
        ],
      },
    ],
  },
  {
    slug: "banlist-noviembre-2026-analisis",
    title: "November Banlist: The Cards That Change the Format",
    summary:
      "We break down the hits and releases from the latest list and which archetypes gain or lose consistency in Speed Duel.",
    category: "banlist",
    author: "Card Meta Staff",
    publishedAt: "2026-11-04T18:00:00.000Z",
    tags: ["Banlist", "Speed Duel", "Meta"],
    banner: {
      kind: "card",
      slug: "Forbidden-Droplet",
    },
    featuredCardNames: [
      "Forbidden Droplet",
      "Lightning Storm",
      "Kurikara Divincarnate",
    ],
    sections: [
      {
        heading: "The Hits",
        paragraphs: [
          "The new list touches several of the tools that dominated the last tournament cycle. The limits aim to reduce free interaction and force decks to choose between consistency and response power.",
          "Forbidden Droplet and Lightning Storm remain central cards in the format, but their availability changes by archetype. Decks that relied on both lose room to maneuver.",
        ],
      },
      {
        heading: "The Releases",
        paragraphs: [
          "The releases benefit archetypes that had fallen out of the top cut. Some pieces are available again, reopening lines of play that had not been seen in competitive play for months.",
          "The most immediate effect will be felt in control decks, which regain tools to manage large boards without committing the entire sideboard.",
        ],
      },
      {
        heading: "Winners and Losers",
        paragraphs: [
          "Snake-Eye holds its position thanks to an engine that does not depend on a single card. Blue-Eyes and Dark Magician gain some breathing room, though they still need to solve their consistency issues.",
        ],
        bullets: [
          "Winners: archetypes with internal engines and few dependencies.",
          "Losers: lists that leaned on a single interruption.",
          "Watch: the return of removal cards to the sideboard.",
        ],
      },
      {
        heading: "How to Adjust Your List",
        paragraphs: [
          "Before changing the entire deck, review which banlist cards you used and what role they played. In many cases, swapping one interruption for another is enough to keep the game plan.",
          "The first week after a banlist is always full of experiments. Wait for community tournament results before spending gems on a new archetype.",
        ],
      },
    ],
  },
  {
    slug: "guia-blue-eyes-cefiro",
    title: "Blue-Eyes: The Zephyr Guide for the Current Format",
    summary:
      "How to build the Dragon engine, which ratios survive the banlist, and why the Skill still makes the difference.",
    category: "guides",
    author: "Rin",
    publishedAt: "2026-11-01T10:00:00.000Z",
    tags: ["Blue-Eyes", "Guide", "Speed Duel"],
    banner: {
      kind: "card",
      slug: "Blue-Eyes-White-Dragon",
    },
    featuredCardNames: [
      "Blue-Eyes White Dragon",
      "Forbidden Droplet",
      "S:P Little Knight",
      "Kurikara Divincarnate",
    ],
    sections: [
      {
        heading: "The Engine",
        paragraphs: [
          "Blue-Eyes remains a deck of constant pressure. The Dragon base and search cards allow a solid opening board, but the difference between a good list and an excellent one lies in the ratios.",
          "The goal is to maximize the chance of seeing a starter without filling the deck with pieces that only work in combination. Consistency matters more than the theoretical ceiling.",
        ],
      },
      {
        heading: "Ratios and Consistency",
        paragraphs: [
          "The banlist forces some configurations to be reconsidered. Ratios that used to be standard now leave the deck short on interaction, so it is worth reserving space for versatile answers.",
        ],
        bullets: [
          "Prioritize starters that work on their own.",
          "Avoid more than two copies of situational pieces.",
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
          "The key is identifying which card the opponent cannot afford to lose and saving the answer for that moment.",
        ],
      },
    ],
  },
  {
    slug: "selection-box-mini-vol-8",
    title: "Selection Box Mini Vol. 8: The Best of the New Mini Box",
    summary:
      "We review the cards with the most competitive potential in the mini box and the ones to avoid if you are looking for gem efficiency.",
    category: "leaks",
    author: "Card Meta Staff",
    publishedAt: "2026-10-28T07:45:00.000Z",
    tags: ["Selection Box", "Mini Box", "Gems"],
    banner: {
      kind: "set",
      slug: "selection-box-mini-vol-8",
    },
    featuredCardNames: [
      "Diabellstar the Black Witch",
      "WANTED: Seeker of Sinful Spoils",
      "S:P Little Knight",
    ],
    sections: [
      {
        heading: "Featured Cards",
        paragraphs: [
          "Selection Box Mini Vol. 8 arrives with several cards that already have a presence in the meta. Diabellstar and WANTED form a package with direct synergy, while S:P Little Knight remains one of the most versatile Extra Deck cards in the game.",
          "The box is aimed at players looking for specific pieces, not at completing an archetype from scratch. That completely changes how to evaluate its value.",
        ],
      },
      {
        heading: "Competitive Value",
        paragraphs: [
          "The presence of staples in a mini box usually translates into a better gem-to-value ratio, as long as the cards fit your decks. If you do not play the archetypes that use them, the math changes.",
        ],
        bullets: [
          "High value if you already have a Fire or Dark engine.",
          "Medium value for collectors and casual players.",
          "Low value if you only want one specific card and there is no guaranteed pity.",
        ],
      },
      {
        heading: "Gem-to-Value Ratio",
        paragraphs: [
          "Before opening, define how many cards from the box you actually need. If the number is below three, it is probably better to wait for a main box or a future reprint.",
          "Gem efficiency is not measured by card rarity but by how many competitive decks it can improve. A UR that does not fit your collection is worth less than an SR you use in three lists.",
        ],
      },
      {
        heading: "Verdict",
        paragraphs: [
          "The mini box is interesting for anyone who already has the engine needed to use its best cards. For everyone else, it is a collection of pieces that will likely return in future releases.",
        ],
      },
    ],
  },
  {
    slug: "aniversario-box-vol-04-repaso",
    title: "Anniversary Box Vol. 04: A Look at Its Best Cards",
    summary:
      "The anniversary box brings high-impact reprints and new pieces for Fire and Dragon archetypes.",
    category: "updates",
    author: "Card Meta Staff",
    publishedAt: "2026-10-24T11:20:00.000Z",
    tags: ["Anniversary Box", "Reprints", "Collection"],
    banner: {
      kind: "set",
      slug: "anniversary-box-vol-04",
    },
    featuredCardNames: [
      "Snake-Eyes Poplar",
      "Diabellstar the Black Witch",
      "Blue-Eyes White Dragon",
    ],
    sections: [
      {
        heading: "What's Inside",
        paragraphs: [
          "Anniversary Box Vol. 04 combines reprints of highly sought cards with new pieces for established archetypes. It is a release aimed at players who want to strengthen their collection without depending on a single archetype.",
          "The card selection touches Fire, Dragon, and Dark, three of the most present axes in the current format. That makes it a box with cross-archetype demand.",
        ],
      },
      {
        heading: "Key Reprints",
        paragraphs: [
          "Snake-Eyes Poplar and Diabellstar remain central cards in their respective engines. Their presence in the box lowers the entry barrier and increases the supply available on the market.",
        ],
        bullets: [
          "Poplar for Snake-Eye players.",
          "Diabellstar as a piece for Dark engines.",
          "Blue-Eyes White Dragon as an iconic reprint.",
        ],
      },
      {
        heading: "Is It Worth It?",
        paragraphs: [
          "It depends on how many of the featured cards you need. If you are missing two or more key pieces, the box makes sense. If you only want one, it is probably better to wait for a specific reprint.",
        ],
      },
      {
        heading: "Conclusion",
        paragraphs: [
          "It is a solid box for the community, with cards that will keep showing up in tournaments. It does not change the meta on its own, but it makes access easier to pieces that were previously hard to obtain.",
        ],
      },
    ],
  },
  {
    slug: "impacto-banlist-dark-magician",
    title: "The Banlist's Impact on Dark Magician",
    summary:
      "The list leaves the archetype in an awkward spot: less consistency, but a competitive ceiling that is still alive.",
    category: "banlist",
    author: "Dante",
    publishedAt: "2026-10-20T16:30:00.000Z",
    tags: ["Dark Magician", "Banlist", "Analysis"],
    banner: {
      kind: "card",
      slug: "Dark-Magician",
    },
    featuredCardNames: [
      "Dark Magician",
      "Lightning Storm",
      "Forbidden Droplet",
    ],
    sections: [
      {
        heading: "What Changed",
        paragraphs: [
          "Dark Magician loses part of the consistency that kept it in the top cut. The banlist does not destroy the archetype, but it forces a choice between search cards and defensive answers.",
          "The result is a list that is more fragile on the opening and more dependent on the quality of the starting hand. In a fast format, that is costly.",
        ],
      },
      {
        heading: "The List That Survives",
        paragraphs: [
          "The builds that adapt best reduce their dependence on a single line and add versatile interaction cards. The goal is to reach turn three with enough resources to close.",
        ],
        bullets: [
          "Fewer combo pieces and more immediate answers.",
          "A search engine tuned to the new limit.",
          "A sideboard aimed at the most frequent matchups.",
        ],
      },
      {
        heading: "Matchups",
        paragraphs: [
          "Against Snake-Eye, Dark Magician needs to interrupt the first extender and prevent the opponent from rebuilding the board. Against Blue-Eyes, the key is not running out of removal before the closing turn.",
          "The archetype still has a high ceiling, but it demands more careful resource management than before. It is not a deck to play on autopilot.",
        ],
      },
      {
        heading: "Verdict",
        paragraphs: [
          "Dark Magician remains viable in experienced hands, although it is no longer a comfortable top-cut option. The banlist punishes it, but does not eliminate it.",
        ],
      },
    ],
  },
  {
    slug: "guia-dark-magician-consistencia",
    title: "Dark Magician: Consistency Over Nostalgia",
    summary:
      "Ratio adjustments, search cards, and a clear game plan so the magician stops depending on the perfect hand.",
    category: "guides",
    author: "Dante",
    publishedAt: "2026-10-16T09:00:00.000Z",
    tags: ["Dark Magician", "Guide", "Consistency"],
    banner: {
      kind: "card",
      slug: "Dark-Magician",
    },
    featuredCardNames: [
      "Dark Magician",
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
        ],
        bullets: [
          "Keep the main engine at the viable minimum.",
          "Include cards that work on their own in hand.",
          "Reserve space for broad-spectrum answers.",
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
        ],
      },
    ],
  },
];

const FEATURED_CARD_SELECT = {
  id: true,

  ygoproId: true,

  name: true,

  slug: true,

  format: true,

  image: true,

  type: true,

  attribute: true,

  race: true,

  rarity: true,

  archetype: true,

  level: true,

  linkRating: true,

  linkMarkers: true,

  scale: true,

  attack: true,

  defense: true,

  frameType: true,

  description: true,
} as const;

function estimateReadingMinutes(
  sections: NewsSection[]
): number {
  const words = sections.reduce(
    (total, section) => {
      const paragraphWords = section.paragraphs.reduce(
        (sum, paragraph) =>
          sum + paragraph.trim().split(/\s+/).length,
        0
      );

      const bulletWords = (section.bullets ?? []).reduce(
        (sum, bullet) =>
          sum + bullet.trim().split(/\s+/).length,
        0
      );

      return total + paragraphWords + bulletWords;
    },
    0
  );

  return Math.max(3, Math.ceil(words / 180));
}

/**
 * Resolves banners and featured cards against PostgreSQL.
 *
 * Articles are curated editorial content, but images and card
 * data always come from the real database to avoid broken
 * links or images.
 */
export const getNewsArticles = cache(
  async (): Promise<NewsArticle[]> => {
    const featuredNames = Array.from(
      new Set(
        ARTICLE_SEEDS.flatMap(
          (article) => article.featuredCardNames
        )
      )
    );

    const bannerSetSlugs = Array.from(
      new Set(
        ARTICLE_SEEDS.flatMap((article) =>
          article.banner?.kind === "set"
            ? [article.banner.slug]
            : []
        )
      )
    );

    const bannerCardSlugs = Array.from(
      new Set(
        ARTICLE_SEEDS.flatMap((article) =>
          article.banner?.kind === "card"
            ? [article.banner.slug]
            : []
        )
      )
    );

    const [featuredCards, bannerSets, bannerCards] =
      await Promise.all([
        prisma.card.findMany({
          where: {
            name: {
              in: featuredNames,
            },
          },

          select: FEATURED_CARD_SELECT,
        }),

        prisma.setMeta.findMany({
          where: {
            slug: {
              in: bannerSetSlugs,
            },
          },

          select: {
            slug: true,
            name: true,
            bannerUrl: true,
          },
        }),

        prisma.card.findMany({
          where: {
            slug: {
              in: bannerCardSlugs,
            },
          },

          select: {
            slug: true,
            name: true,
            image: true,
            ygoproId: true,
          },
        }),
      ]);

    const featuredByName = new Map(
      featuredCards.map((card) => [card.name, card])
    );

    const setsBySlug = new Map(
      bannerSets.map((set) => [set.slug, set])
    );

    const cardsBySlug = new Map(
      bannerCards.map((card) => [card.slug, card])
    );

    const articles = ARTICLE_SEEDS.map((seed) => {
      const featured = seed.featuredCardNames
        .map((name) => featuredByName.get(name))
        .filter(
          (
            card
          ): card is (typeof featuredCards)[number] =>
            Boolean(card)
        )
        .map(mapPrismaCardPreview);

      let bannerUrl: string | null = null;

      let bannerAlt = seed.title;

      if (seed.banner?.kind === "set") {
        const set = setsBySlug.get(seed.banner.slug);

        bannerUrl = set?.bannerUrl ?? null;

        bannerAlt = set?.name ?? seed.title;
      }

      if (seed.banner?.kind === "card") {
        const card = cardsBySlug.get(seed.banner.slug);

        bannerUrl = getCardImageSrc(card);

        bannerAlt = card?.name ?? seed.title;
      }

      return {
        slug: seed.slug,

        title: seed.title,

        summary: seed.summary,

        category: seed.category,

        author: seed.author,

        publishedAt: seed.publishedAt,

        readingMinutes: estimateReadingMinutes(
          seed.sections
        ),

        tags: seed.tags,

        bannerUrl,

        bannerAlt,

        featuredCards: featured,

        sections: seed.sections,
      };
    });

    return articles.sort((a, b) =>
      b.publishedAt.localeCompare(a.publishedAt)
    );
  }
);

export async function getNewsArticle(
  slug: string
): Promise<NewsArticle | null> {
  const articles = await getNewsArticles();

  return (
    articles.find(
      (article) => article.slug === slug
    ) ?? null
  );
}

export async function getRelatedNews(
  article: NewsArticle,
  limit = 3
): Promise<NewsArticle[]> {
  const articles = await getNewsArticles();

  const sameCategory = articles.filter(
    (item) =>
      item.slug !== article.slug &&
      item.category === article.category
  );

  const others = articles.filter(
    (item) =>
      item.slug !== article.slug &&
      item.category !== article.category
  );

  return [...sameCategory, ...others].slice(0, limit);
}
