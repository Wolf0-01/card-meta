"use client";

import Link from "next/link";
import Image from "next/image";

import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

import { MetaDeck } from "@/types/meta";

interface Props {
  deck: MetaDeck;
}

export default function DeckListCard({
  deck,
}: Props) {
  return (
    <Card
      className="
        overflow-hidden
        transition-all
        duration-300
        hover:border-primary
        hover:shadow-xl
      "
    >
      <div className="relative h-48">
        <Image
          src={
            deck.image ??
            deck.banner ??
            "/images/decks/default.webp"
          }
          alt={deck.name}
          fill
          className="object-cover"
          unoptimized
        />

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/80
            via-black/20
            to-transparent
          "
        />
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3
            className="
              line-clamp-2
              text-xl
              font-bold
            "
          >
            {deck.name}
          </h3>

          <p className="mt-1 text-sm text-foreground-muted">
            {deck.archetypeName ??
              (typeof deck.archetype === "object"
                ? deck.archetype?.name
                : deck.archetype) ??
              "Unknown"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>
            {deck.tier ?? "Rogue"}
          </Badge>

          <Badge variant="success">
            {deck.winRate}% WR
          </Badge>

          <Badge variant="secondary">
            {deck.popularity}%
          </Badge>
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-3
            text-center
          "
        >
          <div>
            <p className="text-xs text-foreground-muted">
              Main
            </p>

            <p className="font-bold">
              {deck.mainCards ?? 0}
            </p>
          </div>

          <div>
            <p className="text-xs text-foreground-muted">
              Extra
            </p>

            <p className="font-bold">
              {deck.extraCards ?? 0}
            </p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <div className="text-sm text-foreground-muted">
            Tops:{" "}
            <span className="font-semibold text-foreground">
              {deck.tournamentResults ?? 0}
            </span>
          </div>

          <Link
            href={`/decks/${deck.slug}/${deck.identifier}`}
          >
            <Button size="sm">
              Ver Deck
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}