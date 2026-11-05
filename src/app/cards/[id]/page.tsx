import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import {
  mapPrismaCard,
  mapPrismaCardPreview,
} from "@/lib/mappers/cardMapper";

import CardHeader from "@/components/cards/CardHeader";
import CardStats from "@/components/cards/CardStats";
import CardEffect from "@/components/cards/CardEffect";
import CardRelated from "@/components/cards/CardRelated";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

interface CardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CardDetailPage({
  params,
}: CardPageProps) {
  const { id } = await params;

  const cardId = Number(id);

  if (Number.isNaN(cardId)) {
    notFound();
  }

  const prismaCard =
    await prisma.card.findUnique({
      where: {
        id: cardId,
      },
    });

  if (!prismaCard) {
    notFound();
  }

  const card =
    mapPrismaCard(prismaCard);

  const related: CardPreviewData[] =
    card.archetype
      ? (
          await prisma.card.findMany({
            where: {
              archetype:
                card.archetype,

              NOT: {
                id: card.id,
              },
            },

            select: {
id: true,

ygoproId: true,

name: true,

image: true,

type: true,

frameType: true,

attribute: true,

race: true,

rarity: true,

archetype: true,

level: true,

linkRating: true,

linkMarkers: true,

scale: true,

attack: true,

defense: true,

description: true,
},


            take: 12,

            orderBy: {
              name: "asc",
            },
          })
        ).map(mapPrismaCardPreview)
      : [];

  return (
    <main
      className="
        min-h-screen
        bg-zinc-950
        p-8
        text-white
      "
    >
      <div
        className="
          mx-auto
          max-w-7xl
          space-y-8
        "
      >
        <CardHeader
          card={card}
        />

        <CardStats
          attribute={card.attribute}
          race={card.race}
          type={card.type}
          attack={card.attack}
          defense={card.defense}
          level={card.level}
          rarity={card.rarity}
          ygoproId={card.ygoproId}
        />

        <CardEffect
          description={
            card.description
          }
        />

        <CardRelated
          title="Related Cards"
          cards={related}
        />
      </div>
    </main>
  );
}