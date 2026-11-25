import type { Metadata } from "next";

import Image from "next/image";

import Link from "next/link";

import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Sparkles,
} from "lucide-react";

import RelatedCardTile from "@/components/cards/RelatedCardTile";

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

function slugifyArchetype(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    skill.name + " Skill details, character and deck breakdown.";

  return {
    title: skill.name + " | Skills | Card Meta",

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
        24
      ),

      getMentionedCards(skill.description),
    ]);

  const formatLabel =
    getDuelFormatLabel(skill.format);

  const decksHref =
    "/decks?skill=" + encodeURIComponent(skill.name);

  const archetypeMap = new Map<
    string,
    { name: string; slug: string; count: number }
  >();

  for (const deck of recentDecks) {
    const rawName = deck.archetype?.name?.trim();

    if (!rawName) {
      continue;
    }

    const archSlug =
      deck.archetype?.slug?.trim() ||
      slugifyArchetype(rawName);

    if (!archSlug) {
      continue;
    }

    const existing = archetypeMap.get(archSlug);

    if (existing) {
      existing.count += 1;
    } else {
      archetypeMap.set(archSlug, {
        name: rawName,
        slug: archSlug,
        count: 1,
      });
    }
  }

  const breakdowns = [...archetypeMap.values()].sort(
    (a, b) => b.count - a.count
  );

  return (
    <main className="min-h-screen bg-[#070D1F] px-3 py-5 text-slate-100 sm:px-6 sm:py-7">
      <Container
        size="md"
        className="space-y-4 px-0 sm:px-0"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            href="/decks"
            className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 transition-colors hover:text-blue-300"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Top Decks
          </Link>

          <Link
            href={decksHref}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-700/70 bg-[#0B132B] px-3 text-[9px] font-black uppercase tracking-[0.14em] text-slate-300 transition-colors hover:border-blue-400/60 hover:text-white"
          >
            Browse decks
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <header className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-[#0B132B] p-5 ring-1 ring-inset ring-white/5 sm:p-7">
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500"
          />

          <div className="grid grid-cols-[auto_1fr] items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div className="flex shrink-0 items-center justify-start">
              {skill.characterImages.length > 0 ? (
                <div className="flex -space-x-3">
                  {skill.characterImages
                    .slice(0, 4)
                    .map((character) => (
                      <Image
                        key={character.slug}
                        src={character.src}
                        alt={character.name}
                        width={76}
                        height={76}
                        unoptimized
                        className="h-[76px] w-[76px] rounded-full border-2 border-[#0B132B] bg-slate-800 object-cover shadow-lg ring-2 ring-sky-400/40"
                      />
                    ))}

                  {skill.characterImages.length > 4 && (
                    <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-[#0B132B] bg-slate-800 text-xs font-black text-slate-300 shadow-lg ring-2 ring-sky-400/40">
                      +{skill.characterImages.length - 4}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  aria-hidden
                  className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-800 text-xl font-black text-white shadow-lg ring-2 ring-sky-400/40"
                >
                  ?
                </div>
              )}
            </div>

            <div className="min-w-0 text-left sm:text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-300/80">
                Skill · {formatLabel}
              </p>

              <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
                {skill.name}
              </h1>
            </div>

            <div className="hidden sm:block" aria-hidden />
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-700/60 bg-[#0B132B] ring-1 ring-inset ring-white/5">
          <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2.5">
            <BookOpen className="h-4 w-4 text-emerald-300" />

            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
              Full effect
            </h2>
          </div>

          <div className="whitespace-pre-line px-3 py-3 text-[12.5px] leading-7 text-slate-300">
            {skill.description.trim() ||
              "No effect description available for this Skill yet."}
          </div>
        </section>

        {mentionedCards.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-slate-700/60 bg-[#0B132B] ring-1 ring-inset ring-white/5">
            <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2.5">
              <Sparkles className="h-4 w-4 text-amber-300" />

              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
                Mentioned cards
              </h2>

              <span className="ml-auto text-[9px] font-black tabular-nums text-slate-500">
                {mentionedCards.length}{" "}
                {mentionedCards.length === 1 ? "card" : "cards"}
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
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <BarChart3 className="h-4 w-4 text-sky-300" />

            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-200">
              Deck Breakdown
            </h2>
          </div>

          {breakdowns.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {breakdowns.map((item) => (
                <Link
                  key={item.slug}
                  href={"/decks/breakdown/" + item.slug}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-700/70 bg-[#0B132B] px-4 py-3 transition-colors hover:border-sky-400/60 hover:bg-[#101C3D]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-sky-300 transition-colors group-hover:text-white">
                      {item.name} Deck Breakdown
                    </p>

                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {item.count}{" "}
                      {item.count === 1 ? "deck" : "decks"} using this Skill
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-300" />
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-slate-700/70 bg-[#0B132B]/60 px-3 py-5 text-center text-xs text-slate-500">
              No deck breakdowns have used this Skill yet.
            </p>
          )}
        </section>
      </Container>
    </main>
  );
}
