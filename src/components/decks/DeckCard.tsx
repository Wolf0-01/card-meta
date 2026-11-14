"use client";

import Image from "next/image";

type DeckZone =
  | "main"
  | "extra";

interface CardData {
  id: string | number;
  name?: string;
  image?: string | null;
  type?: string;
}

export interface DeckCardData {
  id: string | number;
  quantity?: number;
  zone?: DeckZone;
  card?: CardData;
  name?: string;
  image?: string | null;
  type?: string;
}

interface Props {
  card: DeckCardData;

  onClick?: () => void;

  showControls?: boolean;
  showZone?: boolean;

  showAddButtons?: boolean;

  onAddToZone?: (
    zone: DeckZone
  ) => void;

  onIncrease?: () => void;
  onDecrease?: () => void;
  onRemove?: () => void;

  onMove?: (
    zone: DeckZone
  ) => void;
}

export default function DeckCard({
  card,
  onClick,
  showControls = false,
  showZone = false,
  showAddButtons = false,
  onAddToZone,
  onIncrease,
  onDecrease,
  onRemove,
  onMove,
}: Props) {
  const data =
    card.card ?? card;

  const image =
    data.image ??
    card.image ??
    "/cards/default.jpg";

  const imageSrc =
    image.startsWith("http")
      ? image
      : image.startsWith("/")
        ? image
        : "/cards/default.jpg";

  const name =
    data.name ??
    card.name ??
    "Unknown Card";

  const quantity =
    card.quantity ?? 1;

  const type =
    data.type ??
    card.type;

  return (
    <div
      className="
        group
        relative
        w-full
        min-w-0
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950
        p-2
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-blue-500
        hover:shadow-xl
        hover:shadow-blue-500/20
      "
    >
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`
          block
          w-full
          overflow-hidden
          rounded-lg
          ${
            onClick
              ? "cursor-pointer"
              : "cursor-default"
          }
        `}
        aria-label={
          onClick
            ? `Agregar ${name}`
            : name
        }
      >
        <Image
          src={imageSrc}
          alt={name}
          width={115}
          height={165}
          unoptimized
          className="
            h-auto
            w-full
            rounded-lg
            object-cover
            transition-transform
            duration-300
            group-hover:scale-105
          "
        />
      </button>

      {quantity > 1 && (
        <div
          className="
            absolute
            right-1
            top-1
            rounded-full
            bg-blue-600
            px-2
            py-1
            text-xs
            font-black
            text-white
            shadow-lg
          "
        >
          x{quantity}
        </div>
      )}

      {showZone && card.zone && (
        <div
          className="
            absolute
            left-1
            top-1
            rounded-md
            bg-black/70
            px-2
            py-1
            text-[10px]
            uppercase
            text-zinc-300
          "
        >
          {card.zone}
        </div>
      )}

      <p
        className="
          mt-2
          min-h-[32px]
          line-clamp-2
          text-center
          text-xs
          font-semibold
          text-zinc-300
        "
      >
        {name}
      </p>

      {type && (
        <p
          className="
            line-clamp-1
            text-center
            text-[10px]
            text-zinc-500
          "
        >
          {type}
        </p>
      )}

      {showAddButtons && onAddToZone && (
        <div
          className="
            mt-3
            grid
            grid-cols-3
            gap-1
          "
        >
          <button
            type="button"
            onClick={() =>
              onAddToZone("main")
            }
            className="
              rounded-md
              bg-blue-600
              px-1
              py-1.5
              text-[9px]
              font-bold
              text-white
              transition
              hover:bg-blue-500
            "
          >
            MAIN
          </button>

          <button
            type="button"
            onClick={() =>
              onAddToZone("extra")
            }
            className="
              rounded-md
              bg-violet-600
              px-1
              py-1.5
              text-[9px]
              font-bold
              text-white
              transition
              hover:bg-violet-500
            "
          >
            EXTRA
          </button>
        </div>
      )}

      {showControls && (
        <div
          className="
            mt-3
            space-y-2
          "
        >
          <div
            className="
              flex
              gap-2
            "
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDecrease?.();
              }}
              className="
                flex-1
                rounded-md
                bg-zinc-700
                py-1
                text-sm
                font-bold
                text-white
                hover:bg-zinc-600
              "
            >
              −
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onIncrease?.();
              }}
              className="
                flex-1
                rounded-md
                bg-blue-600
                py-1
                text-sm
                font-bold
                text-white
                hover:bg-blue-500
              "
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRemove?.();
            }}
            className="
              w-full
              rounded-md
              bg-red-600
              py-1
              text-xs
              font-bold
              text-white
              hover:bg-red-500
            "
          >
            Delete
          </button>

          {onMove && (
            <div
              className="
                grid
                grid-cols-2
                gap-1
              "
            >
              {(
                [
                  "main",
                  "extra",
                ] as DeckZone[]
              ).map((zone) => (
                <button
                  key={zone}
                  type="button"
                  onClick={() =>
                    onMove(zone)
                  }
                  disabled={
                    card.zone === zone
                  }
                  className="
                    rounded
                    bg-zinc-700
                    py-1
                    text-[9px]
                    text-white
                    hover:bg-zinc-600
                    disabled:cursor-default
                    disabled:bg-zinc-800
                    disabled:text-zinc-600
                  "
                >
                  {zone.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}