import type { Metadata } from "next";

import Link from "next/link";

import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import ArchetypeBreakdown from "@/components/decks/ArchetypeBreakdown";

import ArchetypeSampleDeck from "@/components/decks/ArchetypeSampleDeck";

import { findArchetypeBreakdown } from "@/services/decks";

interface ArchetypeBreakdownPageProps {
  params: Promise<{
    archetype: string;
  }>;

  searchParams: Promise<{
    format?: string;
  }>;
}

export async function generateMetadata({
  params,
}: ArchetypeBreakdownPageProps): Promise<Metadata> {
  const { archetype } = await params;

  return {
    title: `${archetype} Deck Breakdown | Card Meta`,

    description: `Main Deck, Extra Deck and popular Skills for the ${archetype} archetype, with a sample deck ready to build in the Deck Builder.`,
  };
}

export default async function ArchetypeBreakdownPage({
  params,
  searchParams,
}: ArchetypeBreakdownPageProps) {
  const { archetype } = await params;

  const query = await searchParams;

  const format =
    query.format === "rush" ? "rush" : "speed";

  const breakdown = await findArchetypeBreakdown(
    format,
    archetype
  );

  if (!breakdown) {
    notFound();
  }

  const decksParams = new URLSearchParams({
    archetype: breakdown.archetype,
  });

  if (format === "rush") {
    decksParams.set("format", "rush");
  }

  const decksHref = `/decks?${decksParams.toString()}`;

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
        <header className="space-y-2">
          <Link
            href={decksHref}
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
            Back to {breakdown.archetype} Decks
          </Link>

          <div
            className="
              flex
              flex-col
              items-center
              gap-1.5
              text-center
            "
          >
            <h1
              className="
                text-2xl
                font-black
                uppercase
                tracking-tight
                text-white
                sm:text-3xl
              "
            >
              {breakdown.archetype} Deck Breakdown
            </h1>

            <p
              className="
                max-w-xl
                text-[11px]
                leading-relaxed
                text-slate-400
              "
            >
              {`Deck Statistics · Average size: ${
                breakdown.averageSize
              } ${
                breakdown.averageSize === 1
                  ? "card"
                  : "cards"
              }`}
            </p>
          </div>
        </header>

        <ArchetypeBreakdown breakdown={breakdown} />

        {breakdown.sampleDeck && (
          <ArchetypeSampleDeck
            deck={breakdown.sampleDeck}
          />
        )}
      </div>
    </main>
  );
}
