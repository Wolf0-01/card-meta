import { cache } from "react";

import type {
  NewsArticle as PrismaNewsArticle,
  Prisma,
} from "@prisma/client";

import { mapPrismaCardPreview } from "@/lib/mappers/cardMapper";

import type { NewsCategoryKey } from "@/lib/newsCategories";

import { newsCategoryKeyFromEnum } from "@/lib/newsCategories";

import { prisma } from "@/lib/prisma";

import type { CardPreviewData } from "@/types/CardPreviewData";

export {
  getNewsCategory,
  NEWS_CATEGORIES,
  newsCategoryKeyFromEnum,
  type NewsCategoryDefinition,
  type NewsCategoryKey,
} from "@/lib/newsCategories";

export interface NewsSection {
  heading: string;

  paragraphs: string[];

  bullets?: string[];

  featuredCardNames?: string[];
}

export interface NewsArticle {
  id: string;

  slug: string;

  title: string;

  summary: string;

  category: NewsCategoryKey;

  author: string;

  publishedAt: string;

  readingMinutes: number;

  tags: string[];

  coverUrl: string;

  bannerUrl: string | null;

  bannerAlt: string;

  featuredCards: CardPreviewData[];

  sections: NewsSection[];
}

interface NewsContent {
  tags: string[];

  featuredCardNames: string[];

  sections: NewsSection[];
}

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

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0
  );
}

function parseSection(
  value: unknown
): NewsSection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<
    string,
    unknown
  >;

  const heading =
    typeof record.heading === "string"
      ? record.heading.trim()
      : "";

  const paragraphs = asStringArray(
    record.paragraphs
  );

  if (!heading || paragraphs.length === 0) {
    return null;
  }

  const bullets = asStringArray(record.bullets);

  const featuredCardNames = asStringArray(
    record.featuredCardNames
  );

  return {
    heading,

    paragraphs,

    ...(bullets.length > 0
      ? { bullets }
      : {}),

    ...(featuredCardNames.length > 0
      ? { featuredCardNames }
      : {}),
  };
}

/**
 * El contenido editorial vive en PostgreSQL como JSON.
 * Aquí se valida antes de pasarlo a la interfaz.
 */
export function parseNewsContent(
  value: Prisma.JsonValue
): NewsContent {
  const record =
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const sections = Array.isArray(
    record.sections
  )
    ? record.sections
        .map(parseSection)
        .filter(
          (
            section
          ): section is NewsSection =>
            section !== null
        )
    : [];

  return {
    sections,

    tags: asStringArray(record.tags),

    featuredCardNames: asStringArray(
      record.featuredCardNames
    ),
  };
}

function estimateReadingMinutes(
  sections: NewsSection[]
): number {
  const words = sections.reduce(
    (total, section) => {
      const paragraphWords =
        section.paragraphs.reduce(
          (sum, paragraph) =>
            sum +
            paragraph.trim().split(/\s+/).length,
          0
        );

      const bulletWords = (
        section.bullets ?? []
      ).reduce(
        (sum, bullet) =>
          sum +
          bullet.trim().split(/\s+/).length,
        0
      );

      return total + paragraphWords + bulletWords;
    },
    0
  );

  return Math.max(3, Math.ceil(words / 180));
}

function toNewsArticle(
  article: PrismaNewsArticle,
  featuredCards: CardPreviewData[]
): NewsArticle {
  const content = parseNewsContent(
    article.content
  );

  return {
    id: article.id,

    slug: article.slug,

    title: article.title,

    summary: article.summary,

    category: newsCategoryKeyFromEnum(
      article.category
    ),

    author: article.author,

    publishedAt: article.createdAt.toISOString(),

    readingMinutes: estimateReadingMinutes(
      content.sections
    ),

    tags: content.tags,

    coverUrl: article.coverUrl,

    bannerUrl: article.coverUrl,

    bannerAlt: article.title,

    featuredCards,

    sections: content.sections,
  };
}

/**
 * Resuelve las cartas destacadas contra PostgreSQL y
 * mantiene el orden editorial definido en el contenido.
 */
export const getNewsArticles = cache(
  async (): Promise<NewsArticle[]> => {
    const articles =
      await prisma.newsArticle.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    const featuredNames = Array.from(
      new Set(
        articles.flatMap((article) =>
          parseNewsContent(article.content)
            .featuredCardNames
        )
      )
    );

    const featuredCards =
      featuredNames.length > 0
        ? await prisma.card.findMany({
            where: {
              name: {
                in: featuredNames,
              },
            },

            select: FEATURED_CARD_SELECT,
          })
        : [];

    const cardsByName = new Map(
      featuredCards.map((card) => [
        card.name,
        card,
      ])
    );

    return articles.map((article) => {
      const content = parseNewsContent(
        article.content
      );

      const cards = content.featuredCardNames
        .map((name) => cardsByName.get(name))
        .filter(
          (
            card
          ): card is (typeof featuredCards)[number] =>
            Boolean(card)
        )
        .map(mapPrismaCardPreview);

      return toNewsArticle(article, cards);
    });
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
