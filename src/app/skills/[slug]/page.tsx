import type { Metadata } from "next";

import Image from "next/image";

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Layers,
  Sparkles,
  UserRound,
} from "lucide-react";

import RelatedCardTile from "@/components/cards/RelatedCardTile";

import PublicDeckCard from "@/components/decks/PublicDeckCard";

import Container from "@/components/ui/Container";

import {
  getPublicDecksBySkill,
} from "@/lib/decks";

import { getDuelFormatLabel } from "@/lib/duelFormat";

import {
  getMentionedCards,
} from "@/lib/skills/mentionedCards";

import {
  getSkillMetaBySlug,
} from "@/lib/skills/meta";

interface SkillPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: SkillPageProps): Promise<Metadata> {
  const { slug } = await params;

  const skill = await getSkillMetaBySlug(slug);

  if (!skill) {
    return {
      title: "Skill not found | Card Meta",
    };
  }

  const description =
    skill.description.trim().slice(0, 160) ||
    `${skill.name} Skill details, character and recent public decks.`;

  return {
    title: `${skill.name} | Skills | Card Meta`,

    description,
  };
}

export default async function SkillPage({
  params,
}: SkillPageProps) {
  const { slug } = await params;

  const skill = await getSkillMetaBySlug(slug);

  if (!skill) {
    notFound();
  }

  const [recentDecks, mentionedCards] =
    await Promise.all([
      getPublicDecksBySkill(
        skill.name,
        6
      ),

      getMentionedCards(skill.description),
    ]);

  const formatLabel =
    getDuelFormatLabel(skill.format);

  const characterLabel =
    skill.characters.length > 0
      ? skill.characters.join(", ")
      : skill.character ??
        "Generic / multiple characters";

  const decksHref = `/decks?skill=${encodeURIComponent(
    skill.name
  )}`;

  return (
    <main
      className="
        min-h-screen
        bg-[#070D1F]
        px-3
        py-5
        text-slate-100
        sm:px-6
        sm:py-7
      "
    >
      <Container
        size="md"
        className="space-y-4 px-0 sm:px-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/decks"
            className="
              inline-flex
              items-center
              gap-1
              text-[9px]
              font-black
              uppercase
              tracking-[0.18em]
              text-slate-500
              transition-colors
              hover:text-blue-300
            "
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Top Decks
          </Link>

          <Link
            href={decksHref}
            className="
              inline-flex
              h-8
              items-center
              gap-1.5
              rounded-lg
              border
              border-slate-700/70
              bg-[#0B132B]
              px-3
              text-[9px]
              font-black
              uppercase
              tracking-[0.14em]
              text-slate-300
              transition-colors
              hover:border-blue-400/60
              hover:text-white
            "
          >
            Browse decks
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <header
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-slate-700/60
            bg-[#0B132B]
            p-4
            ring-1
            ring-inset
            ring-white/5
            sm:p-6
          "
        >
          <span
            aria-hidden
            className="
              absolute
              inset-x-0
              top-0
              h-1
              bg-gradient-to-r
              from-sky-400
              via-cyan-400
              to-blue-500
            "
          />

          <div className="flex flex-wrap items-start gap-3">
            {skill.characterImages.length > 0 ? (
              <div className="flex shrink-0 -space-x-2">
                {skill.characterImages
                  .slice(0, 4)
                  .map((character) => (
                    <Image
                      key={character.slug}
                      src={character.src}
                      alt={character.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="
                        h-12
                        w-12
                        rounded-full
                        border-2
                        border-[#0B132B]
                        bg-slate-800
                        object-cover
                        shadow-lg
                        ring-2
                        ring-sky-400/30
                      "
                    />
                  ))}

                {skill.characterImages.length >
                  4 && (
                  <span
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-[#0B132B]
                      bg-slate-800
                      text-[10px]
                      font-black
                      text-slate-300
                      shadow-lg
                      ring-2
                      ring-sky-400/30
                    "
                  >
                    +
                    {skill.characterImages.length -
                      4}
                  </span>
                )}
              </div>
            ) : (
              <div
                aria-hidden
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gradient-to-br
                  from-sky-500
                  to-blue-800
                  text-base
                  font-black
                  text-white
                  shadow-lg
                  ring-2
                  ring-sky-400/30
                "
              >
                {characterLabel
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) =>
                    word[0]?.toUpperCase()
                  )
                  .join("") || "?"}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-sky-300/80
                "
              >
                Skill · {formatLabel}
              </p>

              <h1
                className="
                  mt-1
                  text-2xl
                  font-black
                  leading-tight
                  tracking-tight
                  text-white
                  sm:text-3xl
                "
              >
                {skill.name}
              </h1>

              <p
                className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  text-[11px]
                  font-semibold
                  text-slate-400
                "
              >
                <UserRound className="h-3 w-3 shrink-0 text-sky-300" />

                {characterLabel}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <section
            className="
              rounded-xl
              border
              border-slate-700/60
              bg-[#0B132B]
              p-3
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-sky-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-slate-200
                "
              >
                Character
              </h2>
            </div>

            <p className="mt-2 text-sm font-bold text-white">
              {characterLabel}
            </p>

            {skill.characterImages.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {skill.characterImages.map(
                  (character) => (
                    <li
                      key={character.slug}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-slate-700/60
                        bg-slate-900/50
                        py-1
                        pl-1
                        pr-2.5
                      "
                    >
                      <Image
                        src={character.src}
                        alt={character.name}
                        width={36}
                        height={36}
                        unoptimized
                        className="
                          h-9
                          w-9
                          rounded-full
                          bg-slate-800
                          object-cover
                          ring-1
                          ring-sky-400/30
                        "
                      />

                      <span
                        className="
                          text-[11px]
                          font-semibold
                          text-slate-300
                        "
                      >
                        {character.name}
                      </span>
                    </li>
                  )
                )}
              </ul>
            )}

            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              Character or characters that can
              unlock this Skill in Duel Links.
            </p>
          </section>

          <section
            className="
              rounded-xl
              border
              border-slate-700/60
              bg-[#0B132B]
              p-3
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.18em]
                  text-slate-200
                "
              >
                Source of obtaining
              </h2>
            </div>

            <p className="mt-2 text-sm font-bold text-white">
              {formatLabel}
            </p>

            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              {skill.source}. Check the character
              progression, events and lifetime
              missions available in-game.
            </p>
          </section>
        </div>

        <section
          className="
            overflow-hidden
            rounded-xl
            border
            border-slate-700/60
            bg-[#0B132B]
            ring-1
            ring-inset
            ring-white/5
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              border-b
              border-slate-800
              px-3
              py-2.5
            "
          >
            <BookOpen className="h-4 w-4 text-emerald-300" />

            <h2
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.2em]
                text-slate-200
              "
            >
              Full effect
            </h2>
          </div>

          <div
            className="
              whitespace-pre-line
              px-3
              py-3
              text-[12.5px]
              leading-7
              text-slate-300
            "
          >
            {skill.description.trim() ||
              "No effect description available for this Skill yet."}
          </div>
        </section>

        {mentionedCards.length > 0 && (
          <section
            className="
              overflow-hidden
              rounded-xl
              border
              border-slate-700/60
              bg-[#0B132B]
              ring-1
              ring-inset
              ring-white/5
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                border-b
                border-slate-800
                px-3
                py-2.5
              "
            >
              <Sparkles className="h-4 w-4 text-amber-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-200
                "
              >
                Mentioned cards
              </h2>

              <span
                className="
                  ml-auto
                  text-[9px]
                  font-black
                  tabular-nums
                  text-slate-500
                "
              >
                {mentionedCards.length}{" "}
                {mentionedCards.length === 1
                  ? "card"
                  : "cards"}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 p-3">
              {mentionedCards.map((card) => (
                <div
                  key={card.id}
                  className="w-[84px] shrink-0 sm:w-[96px]"
                >
                  <RelatedCardTile card={card} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <div
            className="
              flex
              items-center
              gap-2
              border-b
              border-slate-800
              pb-2
            "
          >
            <Layers className="h-4 w-4 text-blue-300" />

            <h2
              className="
                text-[10px]
                font-black
                uppercase
                tracking-[0.2em]
                text-slate-200
              "
            >
              Recent public decks
            </h2>

            <span
              className="
                ml-auto
                text-[9px]
                font-black
                tabular-nums
                text-slate-500
              "
            >
              {recentDecks.length}{" "}
              {recentDecks.length === 1
                ? "deck"
                : "decks"}
            </span>
          </div>

          {recentDecks.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {recentDecks.map((deck) => (
                <PublicDeckCard
                  key={deck.id}
                  deck={deck}
                />
              ))}
            </div>
          ) : (
            <p
              className="
                rounded-xl
                border
                border-dashed
                border-slate-700/70
                bg-[#0B132B]/60
                px-3
                py-5
                text-center
                text-xs
                text-slate-500
              "
            >
              No public decks have used this
              Skill yet.
            </p>
          )}
        </section>
      </Container>
    </main>
  );
}
