"use client";

import Image from "next/image";

import Link from "next/link";

import {
  ChevronDown,
  Gem,
  Info,
  Package,
  Ticket,
} from "lucide-react";

import {
  normalizeRarity,
  RARITY_STYLES,
} from "@/components/cards/cardRarity";

import { formatNumber } from "@/lib/format";

import type {
  DeckGemEstimate,
  GemBox,
  GemBoxCard,
  GemFreeCard,
  GemFreeSource,
} from "@/lib/decks/gemCalculator";

interface DeckGemBreakdownProps {
  estimate: DeckGemEstimate;
}

function formatCycles(box: GemBox): string {
  if (box.unit === "compra") {
    return `${box.cycles} ${
      box.cycles === 1 ? "compra" : "compras"
    }`;
  }

  if (box.unit === "caja") {
    return `${box.cycles} ${
      box.cycles === 1 ? "caja" : "cajas"
    }`;
  }

  return `${box.cycles} ${
    box.cycles === 1 ? "vuelta" : "vueltas"
  }`;
}

function formatFreeSource(
  source: GemFreeSource
): string {
  if (source.type === "characters") {
    return `Personaje · ${source.name}`;
  }

  return source.name;
}

interface CardThumbProps {
  card: GemBoxCard | GemFreeCard;

  copiesPerCycle?: number;
}

function CardThumb({
  card,
  copiesPerCycle,
}: CardThumbProps) {
  const rarity = normalizeRarity(card.rarity);

  const style = RARITY_STYLES[rarity];

  const title =
    copiesPerCycle !== undefined
      ? `${card.name}: ${card.needed} necesarias · ${copiesPerCycle} por caja`
      : `${card.name}: ${card.needed} necesarias`;

  return (
    <span
      title={title}
      className="relative block shrink-0"
    >
      <span
        className="
          relative
          block
          h-10
          w-7
          overflow-hidden
          rounded
          border
          border-border
          bg-surface
        "
      >
        {card.image ? (
          <Image
            src={card.image}
            alt={card.name}
            fill
            sizes="28px"
            className="object-cover"
          />
        ) : (
          <span
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              text-[7px]
              font-black
              text-foreground-muted
            "
          >
            {rarity}
          </span>
        )}

        <span
          aria-hidden
          className={`absolute inset-x-0 top-0 h-[2px] ${style.strip}`}
        />
      </span>

      <span
        className="
          absolute
          -bottom-1
          -right-1
          rounded
          bg-background
          px-1
          text-[7px]
          font-black
          tabular-nums
          text-foreground
          ring-1
          ring-border
        "
      >
        ×{card.needed}
      </span>
    </span>
  );
}

