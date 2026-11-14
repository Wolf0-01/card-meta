"use client";

import Image from "next/image";

import type { Card } from "@/types/card";

interface CardHeaderProps {
  card: Card;
}

function Badge({
  children,
  color = "zinc",
}: {
  children: React.ReactNode;
  color?: "blue" | "zinc";
}) {
  const styles =
    color === "blue"
      ? "bg-blue-600/20 text-blue-300"
      : "bg-zinc-800 text-white";

  return (
    <span
      className={`
        rounded-full
        px-3
        py-1
        text-sm
        font-medium
        ${styles}
      `}
    >
      {children}
    </span>
  );
}

export default function CardHeader({
  card,
}: CardHeaderProps) {
  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-zinc-800
        bg-zinc-900
      "
    >
      <div
        className="
          grid
          gap-8
          p-6
          md:grid-cols-[260px_1fr]
        "
      >
        <div className="mx-auto w-full max-w-[260px]">
          <Image
            src={
              card.image ??
              "/cards/default.jpg"
            }
            alt={card.name}
            width={421}
            height={614}
            unoptimized
            className="
              w-full
              rounded-xl
              border
              border-zinc-700
              object-cover
            "
            priority
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1
              className="
                text-4xl
                font-black
                text-white
              "
            >
              {card.name}
            </h1>

            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >
              {card.attribute && (
                <Badge color="blue">
                  {card.attribute}
                </Badge>
              )}

              {card.race && (
                <Badge>
                  {card.race}
                </Badge>
              )}

              {card.type && (
                <Badge>
                  {card.type}
                </Badge>
              )}
            </div>
          </div>

          {(card.attack !== null ||
            card.defense !== null) && (
            <div
              className="
                grid
                grid-cols-2
                gap-4
              "
            >
              <div
                className="
                  rounded-xl
                  bg-zinc-950
                  p-4
                  text-center
                "
              >
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wide
                    text-zinc-500
                  "
                >
                  ATK
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-black
                  "
                >
                  {card.attack ?? "-"}
                </p>
              </div>

              <div
                className="
                  rounded-xl
                  bg-zinc-950
                  p-4
                  text-center
                "
              >
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wide
                    text-zinc-500
                  "
                >
                  DEF
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-black
                  "
                >
                  {card.defense ?? "-"}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {card.level && (
              <div>
                <p className="text-zinc-400">
                  Level
                </p>

                <p
                  className="
                    text-xl
                    text-yellow-400
                  "
                >
                  {"★".repeat(card.level)}
                </p>
              </div>
            )}

            {card.archetype && (
              <div>
                <p className="text-zinc-400">
                  Archetype
                </p>

                <p
                  className="
                    font-semibold
                    text-white
                  "
                >
                  {card.archetype}
                </p>
              </div>
            )}

            {card.rarity && (
              <div>
                <p className="text-zinc-400">
                  Rarity
                </p>

                <p className="font-semibold">
                  {card.rarity}
                </p>
              </div>
            )}

            {card.frameType && (
              <div>
                <p className="text-zinc-400">
                  Frame Type
                </p>

                <p className="font-semibold">
                  {card.frameType}
                </p>
              </div>
            )}

            {card.ygoproId && (
              <div>
                <p className="text-zinc-400">
                  YGOPro ID
                </p>

                <p
                  className="
                    font-mono
                    text-sm
                  "
                >
                  {card.ygoproId}
                </p>
              </div>
            )}
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
              pt-4
            "
          />
        </div>
      </div>
    </section>
  );
}