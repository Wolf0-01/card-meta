import type { Metadata } from "next";

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock3,
  Sparkles,
  Tag,
  UserRound,
} from "lucide-react";

import CatalogCardTile from "@/components/cards/CatalogCardTile";

import MultilineText from "@/components/cards/MultilineText";

import SectionCardStrip from "@/components/cards/SectionCardStrip";

import GuideActions from "@/components/guides/GuideActions";

import GuidePanoramaCard from "@/components/guides/GuidePanoramaCard";

import { getCurrentUser } from "@/lib/auth/currentUser";

import { canManageGuides } from "@/lib/auth/roles";

import { formatDate } from "@/lib/format";

import {
  getGuide,
  getRelatedGuides,
} from "@/lib/guides";

interface GuidePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;

  const guide = await getGuide(slug);

  if (!guide) {
    return {
      title: "Guide not found | Card Meta",
    };
  }

  return {
    title: `${guide.title} | Card Meta`,

    description: guide.summary,
  };
}

export default async function GuidePage({
  params,
}: GuidePageProps) {
  const { slug } = await params;

  const guide = await getGuide(slug);

  if (!guide) {
    notFound();
  }

  const [related, user] = await Promise.all([
    getRelatedGuides(guide.slug),

    getCurrentUser(),
  ]);

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
      <div
        className="
          mx-auto
          w-full
          max-w-6xl
          space-y-4
        "
      >
        <div className="flex items-start justify-between gap-2">
          <Link
            href="/guides"
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
            Back to Guides
          </Link>

          {canManageGuides(user) && (
            <GuideActions
              guideId={guide.id}
              slug={guide.slug}
            />
          )}
        </div>

        <header
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-slate-700/60
            bg-[#0B132B]
            ring-1
            ring-inset
            ring-white/5
          "
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={guide.coverUrl}
            alt={guide.title}
            referrerPolicy="no-referrer"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-center
              opacity-80
            "
          />

          <span
            aria-hidden
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-[#070D1F]
              via-[#070D1F]/75
              to-[#070D1F]/20
            "
          />

          <div
            className="
              relative
              flex
              min-h-[260px]
              flex-col
              justify-end
              gap-2.5
              p-4
              sm:min-h-[320px]
              sm:p-6
            "
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-sky-400/30
                  bg-sky-400/10
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-sky-200
                  backdrop-blur-sm
                "
              >
                <BookOpen className="h-2.5 w-2.5" />
                Guide
              </span>

              {guide.featured && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1
                    rounded
                    border
                    border-amber-400/30
                    bg-amber-400/10
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.12em]
                    text-amber-200
                    backdrop-blur-sm
                  "
                >
                  <Sparkles className="h-2.5 w-2.5" />
                  Popular
                </span>
              )}

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-white/10
                  bg-slate-950/60
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-bold
                  text-slate-200
                  backdrop-blur-sm
                "
              >
                <CalendarDays className="h-2.5 w-2.5" />
                {formatDate(guide.createdAt)}
              </span>

              <span
                className="
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  border-white/10
                  bg-slate-950/60
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-bold
                  text-slate-200
                  backdrop-blur-sm
                "
              >
                <Clock3 className="h-2.5 w-2.5" />
                {guide.readingMinutes} min read
              </span>
            </div>

            <h1
              className="
                max-w-3xl
                text-2xl
                font-black
                leading-tight
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              {guide.title}
            </h1>

            <p
              className="
                max-w-2xl
                text-[11px]
                leading-relaxed
                text-slate-300
                sm:text-xs
              "
            >
              {guide.summary}
            </p>

            <p
              className="
                flex
                items-center
                gap-1.5
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-slate-400
              "
            >
              <UserRound className="h-3 w-3 text-blue-300" />

              Published {formatDate(guide.createdAt)}{" "}
              by {guide.author}
            </p>
          </div>
        </header>

        <div
          className="
            grid
            gap-4
            lg:grid-cols-[minmax(0,1fr)_280px]
          "
        >
          <article className="space-y-3">
            {guide.sections.map(
              (section, index) => (
                <section
                  key={section.heading}
                  className="
                    rounded-xl
                    border
                    border-slate-700/60
                    bg-[#0B132B]
                    p-4
                    ring-1
                    ring-inset
                    ring-white/5
                  "
                >
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="
                        flex
                        h-5
                        w-5
                        shrink-0
                        items-center
                        justify-center
                        rounded
                        border
                        border-sky-500/30
                        bg-sky-500/10
                        text-[8px]
                        font-black
                        tabular-nums
                        text-sky-200
                      "
                    >
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <h2
                      className="
                        text-[11px]
                        font-black
                        uppercase
                        tracking-[0.16em]
                        text-white
                      "
                    >
                      {section.heading}
                    </h2>
                  </div>

                  <div className="mt-2.5 space-y-2.5">
                    {section.paragraphs.map(
                      (paragraph) => (
                        <p
                          key={paragraph}
                          className="
                            whitespace-pre-line
                            text-[12.5px]
                            leading-7
                            text-slate-300
                          "
                        >
                          <MultilineText
                            text={paragraph}
                          />
                        </p>
                      )
                    )}

                    {section.bullets &&
                      section.bullets.length > 0 && (
                        <ul className="space-y-1.5 pt-0.5">
                          {section.bullets.map(
                            (bullet) => (
                              <li
                                key={bullet}
                                className="
                                  flex
                                  items-start
                                  gap-2
                                  whitespace-pre-line
                                  text-[12px]
                                  leading-6
                                  text-slate-400
                                "
                              >
                                <span
                                  aria-hidden
                                  className="
                                    mt-2
                                    h-1.5
                                    w-1.5
                                    shrink-0
                                    rotate-45
                                    border
                                    border-sky-300/80
                                    bg-sky-400/30
                                  "
                                />

                                <MultilineText
                                  text={bullet}
                                />
                              </li>
                            )
                          )}
                        </ul>
                      )}

                    <SectionCardStrip
                      cards={section.featuredCards}
                    />
                  </div>
                </section>
              )
            )}

            {guide.tags.length > 0 && (
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-1.5
                  border-t
                  border-slate-800
                  pt-3
                "
              >
                <Tag className="h-3.5 w-3.5 text-slate-500" />

                {guide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="
                      rounded
                      border
                      border-slate-700/70
                      bg-[#0B132B]
                      px-1.5
                      py-0.5
                      text-[8px]
                      font-black
                      uppercase
                      tracking-[0.1em]
                      text-slate-400
                    "
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div
              className="
                flex
                flex-wrap
                items-center
                justify-between
                gap-2
                rounded-xl
                border
                border-slate-700/60
                bg-[#0B132B]
                p-3
              "
            >
              <p
                className="
                  text-[10px]
                  leading-relaxed
                  text-slate-400
                "
              >
                Explore the full catalog of cards cited
                in this guide and build your next list.
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href="/cards"
                  className="
                    inline-flex
                    h-8
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-blue-500/40
                    bg-blue-500/10
                    px-3
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-blue-200
                    transition-colors
                    hover:border-blue-400
                    hover:bg-blue-500/20
                    hover:text-white
                  "
                >
                  <BookOpen className="h-3 w-3" />
                  Card Catalog
                </Link>

                <Link
                  href="/guides"
                  className="
                    inline-flex
                    h-8
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-slate-700/70
                    bg-[#070D1F]
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
                  <ArrowLeft className="h-3 w-3" />
                  All Guides
                </Link>
              </div>
            </div>
          </article>

          <aside
            className="
              space-y-3
              lg:sticky
              lg:top-20
              lg:self-start
            "
          >
            <section
              aria-label="Featured cards from the guide"
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
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />

                <h2
                  className="
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-slate-200
                  "
                >
                  Featured cards
                </h2>

                <span
                  className="
                    ml-auto
                    text-[8px]
                    font-black
                    tabular-nums
                    text-slate-500
                  "
                >
                  {guide.featuredCards.length}
                </span>
              </div>

              {guide.featuredCards.length > 0 ? (
                <div
                  className="
                    mt-2.5
                    grid
                    grid-cols-2
                    gap-2
                  "
                >
                  {guide.featuredCards.map(
                    (card) => (
                      <div key={card.id}>
                        <CatalogCardTile
                          card={card}
                          prefetch={false}
                        />

                        <p
                          className="
                            mt-1
                            truncate
                            text-[9px]
                            font-bold
                            text-slate-400
                          "
                          title={card.name}
                        >
                          {card.name}
                        </p>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-relaxed
                    text-slate-500
                  "
                >
                  This guide has no featured cards
                  associated with it.
                </p>
              )}

              <p
                className="
                  mt-2.5
                  border-t
                  border-slate-700/50
                  pt-2
                  text-[9px]
                  leading-relaxed
                  text-slate-500
                "
              >
                Hover over a card to see its full
                information and open its detail page.
              </p>
            </section>

          </aside>
        </div>

        {related.length > 0 && (
          <section className="space-y-2">
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
              <BookOpen className="h-3.5 w-3.5 text-blue-300" />

              <h2
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-slate-300
                "
              >
                More guides
              </h2>
            </div>

            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {related.map((item) => (
                <GuidePanoramaCard
                  key={item.slug}
                  guide={item}
                  aspectClassName="aspect-[16/10]"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