function BoxRow({ box }: { box: GemBox }) {
  return (
    <details
      className="
        group/box
        overflow-hidden
        rounded-lg
        border
        border-border
        bg-background
      "
    >
      <summary
        className="
          flex
          cursor-pointer
          list-none
          items-center
          gap-2
          p-2
          [&::-webkit-details-marker]:hidden
        "
      >
        {box.bannerUrl ? (
          // Los banners de Duel Links Meta son URLs externas.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={box.bannerUrl}
            alt=""
            loading="lazy"
            className="
              h-8
              w-14
              shrink-0
              rounded
              border
              border-border
              object-cover
            "
          />
        ) : (
          <span
            className="
              flex
              h-8
              w-14
              shrink-0
              items-center
              justify-center
              rounded
              border
              border-border
              bg-surface
              text-foreground-muted
            "
          >
            <Package className="h-3.5 w-3.5" />
          </span>
        )}

        <span className="min-w-0 flex-1">
          <Link
            href={box.href}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="
              block
              truncate
              text-[11px]
              font-black
              text-foreground
              transition-colors
              hover:text-primary
            "
          >
            {box.name}
          </Link>

          <span
            className="
              mt-0.5
              block
              truncate
              text-[8px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-foreground-muted
            "
          >
            {box.typeLabel} · {formatCycles(box)}
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span
            className="
              block
              text-[11px]
              font-black
              tabular-nums
              text-amber-300
            "
          >
            {formatNumber(box.maxGems)}
          </span>

          <span
            className="
              block
              text-[7px]
              font-black
              uppercase
              tracking-[0.12em]
              text-foreground-muted
            "
          >
            gemas
          </span>
        </span>

        <ChevronDown
          className="
            h-3.5
            w-3.5
            shrink-0
            text-foreground-muted
            transition-transform
            group-open/box:rotate-180
          "
        />
      </summary>

      <div className="border-t border-border p-2">
        <div className="flex flex-wrap gap-1.5">
          {box.cards.map((card) => (
            <CardThumb
              key={card.cardId}
              card={card}
              copiesPerCycle={card.copiesPerCycle}
            />
          ))}
        </div>

        <ul className="mt-2 space-y-1">
          {box.cards.map((card) => (
            <li
              key={card.cardId}
              className="
                flex
                items-center
                justify-between
                gap-2
                text-[9px]
              "
            >
              <span className="min-w-0 truncate text-foreground-secondary">
                {card.name}
              </span>

              <span
                className="
                  shrink-0
                  tabular-nums
                  text-foreground-muted
                "
              >
                ×{card.needed} ·{" "}
                {card.copiesPerCycle}/caja
              </span>
            </li>
          ))}
        </ul>

        <div
          className="
            mt-2
            flex
            items-center
            justify-between
            gap-2
            border-t
            border-border
            pt-1.5
            text-[8px]
            font-bold
            uppercase
            tracking-[0.1em]
            text-foreground-muted
          "
        >
          <span>Promedio estimado</span>

          <span className="tabular-nums text-foreground-secondary">
            {formatNumber(box.averageGems)} gemas
          </span>
        </div>

        {box.note && (
          <p
            className="
              mt-1.5
              text-[9px]
              leading-relaxed
              text-amber-300/80
            "
          >
            {box.note}
          </p>
        )}
      </div>
    </details>
  );
}

export default function DeckGemBreakdown({
  estimate,
}: DeckGemBreakdownProps) {
  const hasBoxes = estimate.boxes.length > 0;

  const hasFreeCards =
    estimate.freeCards.length > 0;

  return (
    <section
      aria-labelledby="deck-gem-breakdown"
      className="
        rounded-2xl
        border
        border-border
        bg-background-secondary
        p-4
      "
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-amber-400/30
            bg-amber-500/10
            text-amber-300
          "
        >
          <Gem className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p
            id="deck-gem-breakdown"
            className="
              text-[9px]
              font-black
              uppercase
              tracking-[0.2em]
              text-foreground-muted
            "
          >
            Coste en gemas
          </p>

          <p className="mt-0.5 flex items-baseline gap-1">
            <span
              className="
                text-xl
                font-black
                tabular-nums
                text-foreground
              "
            >
              {formatNumber(estimate.maxGems)}
            </span>

            <span className="text-[10px] font-bold text-foreground-muted">
              gemas
            </span>
          </p>

          <p className="text-[9px] text-foreground-muted">
            máximo estimado · peor escenario
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div
          className="
            rounded-lg
            border
            border-border
            bg-surface/50
            p-2
          "
        >
          <p
            className="
              text-[8px]
              font-black
              uppercase
              tracking-[0.12em]
              text-foreground-muted
            "
          >
            Máximo
          </p>

          <p className="text-sm font-black tabular-nums text-amber-300">
            {formatNumber(estimate.maxGems)}
          </p>
        </div>

        <div
          className="
            rounded-lg
            border
            border-border
            bg-surface/50
            p-2
          "
        >
          <p
            className="
              text-[8px]
              font-black
              uppercase
              tracking-[0.12em]
              text-foreground-muted
            "
          >
            Promedio
          </p>

          <p className="text-sm font-black tabular-nums text-foreground">
            {formatNumber(estimate.averageGems)}
          </p>
        </div>
      </div>

      <p className="mt-2 text-[9px] leading-relaxed text-foreground-muted">
        {estimate.paidCopies} copias desde cajas ·{" "}
        {estimate.freeCopies} fuera de sobres
      </p>

      {hasBoxes ? (
        <details
          className="
            group
            mt-3
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-surface/40
          "
        >
          <summary
            className="
              flex
              cursor-pointer
              list-none
              items-center
              gap-2
              p-2.5
              [&::-webkit-details-marker]:hidden
            "
          >
            <Package className="h-3.5 w-3.5 shrink-0 text-primary" />

            <span
              className="
                flex-1
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-foreground-secondary
              "
            >
              Cajas necesarias
            </span>

            <span
              className="
                rounded
                border
                border-border
                bg-background
                px-1.5
                py-0.5
                text-[8px]
                font-black
                tabular-nums
                text-foreground-muted
              "
            >
              {estimate.boxes.length}
            </span>

            <ChevronDown
              className="
                h-3.5
                w-3.5
                shrink-0
                text-foreground-muted
                transition-transform
                group-open:rotate-180
              "
            />
          </summary>

          <div className="space-y-2 border-t border-border p-2">
            {estimate.boxes.map((box) => (
              <BoxRow
                key={box.key}
                box={box}
              />
            ))}
          </div>
        </details>
      ) : (
        <p
          className="
            mt-3
            rounded-lg
            border
            border-dashed
            border-border
            bg-surface/40
            p-2.5
            text-[10px]
            text-foreground-muted
          "
        >
          Este mazo no necesita abrir cajas: todas
          sus cartas son gratuitas o no tienen una
          caja registrada.
        </p>
      )}

      {hasFreeCards && (
        <details
          className="
            group
            mt-2
            overflow-hidden
            rounded-xl
            border
            border-border
            bg-surface/40
          "
        >
          <summary
            className="
              flex
              cursor-pointer
              list-none
              items-center
              gap-2
              p-2.5
              [&::-webkit-details-marker]:hidden
            "
          >
            <Ticket className="h-3.5 w-3.5 shrink-0 text-emerald-300" />

            <span
              className="
                flex-1
                text-[9px]
                font-black
                uppercase
                tracking-[0.16em]
                text-foreground-secondary
              "
            >
              Fuera de sobres
            </span>

            <span
              className="
                rounded
                border
                border-border
                bg-background
                px-1.5
                py-0.5
                text-[8px]
                font-black
                tabular-nums
                text-foreground-muted
              "
            >
              {estimate.freeCards.length}
            </span>

            <ChevronDown
              className="
                h-3.5
                w-3.5
                shrink-0
                text-foreground-muted
                transition-transform
                group-open:rotate-180
              "
            />
          </summary>

          <ul className="space-y-2 border-t border-border p-2">
            {estimate.freeCards.map((card) => (
              <li
                key={card.cardId}
                className="flex items-center gap-2"
              >
                <CardThumb card={card} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold text-foreground">
                    {card.name}
                  </p>

                  <p
                    className="
                      truncate
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.1em]
                      text-foreground-muted
                    "
                  >
                    {card.sources.length > 0
                      ? card.sources
                          .map(formatFreeSource)
                          .join(" · ")
                      : "Sin origen registrado"}
                  </p>
                </div>

                <span
                  className="
                    shrink-0
                    text-[9px]
                    font-black
                    tabular-nums
                    text-foreground-muted
                  "
                >
                  ×{card.needed}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {estimate.hasUnknownSources && (
        <p
          className="
            mt-2
            rounded-lg
            border
            border-amber-400/20
            bg-amber-500/5
            px-2
            py-1.5
            text-[9px]
            leading-relaxed
            text-amber-300/80
          "
        >
          Algunas cartas no tienen datos de
          obtención en el catálogo.
        </p>
      )}

      <p
        className="
          mt-3
          flex
          items-start
          gap-1.5
          border-t
          border-border
          pt-2
          text-[8px]
          leading-relaxed
          text-foreground-muted
        "
      >
        <Info className="mt-0.5 h-3 w-3 shrink-0" />

        <span>
          Estimación basada en vueltas completas y
          copias garantizadas por caja. No incluye
          ofertas, Box Chips ni tickets de ensueño.
        </span>
      </p>
    </section>
  );
}
