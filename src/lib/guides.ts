import { cache } from "react";

import type { Guide, Prisma } from "@prisma/client";

import { mapPrismaCardPreview } from "@/lib/mappers/cardMapper";

import { prisma } from "@/lib/prisma";

import type { CardPreviewData } from "@/types/CardPreviewData";

export interface GuideSection {
  heading: string;

  paragraphs: string[];

  bullets?: string[];

  /**
   * Cartas destacadas dentro de esta sección concreta.
   * El editor visual las guarda aquí para poder mostrarlas
   * junto al bloque al que pertenecen.
   */
  featuredCardNames?: string[];
}

export interface GuideSectionDetail extends GuideSection {
  featuredCards: CardPreviewData[];
}

export interface GuideContent {
  sections: GuideSection[];

  tags: string[];

  featuredCardNames: string[];
}

export interface GuideListItem {
  id: string;

  slug: string;

  title: string;

  summary: string;

  coverUrl: string;

  author: string;

  featured: boolean;

  createdAt: string;

  readingMinutes: number;

  tags: string[];
}

export interface GuideDetail extends GuideListItem {
  sections: GuideSectionDetail[];

  featuredCards: CardPreviewData[];
}

const GUIDE_CARD_SELECT = {
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

  banlistStatus: true,

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
): GuideSection | null {
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
 * El contenido vive en PostgreSQL como JSON para poder
 * editarlo desde Prisma Studio. Aquí se valida antes de
 * pasarlo a la interfaz.
 */
export function parseGuideContent(
  value: Prisma.JsonValue
): GuideContent {
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
          ): section is GuideSection =>
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
  sections: GuideSection[]
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

  return Math.max(2, Math.ceil(words / 180));
}

function toListItem(
  guide: Guide
): GuideListItem {
  const content = parseGuideContent(
    guide.content
  );

  return {
    id: guide.id,

    slug: guide.slug,

    title: guide.title,

    summary: guide.summary,

    coverUrl: guide.coverUrl,

    author: guide.author,

    featured: guide.featured,

    createdAt: guide.createdAt.toISOString(),

    readingMinutes: estimateReadingMinutes(
      content.sections
    ),

    tags: content.tags,
  };
}

export const getGuides = cache(
  async (): Promise<GuideListItem[]> => {
    const guides = await prisma.guide.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return guides.map(toListItem);
  }
);

export const getFeaturedGuides = cache(
  async (): Promise<GuideListItem[]> => {
    const guides = await getGuides();

    return guides.filter(
      (guide) => guide.featured
    );
  }
);

export const getGuide = cache(
  async (
    slug: string
  ): Promise<GuideDetail | null> => {
    const guide = await prisma.guide.findUnique({
      where: {
        slug,
      },
    });

    if (!guide) {
      return null;
    }

    const content = parseGuideContent(
      guide.content
    );

    const sectionCardNames =
      content.sections.flatMap(
        (section) =>
          section.featuredCardNames ?? []
      );

    const allCardNames = [
      ...new Set([
        ...content.featuredCardNames,
        ...sectionCardNames,
      ]),
    ];

    const cards =
      allCardNames.length > 0
        ? await prisma.card.findMany({
            where: {
              name: {
                in: allCardNames,
              },
            },

            select: GUIDE_CARD_SELECT,
          })
        : [];

    const cardsByName = new Map(
      cards.map((card) => [card.name, card])
    );

    function resolveCard(
      name: string
    ): CardPreviewData | null {
      const card = cardsByName.get(name);

      return card
        ? mapPrismaCardPreview(card)
        : null;
    }

    const featuredCards =
      content.featuredCardNames
        .map(resolveCard)
        .filter(
          (
            card
          ): card is CardPreviewData =>
            card !== null
        );

    const sections: GuideSectionDetail[] =
      content.sections.map((section) => ({
        ...section,

        featuredCards: (
          section.featuredCardNames ?? []
        )
          .map(resolveCard)
          .filter(
            (
              card
            ): card is CardPreviewData =>
              card !== null
          ),
      }));

    return {
      ...toListItem(guide),

      sections,

      featuredCards,
    };
  }
);

export async function getRelatedGuides(
  slug: string,
  limit = 3
): Promise<GuideListItem[]> {
  const guides = await getGuides();

  return guides
    .filter((guide) => guide.slug !== slug)
    .slice(0, limit);
}
