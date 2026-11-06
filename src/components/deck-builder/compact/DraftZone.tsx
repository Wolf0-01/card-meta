"use client";

import {
  useState,
} from "react";

import type {
  DragEvent,
} from "react";

import type {
  CardPreviewData,
} from "@/types/CardPreviewData";

import type { DeckZone } from "@/types/deck";

import type {
  DraftCard,
} from "@/types/deck-draft";

import MiniCardTile from "./MiniCardTile";

import {
  CARD_DRAG_TYPE,
  DECK_ZONE_LABELS,
  DRAFT_DRAG_TYPE,
  type DraftDragPayload,
} from "./dnd";

const ZONE_ACCENTS: Record<
  DeckZone,
  {
    dot: string;
    bar: string;
  }
> = {
  main: {
    dot: "bg-primary",
    bar: "bg-primary",
  },

  extra: {
    dot: "bg-violet-400",
    bar: "bg-violet-400",
  },

  side: {
    dot: "bg-amber-400",
    bar: "bg-amber-400",
  },
};

interface DraftZoneProps {
  zone: DeckZone;

  cards: DraftCard[];

  total: number;

  limit: number;

  min?: number;

  onAddCard: (
    card: CardPreviewData,
    zone: DeckZone
  ) => void;

  onMoveCard: (
    cardId: number,
    from: DeckZone,
    to: DeckZone
  ) => void;

  onRemoveOne: (
    cardId: number,
    zone: DeckZone
  ) => void;

  onRemoveAll: (
    cardId: number,
    zone: DeckZone
  ) => void;

  scrollable?: boolean;
}

function getCountClasses(
  zone: DeckZone,
  total: number,
  limit: number,
  min?: number
) {
  if (total > limit) {
    return "text-red-400";
  }

  if (zone === "main" && min) {
    return total >= min
      ? "text-emerald-400"
      : "text-amber-400";
  }

  return total > 0
    ? "text-emerald-400"
    : "text-foreground-muted";
}

export default function DraftZone({
  zone,
  cards,
  total,
  limit,
  min,
  onAddCard,
  onMoveCard,
  onRemoveOne,
  onRemoveAll,
  scrollable = false,
}: DraftZoneProps) {
  const [isDragOver, setIsDragOver] =
    useState(false);

  const accent = ZONE_ACCENTS[zone];

  const progress = Math.min(
    (total / limit) * 100,
    100
  );

  function hasAcceptedDrag(
    event: DragEvent<HTMLElement>
  ) {
    const types = Array.from(
      event.dataTransfer.types
    );

    return (
      types.includes(CARD_DRAG_TYPE) ||
      types.includes(DRAFT_DRAG_TYPE)
    );
  }

  function handleDragOver(
    event: DragEvent<HTMLElement>
  ) {
    if (!hasAcceptedDrag(event)) {
      return;
    }

    event.preventDefault();

    event.dataTransfer.dropEffect =
      Array.from(
        event.dataTransfer.types
      ).includes(DRAFT_DRAG_TYPE)
        ? "move"
        : "copy";

    setIsDragOver(true);
  }

  function handleDragLeave(
    event: DragEvent<HTMLElement>
  ) {
    const nextTarget =
      event.relatedTarget as Node | null;

    if (
      nextTarget &&
      event.currentTarget.contains(nextTarget)
    ) {
      return;
    }

    setIsDragOver(false);
  }

  function handleDrop(
    event: DragEvent<HTMLElement>
  ) {
    event.preventDefault();

    setIsDragOver(false);

    const cardPayload =
      event.dataTransfer.getData(
        CARD_DRAG_TYPE
      );

    if (cardPayload) {
      try {
        const card = JSON.parse(
          cardPayload
        ) as CardPreviewData;

        if (card && typeof card.id === "number") {
          onAddCard(card, zone);
        }
      } catch {
        /* Payload inválido: se ignora. */
      }

      return;
    }

    const draftPayload =
      event.dataTransfer.getData(
        DRAFT_DRAG_TYPE
      );

    if (!draftPayload) {
      return;
    }

    try {
      const payload = JSON.parse(
        draftPayload
      ) as DraftDragPayload;

      if (
        typeof payload.cardId === "number" &&
        payload.zone !== zone
      ) {
        onMoveCard(
          payload.cardId,
          payload.zone,
          zone
        );
      }
    } catch {
      /* Payload inválido: se ignora. */
    }
  }

  return (
    <section
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        rounded-2xl
        border
        bg-background-secondary
        transition-colors
        duration-150
        ${
          isDragOver
            ? "border-emerald-400 bg-emerald-500/5 ring-2 ring-emerald-400/30"
            : "border-border"
        }
      `}
    >
      <header className="flex items-center justify-between gap-3 px-3 pb-2 pt-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${accent.dot}`}
          />

          <h2 className="truncate text-xs font-black uppercase tracking-wide text-foreground">
            {DECK_ZONE_LABELS[zone]}
          </h2>

          <span className="text-[10px] text-foreground-muted">
            {min
              ? `${min} mín.`
              : `${limit} máx.`}
          </span>
        </div>

        <span
          className={`shrink-0 text-xs font-black tabular-nums ${getCountClasses(
            zone,
            total,
            limit,
            min
          )}`}
        >
          {total}
          <span className="text-foreground-muted">
            /{limit}
          </span>
        </span>
      </header>

      <div className="mx-3 h-0.5 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ${
            total > limit
              ? "bg-red-400"
              : accent.bar
          }`}
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div
        className={`
          p-3
          ${
            scrollable
              ? "max-h-[46vh] overflow-y-auto"
              : "max-h-[34vh] overflow-y-auto"
          }
        `}
      >
        {cards.length === 0 ? (
          <div
            className={`
              flex
              min-h-[116px]
              flex-col
              items-center
              justify-center
              gap-1
              rounded-xl
              border
              border-dashed
              px-4
              py-6
              text-center
              text-[11px]
              transition-colors
              ${
                isDragOver
                  ? "border-emerald-400 text-emerald-300"
                  : "border-border text-foreground-muted"
              }
            `}
          >
            <span className="text-xl">
              {isDragOver ? "⬇" : "＋"}
            </span>

            <p className="font-semibold">
              {isDragOver
                ? `Suelta la carta en ${DECK_ZONE_LABELS[zone]}`
                : "Arrastra cartas aquí"}
            </p>

            <p className="text-[10px] opacity-80">
              También puedes hacer clic en el
              buscador.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-[repeat(auto-fill,minmax(88px,1fr))]
              justify-items-center
              gap-2
            "
          >
            {cards.map((card) => (
              <MiniCardTile
                key={`${zone}-${card.id}`}
                card={card.card}
                mode="deck"
                quantity={card.quantity}
                draftZone={zone}
                onRemoveOne={() =>
                  onRemoveOne(
                    card.id,
                    zone
                  )
                }
                onRemoveAll={() =>
                  onRemoveAll(
                    card.id,
                    zone
                  )
                }
                onContextMenu={(event) => {
                  event.preventDefault();

                  onRemoveOne(
                    card.id,
                    zone
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
