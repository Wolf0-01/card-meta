import type {
  NewsArticle,
  Prisma,
} from "@prisma/client";

import type { AuthUser } from "@/lib/auth/currentUser";

import {
  parseNewsContent,
  type NewsSection,
} from "@/lib/news";

import { prisma } from "@/lib/prisma";

import type {
  NewsEditorCard,
  NewsEditorData,
  NewsMutationResult,
} from "./editor";

import { NewsError } from "./errors";

import { slugifyNewsTitle } from "./slug";

import {
  parseNewsCreate,
  parseNewsUpdate,
  type NewsCreateInput,
} from "./validation";

const NEWS_EDITOR_CARD_SELECT = {
  name: true,

  slug: true,

  image: true,
} as const;

interface NormalizedSection {
  heading: string;

  paragraphs: string[];

  bullets: string[];

  featuredCardNames: string[];
}

function defaultAuthor(user: AuthUser) {
  return (
    user.displayName?.trim() ||
    user.username
  );
}

function normalizeSection(
  section: NewsCreateInput["sections"][number]
): NormalizedSection {
  return {
    heading: section.heading,

    paragraphs: section.paragraphs
      .map((paragraph) => paragraph.trim())
      .filter(Boolean),

    bullets: (section.bullets ?? [])
      .map((bullet) => bullet.trim())
      .filter(Boolean),

    featuredCardNames: [
      ...new Set(
        (section.featuredCardNames ?? [])
          .map((name) => name.trim())
          .filter(Boolean)
      ),
    ],
  };
}

function normalizeExistingSection(
  section: NewsSection
): NormalizedSection {
  return {
    heading: section.heading,

    paragraphs: section.paragraphs,

    bullets: section.bullets ?? [],

    featuredCardNames: [
      ...new Set(
        section.featuredCardNames ?? []
      ),
    ],
  };
}

function collectFeaturedCardNames(
  sections: NormalizedSection[],
  extra: string[] = []
) {
  const names = [...extra];

  for (const section of sections) {
    names.push(...section.featuredCardNames);
  }

  return [
    ...new Set(
      names
        .map((name) => name.trim())
        .filter(Boolean)
    ),
  ];
}

function buildNewsContent(
  sections: NormalizedSection[],
  tags: string[],
  featuredCardNames: string[]
): Prisma.InputJsonValue {
  return {
    tags,

    featuredCardNames,

    sections: sections.map((section) => ({
      heading: section.heading,

      paragraphs: section.paragraphs,

      ...(section.bullets.length > 0
        ? { bullets: section.bullets }
        : {}),
    })),
  } as Prisma.InputJsonValue;
}

async function ensureCardsExist(
  names: string[]
) {
  if (names.length === 0) {
    return;
  }

  const found = await prisma.card.findMany({
    where: {
      name: {
        in: names,
      },
    },

    select: {
      name: true,
    },
  });

  const foundNames = new Set(
    found.map((card) => card.name)
  );

  const missing = names.filter(
    (name) => !foundNames.has(name)
  );

  if (missing.length === 0) {
    return;
  }

  throw new NewsError(
    "VALIDATION",
    "One or more featured cards do not exist",
    missing.slice(0, 10).map((name) => ({
      path: "featuredCardNames",

      message: `The card "${name}" does not exist in the catalog`,
    }))
  );
}

