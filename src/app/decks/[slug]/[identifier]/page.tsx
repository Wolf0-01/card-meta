import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import Container from "@/components/ui/Container";
import DeckViewer from "@/components/decks/DeckViewer";
import CommentsSection from "@/components/comments/CommentsSection";

import { getCurrentUser } from "@/lib/auth/currentUser";
import { canManageGuides } from "@/lib/auth/roles";
import { getDeckArchetypeSlug } from "@/lib/decks/archetypeLabel";
import { calculateDeckGemEstimate } from "@/lib/decks/gemCalculator";
import { getSkillMetaByName } from "@/lib/skills/meta";
import { findDeckByIdentifier } from "@/services/decks";

interface Props {
  params: Promise<{
    slug: string;
    identifier: string;
  }>;
}

function formatAchievementLabel(
  achievement?: string | null,
  placement?: string | null
): string | null {
  if (achievement === "KOG") return "King of Games";
  if (achievement === "KC_MAX") {
    return placement ? `KC Cup (${placement})` : "KC Cup";
  }
  if (achievement === "TOURNAMENT") {
    return placement ? `Tournament (${placement})` : "Tournament Top";
  }
  return null;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug, identifier } = await params;

  const deck = await findDeckByIdentifier(identifier, null);

  if (!deck) {
    return {
      title: "Deck not found | Card Meta",
    };
  }

  const gemEstimate = await calculateDeckGemEstimate(deck);

  const player =
    deck.playerName?.trim() ||
    deck.author?.displayName?.trim() ||
    deck.author?.username ||
    "Duelist";

  const archetypeTitle = deck.archetype?.name?.trim() || deck.name;

  const title = `${archetypeTitle} Deck from ${player} | Card Meta`;

  const submittedDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(deck.createdAt));

  const parts: string[] = [`Submitted ${submittedDate}`];

  if (deck.skill?.trim()) {
    parts.push(`Skill: ${deck.skill.trim()}`);
  }

  const achievementText = formatAchievementLabel(
    deck.achievement,
    deck.placement
  );
  if (achievementText) {
    parts.push(achievementText);
  }

  if (gemEstimate.maxGems > 0) {
    parts.push(`Price: ${gemEstimate.maxGems.toLocaleString("en-US")} gems`);
  }

  const description = parts.join(" • ");
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "https://vercel.app";

  const imageUrl = `${baseUrl}/decks/${slug}/${identifier}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      siteName: "Card Meta",
      title,
      description,
      type: "article",
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DeckPage({ params }: Props) {
  const { slug, identifier } = await params;

  const user = await getCurrentUser();

  const deck = await findDeckByIdentifier(identifier, user?.id ?? null);

  if (!deck || deck.slug !== slug) {
    notFound();
  }

  const createdAtDate = new Date(deck.createdAt);

  const sameArchetypeFilter = deck.archetype?.id
    ? { archetypeId: deck.archetype.id }
    : { slug: deck.slug };

  const [tournaments, prevDeck, nextDeck, gemEstimate, skillMeta] =
    await Promise.all([
      prisma.tournament.findMany({
        select: {
          slug: true,
          name: true,
          standings: true,
        },
        orderBy: { date: "desc" },
        take: 30,
      }),
      prisma.deck.findFirst({
        where: {
          isPublic: true,
          format: deck.format,
          ...sameArchetypeFilter,
          id: { not: deck.id },
          OR: [
            { createdAt: { gt: createdAtDate } },
            { createdAt: createdAtDate, id: { gt: deck.id } },
          ],
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { slug: true, identifier: true },
      }),
      prisma.deck.findFirst({
        where: {
          isPublic: true,
          format: deck.format,
          ...sameArchetypeFilter,
          id: { not: deck.id },
          OR: [
            { createdAt: { lt: createdAtDate } },
            { createdAt: createdAtDate, id: { lt: deck.id } },
          ],
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: { slug: true, identifier: true },
      }),
      calculateDeckGemEstimate(deck),
      deck.skill?.trim()
        ? getSkillMetaByName(deck.skill)
        : Promise.resolve(null),
    ]);

  let tournamentInfo: {
    name: string;
    slug: string;
    placement?: string | null;
  } | null = null;

  for (const t of tournaments) {
    if (!Array.isArray(t.standings)) continue;
    const match = (t.standings as Array<Record<string, unknown>>).find(
      (entry) => entry.deckId === deck.id
    );
    if (match) {
      tournamentInfo = {
        name: t.name,
        slug: t.slug,
        placement:
          typeof match.placement === "string"
            ? match.placement
            : typeof match.rank === "string" || typeof match.rank === "number"
            ? String(match.rank)
            : null,
      };
      break;
    }
  }

  const archetypeSlug = getDeckArchetypeSlug(deck);

  const breakdownParams = new URLSearchParams();

  if (deck.format === "rush") {
    breakdownParams.set("format", "rush");
  }

  const breakdownQuery = breakdownParams.toString();

  const breakdownHref = `/decks/breakdown/${archetypeSlug}${
    breakdownQuery ? `?${breakdownQuery}` : ""
  }`;

  const prevDeckHref = prevDeck
    ? `/decks/${prevDeck.slug}/${prevDeck.identifier}`
    : null;
  const nextDeckHref = nextDeck
    ? `/decks/${nextDeck.slug}/${nextDeck.identifier}`
    : null;

  return (
    <main className="min-h-screen py-8">
      <Container>
        <DeckViewer
          deck={deck}
          gemEstimate={gemEstimate}
          skillMeta={skillMeta}
          breakdownHref={breakdownHref}
          tournamentInfo={tournamentInfo}
          prevDeckHref={prevDeckHref}
          nextDeckHref={nextDeckHref}
          canViewPlayerProfile={canManageGuides(user)}
          isOwner={Boolean(user) && user?.id === deck.authorId}
        />

        <CommentsSection
          type="deck"
          targetId={deck.id}
          currentUser={
            user
              ? { id: user.id, username: user.username, role: user.role }
              : null
          }
        />
      </Container>
    </main>
  );
}
