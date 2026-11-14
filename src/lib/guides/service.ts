import type {
  Guide,
  Prisma,
} from "@prisma/client";

import type { AuthUser } from "@/lib/auth/currentUser";

import {
  parseGuideContent,
  type GuideSection,
} from "@/lib/guides";

import { prisma } from "@/lib/prisma";

import type {
  GuideEditorCard,
  GuideEditorData,
  GuideMutationResult,
} from "./editor";

import { GuideError } from "./errors";

import { slugifyGuideTitle } from "./slug";

import {
  parseGuideCreate,
  parseGuideUpdate,
  type GuideCreateInput,
} from "./validation";

const GUIDE_EDITOR_CARD_SELECT = {
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
  section: GuideCreateInput["sections"][number]
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
  section: GuideSection
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

function buildGuideContent(
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

      ...(section.featuredCardNames.length > 0
        ? {
            featuredCardNames:
              section.featuredCardNames,
          }
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

  throw new GuideError(
    "VALIDATION",
    "Una o más cartas destacadas no existen",
    missing.slice(0, 10).map((name) => ({
      path: "featuredCardNames",

      message: `La carta "${name}" no existe en el catálogo`,
    }))
  );
}

async function uniqueGuideSlug(
  title: string,
  excludeId?: string
) {
  const root = slugifyGuideTitle(title);

  let candidate = root;

  let suffix = 2;

  for (;;) {
    const existing =
      await prisma.guide.findFirst({
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
): Promise<Map<string, GuideEditorCard>> {
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

    select: GUIDE_EDITOR_CARD_SELECT,
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
  guide: Guide
): Promise<GuideEditorData> {
  const content = parseGuideContent(
    guide.content
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
    id: guide.id,

    slug: guide.slug,

    title: guide.title,

    summary: guide.summary,

    author: guide.author,

    featured: guide.featured,

    coverUrl: guide.coverUrl,

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
          ): card is GuideEditorCard =>
            Boolean(card)
        ),
    })),
  };
}

export async function getGuideForEditorBySlug(
  slug: string
): Promise<GuideEditorData | null> {
  const guide = await prisma.guide.findUnique({
    where: {
      slug,
    },
  });

  return guide ? toEditorData(guide) : null;
}

export async function getGuideForEditorById(
  id: string
): Promise<GuideEditorData | null> {
  const guide = await prisma.guide.findUnique({
    where: {
      id,
    },
  });

  return guide ? toEditorData(guide) : null;
}

export async function createGuide(
  user: AuthUser,
  body: unknown
): Promise<GuideMutationResult> {
  const input = parseGuideCreate(body);

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

  const slug = await uniqueGuideSlug(
    input.title
  );

  return prisma.guide.create({
    data: {
      slug,

      title: input.title,

      summary: input.summary,

      coverUrl: input.coverUrl,

      author:
        input.author || defaultAuthor(user),

      featured: input.featured ?? false,

      content: buildGuideContent(
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

export async function updateGuide(
  guideId: string,
  body: unknown
): Promise<GuideMutationResult> {
  const patch = parseGuideUpdate(body);

  const existing =
    await prisma.guide.findUnique({
      where: {
        id: guideId,
      },
    });

  if (!existing) {
    throw new GuideError(
      "NOT_FOUND",
      "La guía no existe"
    );
  }

  const existingContent = parseGuideContent(
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
      ? await uniqueGuideSlug(
          title,
          existing.id
        )
      : existing.slug;

  const tags =
    patch.tags ?? existingContent.tags;

  return prisma.guide.update({
    where: {
      id: existing.id,
    },

    data: {
      slug,

      title,

      summary:
        patch.summary ?? existing.summary,

      coverUrl:
        patch.coverUrl ?? existing.coverUrl,

      author: patch.author ?? existing.author,

      featured:
        patch.featured ?? existing.featured,

      content: buildGuideContent(
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

export async function deleteGuide(
  guideId: string
): Promise<GuideMutationResult> {
  const existing =
    await prisma.guide.findUnique({
      where: {
        id: guideId,
      },

      select: {
        id: true,

        slug: true,
      },
    });

  if (!existing) {
    throw new GuideError(
      "NOT_FOUND",
      "La guía no existe"
    );
  }

  await prisma.guide.delete({
    where: {
      id: guideId,
    },
  });

  return existing;
}