async function uniqueNewsSlug(
  title: string,
  excludeId?: string
) {
  const root = slugifyNewsTitle(title);

  let candidate = root;

  let suffix = 2;

  for (;;) {
    const existing =
      await prisma.newsArticle.findFirst({
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

async function loadEditorCards(
  names: string[]
): Promise<Map<string, NewsEditorCard>> {
  const uniqueNames = [...new Set(names)];

  if (uniqueNames.length === 0) {
    return new Map();
  }

  const cards = await prisma.card.findMany({
    where: {
      name: {
        in: uniqueNames,
      },
    },

    select: NEWS_EDITOR_CARD_SELECT,
  });

  return new Map(
    cards.map((card) => [
      card.name,

      {
        name: card.name,

        slug: card.slug,

        image: card.image,
      },
    ])
  );
}

async function toEditorData(
  article: NewsArticle
): Promise<NewsEditorData> {
  const content = parseNewsContent(
    article.content
  );

  const assignedNames = new Set(
    content.sections.flatMap(
      (section) =>
        section.featuredCardNames ?? []
    )
  );

  const globalLeftovers =
    content.featuredCardNames.filter(
      (name) => !assignedNames.has(name)
    );

  const rawSections = content.sections.map(
    (section, index) => ({
      heading: section.heading,

      paragraphs: section.paragraphs,

      bullets: section.bullets ?? [],

      featuredCardNames: [
        ...(section.featuredCardNames ?? []),

        ...(index === 0
          ? globalLeftovers
          : []),
      ],
    })
  );

  const cardsByName = await loadEditorCards(
    rawSections.flatMap(
      (section) =>
        section.featuredCardNames
    )
  );

  return {
    id: article.id,

    slug: article.slug,

    title: article.title,

    summary: article.summary,

    category: article.category
      .toLowerCase() as NewsEditorData["category"],

    coverUrl: article.coverUrl,

    author: article.author,

    tags: content.tags,

    sections: rawSections.map((section) => ({
      heading: section.heading,

      paragraphs: section.paragraphs,

      bullets: section.bullets,

      cards: section.featuredCardNames
        .map((name) => cardsByName.get(name))
        .filter(
          (
            card
          ): card is NewsEditorCard =>
            Boolean(card)
        ),
    })),
  };
}

export async function getNewsForEditorBySlug(
  slug: string
): Promise<NewsEditorData | null> {
  const article =
    await prisma.newsArticle.findUnique({
      where: {
        slug,
      },
    });

  return article
    ? toEditorData(article)
    : null;
}

export async function getNewsForEditorById(
  id: string
): Promise<NewsEditorData | null> {
  const article =
    await prisma.newsArticle.findUnique({
      where: {
        id,
      },
    });

  return article
    ? toEditorData(article)
    : null;
}

export async function createNews(
  user: AuthUser,
  body: unknown
): Promise<NewsMutationResult> {
  const input = parseNewsCreate(body);

  const sections = input.sections.map(
    normalizeSection
  );

  const tags = input.tags ?? [];

  const featuredCardNames =
    collectFeaturedCardNames(
      sections,
      input.featuredCardNames
    );

  await ensureCardsExist(featuredCardNames);

  const slug = await uniqueNewsSlug(
    input.title
  );

  return prisma.newsArticle.create({
    data: {
      slug,

      title: input.title,

      summary: input.summary,

      category:
        input.category.toUpperCase() as
          | "UPDATES"
          | "EVENTS"
          | "BOXES"
          | "BANLIST",

      coverUrl: input.coverUrl,

      author:
        input.author || defaultAuthor(user),

      content: buildNewsContent(
        sections,
        tags,
        featuredCardNames
      ),
    },

    select: {
      id: true,

      slug: true,
    },
  });
}

export async function updateNews(
  articleId: string,
  body: unknown
): Promise<NewsMutationResult> {
  const patch = parseNewsUpdate(body);

  const existing =
    await prisma.newsArticle.findUnique({
      where: {
        id: articleId,
      },
    });

  if (!existing) {
    throw new NewsError(
      "NOT_FOUND",
      "The article does not exist"
    );
  }

  const existingContent = parseNewsContent(
    existing.content
  );

  const sections = patch.sections
    ? patch.sections.map(normalizeSection)
    : existingContent.sections.map(
        normalizeExistingSection
      );

  let featuredCardNames: string[];

  if (patch.sections) {
    featuredCardNames =
      collectFeaturedCardNames(
        sections,
        patch.featuredCardNames
      );
  } else if (patch.featuredCardNames) {
    featuredCardNames =
      collectFeaturedCardNames(
        sections,
        patch.featuredCardNames
      );
  } else {
    featuredCardNames =
      existingContent.featuredCardNames;
  }

  if (
    patch.sections ||
    patch.featuredCardNames
  ) {
    await ensureCardsExist(featuredCardNames);
  }

  const title = patch.title ?? existing.title;

  const slug =
    patch.title &&
    patch.title !== existing.title
      ? await uniqueNewsSlug(
          title,
          existing.id
        )
      : existing.slug;

  const tags =
    patch.tags ?? existingContent.tags;

  return prisma.newsArticle.update({
    where: {
      id: existing.id,
    },

    data: {
      slug,

      title,

      summary:
        patch.summary ?? existing.summary,

      category: patch.category
        ? (patch.category.toUpperCase() as
            | "UPDATES"
            | "EVENTS"
            | "BOXES"
            | "BANLIST")
        : existing.category,

      coverUrl:
        patch.coverUrl ?? existing.coverUrl,

      author: patch.author ?? existing.author,

      content: buildNewsContent(
        sections,
        tags,
        featuredCardNames
      ),
    },

    select: {
      id: true,

      slug: true,
    },
  });
}

export async function deleteNews(
  articleId: string
): Promise<NewsMutationResult> {
  const existing =
    await prisma.newsArticle.findUnique({
      where: {
        id: articleId,
      },

      select: {
        id: true,

        slug: true,
      },
    });

  if (!existing) {
    throw new NewsError(
      "NOT_FOUND",
      "The article does not exist"
    );
  }

  await prisma.newsArticle.delete({
    where: {
      id: articleId,
    },
  });

  return existing;
}
