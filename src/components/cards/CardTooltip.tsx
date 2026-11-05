"use client";

import Image from "next/image";

import { DeckCardInfo } from "@/types/deck";

interface CardTooltipProps {
  card: DeckCardInfo;
}

export default function CardTooltip({
  card,
}: CardTooltipProps) {
  return (
    <div
      className="
        absolute
        left-full
        top-0
        z-50
        ml-4
        hidden
        w-80
        rounded-2xl
        border
        border-zinc-700
        bg-zinc-900
        p-4
        shadow-2xl
        group-hover:block
      "
    >
      <div
        className="
          flex
          gap-4
        "
      >
        <div
          className="
            relative
            h-52
            w-36
            flex-shrink-0
          "
        >
          <Image
            src={
              card.image ??
              "/images/cards/card-placeholder.webp"
            }
            alt={card.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div
          className="
            flex-1
            space-y-3
          "
        >
          <h3
            className="
              text-lg
              font-bold
              text-white
            "
          >
            {card.name}
          </h3>

          <div
            className="
              text-sm
              text-zinc-300
            "
          >
            {card.type}
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-2
              text-sm
            "
          >
            <div>

              <span className="text-zinc-500">

                Attribute

              </span>

              <p className="text-white">

                {card.attribute ?? "-"}

              </p>

            </div>

            <div>

              <span className="text-zinc-500">

                Race

              </span>

              <p className="text-white">

                {card.race ?? "-"}

              </p>

            </div>

            <div>

              <span className="text-zinc-500">

                ATK

              </span>

              <p className="text-white">

                {card.attack ?? "-"}

              </p>

            </div>

            <div>

              <span className="text-zinc-500">

                DEF

              </span>

              <p className="text-white">

                {card.defense ?? "-"}

              </p>

            </div>

          </div>

          {card.description && (

            <p
              className="
                text-xs
                leading-5
                text-zinc-400
              "
            >
              {card.description}
            </p>

          )}
        </div>
      </div>
    </div>
  );
}