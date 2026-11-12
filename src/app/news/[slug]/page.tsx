import type { Metadata } from "next";

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Sparkles,
  Tag,
  UserRound,
} from "lucide-react";

import CatalogCardTile from "@/components/cards/CatalogCardTile";

import { formatDate } from "@/lib/format";

import {
  getNewsArticle,
  getRelatedNews,
} from "@/lib/news";

import { getNewsCategory } from "@/lib/newsCategories";

interface NewsArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const article = await getNewsArticle(slug);

  if (!article) {
    return {
      title: "Artículo no encontrado | Card Meta",
    };
  }

  return {
    title: `${article.title} | Card Meta`,

    description: article.summary,
  };
}

export default async function NewsArticlePage({
  params,
}: NewsArticlePageProps) {
  const { slug } = await params;

  const article = await getNewsArticle(slug);

  if (!article) {
    notFound();
  }

  const category = getNewsCategory(article.category);

  const related = await getRelatedNews(article);

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
        <Link
          href="/news"
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
          Volver a Noticias
        </Link>

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
          {article.bannerUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.bannerUrl}
                alt={article.bannerAlt}
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
            </>
          ) : (
            <span
              aria-hidden
              className={`
                absolute
                inset-0
                bg-gradient-to-br
                ${category.glowClass}
              `}
            />
          )}

          <div
            className="
              relative
              flex
              min-h-[250px]
              flex-col
              justify-end
              gap-2.5
              p-4
              sm:min-h-[300px]
              sm:p-6
            "
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`
                  inline-flex
                  items-center
                  gap-1
                  rounded
                  border
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  backdrop-blur-sm
                  ${category.badgeClass}
                `}
              >
                <span
                  aria-hidden
                  className={`h-1 w-1 rounded-full ${category.dotClass}`}
                />

                {category.label}
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
                <CalendarDays className="h-2.5 w-2.5" />

                {formatDate(article.publishedAt)}
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

                {article.readingMinutes} min de
                lectura
              </span>
            </div>

            <h1
              className="
                max-w-3xl
                text-2xl
                font-black
                uppercase
                leading-tight
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              {article.title}
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
              {article.summary}
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

              {article.author}
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
            {article.sections.map(
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
                        border-blue-500/30
                        bg-blue-500/10
                        text-[8px]
                        font-black
                        tabular-nums
                        text-blue-200
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
                            text-[12.5px]
                            leading-7
                            text-slate-300
                          "
                        >
                          {paragraph}
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
                                    border-blue-300/80
                                    bg-blue-400/30
                                  "
                                />

                                {bullet}
                              </li>
                            )
                          )}
                        </ul>
                      )}
                  </div>
                </section>
              )
            )}

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

              {article.tags.map((tag) => (
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
                Explora el catálogo completo de
                cartas citadas y arma tu próxima
                lista.
              </p>

              <Link
                href="/news"
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
                <ArrowLeft className="h-3 w-3" />
                Todos los artículos
              </Link>
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
              aria-label="Cartas destacadas del artículo"
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
                  Cartas destacadas
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
                  {article.featuredCards.length}
                </span>
              </div>

              {article.featuredCards.length > 0 ? (
                <div
                  className="
                    mt-2.5
                    grid
                    grid-cols-2
                    gap-2
                  "
                >
                  {article.featuredCards.map(
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
                  Este artículo no tiene cartas
                  destacadas asociadas.
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
                Pasa el cursor sobre una carta para
                ver su información completa.
              </p>
            </section>

            <Link
              href="/cards"
              className="
                group
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-700/60
                bg-[#0B132B]
                p-3
                transition-colors
                hover:border-blue-400/60
                hover:bg-[#101A36]
              "
            >
              <span
                aria-hidden
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  border-blue-500/30
                  bg-blue-500/10
                  text-blue-300
                "
              >
                <BookOpen className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className="
                    block
                    text-[10px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    text-slate-200
                  "
                >
                  Card Catalog
                </span>

                <span
                  className="
                    block
                    text-[9px]
                    text-slate-500
                  "
                >
                  Busca cualquier carta
                </span>
              </span>

              <ArrowRight
                className="
                  h-3.5
                  w-3.5
                  shrink-0
                  text-slate-500
                  transition-transform
                  group-hover:translate-x-0.5
                  group-hover:text-blue-300
                "
              />
            </Link>
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
                Seguir leyendo
              </h2>
            </div>

            <div
              className="
                grid
                gap-2
                sm:grid-cols-3
              "
            >
              {related.map((item) => {
                const itemCategory =
                  getNewsCategory(item.category);

                return (
                  <Link
                    key={item.slug}
                    href={`/news/${item.slug}`}
                    className="
                      group
                      flex
                      flex-col
                      gap-1.5
                      rounded-xl
                      border
                      border-slate-700/60
                      bg-[#0B132B]
                      p-3
                      transition-colors
                      hover:border-blue-400/60
                      hover:bg-[#101A36]
                    "
                  >
                    <span
                      className={`
                        inline-flex
                        w-fit
                        items-center
                        gap-1
                        rounded
                        border
                        px-1.5
                        py-0.5
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.12em]
                        ${itemCategory.badgeClass}
                      `}
                    >
                      {itemCategory.label}
                    </span>

                    <h3
                      className="
                        line-clamp-2
                        text-xs
                        font-black
                        leading-snug
                        text-white
                        transition-colors
                        group-hover:text-blue-100
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        line-clamp-2
                        text-[10px]
                        leading-relaxed
                        text-slate-500
                      "
                    >
                      {item.summary}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
