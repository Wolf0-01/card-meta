"use client";

import Image from "next/image";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  DragEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";

import CardHoverTooltip, {
  type TooltipAnchor,
} from "@/components/cards/CardHoverTooltip";

import BanlistBadge from "@/components/cards/BanlistBadge";

import type { CardPreviewData } from "@/types/CardPreviewData";

import type { DeckZone } from "@/types/deck";

import {
  CARD_DRAG_TYPE,
  DRAFT_DRAG_TYPE,
  type DraftDragPayload,
} from "./dnd";

interface MiniCardTileProps {
  card: CardPreviewData;

  mode?: "search" | "deck";

  draggable?: boolean;

  draftZone?: DeckZone;

  onClick?: () => void;

  onContextMenu?: (
    event: MouseEvent<HTMLDivElement>
  ) => void;

  onAddOne?: () => void;

  onRemoveOne?: () => void;

  className?: string;
}

function getLevelLabel(card: CardPreviewData) {
  if (card.linkRating) {
    return `L${card.linkRating}`;
  }

  if (card.level) {
    return `★${card.level}`;
  }

  return null;
}

export default function MiniCardTile({
  card,
  mode = "search",
  draggable = true,
  draftZone,
  onClick,
  onContextMenu,
  onAddOne,
  onRemoveOne,
  className = "",
}: MiniCardTileProps) {
  const [failed, setFailed] =
    useState(false);

  const [anchor, setAnchor] =
    useState<TooltipAnchor | null>(null);

  const tileRef =
    useRef<HTMLDivElement>(null);

  const imageSrc =
    failed || !card.image
      ? "/cards/default.jpg"
      : card.image;

  const isDeck = mode === "deck";

  function showTooltip() {
    if (!isDeck) {
      return;
    }

    const rect =
      tileRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setAnchor({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    });
  }

  function hideTooltip() {
    setAnchor(null);
  }

  useEffect(() => {
    if (!anchor) {
      return;
    }

    function handleViewportChange() {
      setAnchor(null);
    }

    window.addEventListener(
      "scroll",
      handleViewportChange,
      true
    );

    window.addEventListener(
      "resize",
      handleViewportChange
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleViewportChange,
        true
      );

      window.removeEventListener(
        "resize",
        handleViewportChange
      );
    };
  }, [anchor]);

  const levelLabel = getLevelLabel(card);

  function handleDragStart(
    event: DragEvent<HTMLDivElement>
  ) {
    setAnchor(null);

    if (draftZone) {
      const payload: DraftDragPayload = {
        cardId: card.id,
        zone: draftZone,
      };

      event.dataTransfer.setData(
        DRAFT_DRAG_TYPE,

        JSON.stringify(payload)
      );

      event.dataTransfer.effectAllowed =
        "move";

      return;
    }

    event.dataTransfer.setData(
      CARD_DRAG_TYPE,

      JSON.stringify(card)
    );

    event.dataTransfer.effectAllowed =
      "copy";
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLDivElement>
  ) {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();

      onClick?.();
    }
  }

  return (
    <div
      ref={tileRef}
      className={`
        group
        relative
        w-full
        select-none
        ${draggable ? "cursor-grab active:cursor-grabbing" : ""}
        ${className}
      `}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      draggable={draggable}
      onDragStart={handleDragStart}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onClick={onClick}
      onKeyDown={
        onClick ? handleKeyDown : undefined
      }
      onContextMenu={onContextMenu}
      title={card.name}
    >
      <div
        className="
          relative
          aspect-[59/86]
          overflow-hidden
          rounded-lg
          border
          border-border
          bg-surface
          shadow-sm
          transition-all
          duration-150
          group-hover:border-primary
          group-hover:shadow-md
        "
      >
        <Image
          src={imageSrc}
          alt={card.name}
          fill
          sizes="(max-width: 1024px) 14vw, 88px"
          unoptimized={failed}
          onError={() => setFailed(true)}
          draggable={false}
          className="
            object-cover
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-8
            bg-gradient-to-b
            from-black/75
            to-transparent
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            bottom-0
            h-10
            bg-gradient-to-t
            from-black/65
            to-transparent
          "
        />

        {levelLabel && (
          <span
            className="
              absolute
              right-1
              top-1
              rounded
              bg-black/80
              px-1
              py-0.5
              text-[8px]
              font-black
              leading-none
              text-amber-300
              shadow
            "
          >
            {levelLabel}
          </span>
        )}

        {card.banlistStatus && (
          <span className="absolute left-1 top-1 z-10">
            <BanlistBadge
              status={card.banlistStatus}
              size="sm"
            />
          </span>
        )}

        {!isDeck && (
          <span
            className="
              pointer-events-none
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/0
              opacity-0
              transition
              duration-150
              group-hover:bg-black/45
              group-hover:opacity-100
            "
          >
            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                bg-emerald-500
                text-lg
                font-black
                leading-none
                text-emerald-950
                shadow-lg
              "
            >
              +
            </span>
          </span>
        )}
      </div>

      {isDeck && (
        <div className="mt-1 flex items-center gap-1">
          <button
            type="button"
            aria-label={`Remove one copy of ${card.name}`}
            onClick={(event) => {
              event.stopPropagation();

              onRemoveOne?.();
            }}
            className="
              flex
              h-5
              flex-1
              items-center
              justify-center
              rounded
              border
              border-border
              bg-surface
              text-[11px]
              font-black
              leading-none
              text-foreground-muted
              transition-colors
              hover:border-amber-400/70
              hover:text-amber-300
            "
          >
            −
          </button>

          <button
            type="button"
            aria-label={`Add one copy of ${card.name}`}
            onClick={(event) => {
              event.stopPropagation();

              onAddOne?.();
            }}
            className="
              flex
              h-5
              flex-1
              items-center
              justify-center
              rounded
              border
              border-border
              bg-surface
              text-[11px]
              font-black
              leading-none
              text-foreground-muted
              transition-colors
              hover:border-emerald-400/70
              hover:text-emerald-300
            "
          >
            +
          </button>
        </div>
      )}

      {!isDeck && (
        <p
          className="
            mt-1
            truncate
            text-[10px]
            leading-tight
            text-foreground-muted
          "
        >
          {card.name}
        </p>
      )}

      {anchor && isDeck && (
        <CardHoverTooltip
          card={card}
          anchor={anchor}
        />
      )}
    </div>
  );
}
