import CardPageClient from "@/components/cards/CardPageClient";
import CardFilters from "@/components/cards/CardFilters";
import CardsPagination from "@/components/cards/CardsPagination";

import { queryCards } from "@/lib/queryCards";

import type { Card } from "@/types/card";

interface CardsPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    type?: string;
    attribute?: string;
    rarity?: string;
    level?: string;
    monsterType?: string;
    archetype?: string;
    scale?: string;
    minAtk?: string;
    maxAtk?: string;
    minDef?: string;
    maxDef?: string;
  }>;
}

function toNumber(
  value?: string
): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export default async function CardsPage({
  searchParams,
}: CardsPageProps) {
  const params = await searchParams;

  const page = Math.max(
    toNumber(params.page) ?? 1,
    1
  );

  const result = await queryCards({
    search: params.search,
    type: params.type,
    attribute: params.attribute,
    rarity: params.rarity,
    monsterType: params.monsterType,
    archetype: params.archetype,
    level: toNumber(params.level),
    scale: toNumber(params.scale),
    minAttack: toNumber(params.minAtk),
    maxAttack: toNumber(params.maxAtk),
    minDefense: toNumber(params.minDef),
    maxDefense: toNumber(params.maxDef),
    page,
  });

  const cards: Card[] = result.cards.map(
    (card) => ({
      ...card,

      linkMarkers:
        card.linkMarkers as Card["linkMarkers"],
    })
  );

  return (
    <main
      className="
        min-h-screen
        bg-zinc-950
        px-4
        py-6
        text-white
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          space-y-6
        "
      >
        <CardFilters />

        <CardPageClient
          cards={cards}
        />

        <CardsPagination
          currentPage={result.page}
          totalPages={result.pages}
        />
      </div>
    </main>
  );
}
