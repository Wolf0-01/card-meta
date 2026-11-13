import type { DuelFormat } from "@/lib/duelFormat";

import type { CardPreviewData } from "@/types/CardPreviewData";

import type { DeckZone } from "@/types/deck";

import type {
  DraftCard,
  DraftIssue,
  DraftStats,
  DraftValidation,
} from "@/types/deck-draft";

import {
  DECK_RULES,
  DECK_ZONE_LIMITS,
} from "./rules";

export function getDraftZoneTotal(
  cards: DraftCard[],
  zone: DeckZone
) {
  return cards.reduce(
    (total, card) =>
      card.zone === zone
        ? total + card.quantity
        : total,
    0
  );
}

export function getDraftCardCopies(
  cards: DraftCard[],
  cardId: number
) {
  return cards.reduce(
    (total, card) =>
      card.id === cardId
        ? total + card.quantity
        : total,
    0
  );
}

export function getDraftStats(
  cards: DraftCard[]
): DraftStats {
  const main = getDraftZoneTotal(
    cards,
    "main"
  );

  const extra = getDraftZoneTotal(
    cards,
    "extra"
  );

  return {
    main,
    extra,
    total: main + extra,
  };
}

/**
 * Las cartas de Fusión, Sincronía, Xyz y Link
 * se añaden directamente al Extra Deck.
 */
export function getDefaultDraftZone(
  card: Pick<CardPreviewData, "type" | "frameType">,
  format: DuelFormat = "speed"
): DeckZone {
  if (format === "rush") {
    return "main";
  }

  const text =
    `${card.type ?? ""} ${
      card.frameType ?? ""
    }`.toLowerCase();

  if (
    /fusion|synchro|xyz|link/.test(
      text
    )
  ) {
    return "extra";
  }

  return "main";
}

export function addDraftCard(
  cards: DraftCard[],
  card: CardPreviewData,
  zone?: DeckZone,
  format: DuelFormat = "speed"
): DraftCard[] {
  const targetZone =
    format === "rush"
      ? "main"
      : zone ?? getDefaultDraftZone(card);

  if (
    getDraftCardCopies(cards, card.id) >=
    DECK_RULES.maxCopies
  ) {
    return cards;
  }

  if (
    getDraftZoneTotal(cards, targetZone) >=
    DECK_ZONE_LIMITS[targetZone]
  ) {
    return cards;
  }

  const index = cards.findIndex(
    (item) =>
      item.id === card.id &&
      item.zone === targetZone
  );

  if (index >= 0) {
    return cards.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );
  }

  return [
    ...cards,

    {
      id: card.id,
      quantity: 1,
      zone: targetZone,
      card,
    },
  ];
}

export function removeDraftCard(
  cards: DraftCard[],
  cardId: number,
  zone: DeckZone
): DraftCard[] {
  return cards.flatMap((card) => {
    if (
      card.id !== cardId ||
      card.zone !== zone
    ) {
      return card;
    }

    if (card.quantity > 1) {
      return {
        ...card,
        quantity: card.quantity - 1,
      };
    }

    return [];
  });
}

export function setDraftCardQuantity(
  cards: DraftCard[],
  cardId: number,
  zone: DeckZone,
  quantity: number
): DraftCard[] {
  const current = cards.find(
    (card) =>
      card.id === cardId &&
      card.zone === zone
  );

  if (!current) {
    return cards;
  }

  const copiesInOtherZones =
    getDraftCardCopies(cards, cardId) -
    current.quantity;

  const totalInOtherCards =
    getDraftZoneTotal(cards, zone) -
    current.quantity;

  const maxQuantity = Math.min(
    DECK_RULES.maxCopies -
      copiesInOtherZones,

    DECK_ZONE_LIMITS[zone] -
      totalInOtherCards,

    DECK_RULES.maxCopies
  );

  const nextQuantity = Math.max(
    0,
    Math.min(
      Math.floor(quantity),
      maxQuantity
    )
  );

  if (nextQuantity === current.quantity) {
    return cards;
  }

  if (nextQuantity === 0) {
    return cards.filter(
      (card) =>
        !(
          card.id === cardId &&
          card.zone === zone
        )
    );
  }

  return cards.map((card) =>
    card.id === cardId &&
    card.zone === zone
      ? {
          ...card,
          quantity: nextQuantity,
        }
      : card
  );
}

export function moveDraftCard(
  cards: DraftCard[],
  cardId: number,
  from: DeckZone,
  to: DeckZone
): DraftCard[] {
  if (from === to) {
    return cards;
  }

  const moving = cards.find(
    (card) =>
      card.id === cardId &&
      card.zone === from
  );

  if (!moving) {
    return cards;
  }

  const targetTotal =
    getDraftZoneTotal(cards, to);

  if (
    targetTotal + moving.quantity >
    DECK_ZONE_LIMITS[to]
  ) {
    return cards;
  }

  const withoutMoving = cards.filter(
    (card) =>
      !(
        card.id === cardId &&
        card.zone === from
      )
  );

  const target = withoutMoving.find(
    (card) =>
      card.id === cardId &&
      card.zone === to
  );

  if (target) {
    return withoutMoving.map((card) =>
      card.id === cardId &&
      card.zone === to
        ? {
            ...card,

            quantity:
              card.quantity +
              moving.quantity,
          }
        : card
    );
  }

  if (getDraftCardCopies(cards, cardId) > DECK_RULES.maxCopies) {
    return cards;
  }

  return [
    ...withoutMoving,

    {
      ...moving,
      zone: to,
    },
  ];
}

export function clearDraftCards(): DraftCard[] {
  return [];
}

export function validateDraft(
  cards: DraftCard[],
  format: DuelFormat = "speed"
): DraftValidation {
  const stats = getDraftStats(cards);

  const issues: DraftIssue[] = [];

  const copiesByCard = new Map<
    number,
    number
  >();

  for (const card of cards) {
    copiesByCard.set(
      card.id,
      (copiesByCard.get(card.id) ?? 0) +
        card.quantity
    );
  }

  for (const [
    cardId,
    copies,
  ] of copiesByCard) {
    if (copies > DECK_RULES.maxCopies) {
      issues.push({
        path: "cards",

        message: `No puedes usar más de ${DECK_RULES.maxCopies} copias de la carta #${cardId}`,
      });
    }
  }

  if (stats.main > DECK_RULES.mainMax) {
    issues.push({
      path: "main",

      message: `El Main Deck no puede superar ${DECK_RULES.mainMax} cartas`,
    });
  }

  if (format === "rush" && stats.extra > 0) {
    issues.push({
      path: "extra",

      message:
        "Rush Duel no utiliza Extra Deck: mueve esas cartas al Main Deck",
    });
  } else if (stats.extra > DECK_RULES.extraMax) {
    issues.push({
      path: "extra",

      message: `El Extra Deck no puede superar ${DECK_RULES.extraMax} cartas`,
    });
  }

  const publishIssues = [...issues];

  if (stats.main < DECK_RULES.mainMin) {
    publishIssues.push({
      path: "main",

      message: `Necesitas al menos ${DECK_RULES.mainMin} cartas en el Main Deck para publicar`,
    });
  }

  return {
    issues,

    publishIssues,

    canSave: issues.length === 0,

    canPublish:
      issues.length === 0 &&
      stats.main >= DECK_RULES.mainMin,
  };
}
