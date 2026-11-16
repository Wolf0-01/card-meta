import type { DuelFormat } from "@/lib/duelFormat";

import {
  BANLIST_GROUP_STATUSES,
  describeBanlistGroupLimit,
  getBanlistLabel,
  getBanlistMaxCopies,
  type BanlistStatus,
} from "@/lib/banlist";

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

/**
 * Suma las copias de todas las cartas que comparten un
 * mismo grupo de la banlist, sumando Main y Extra. En
 * Duel Links el cupo es global por grupo, no por carta.
 */
export function getDraftBanlistGroupTotal(
  cards: DraftCard[],
  status: BanlistStatus,
  exclude?: {
    cardId: number;
    zone: DeckZone;
  }
): number {
  return cards.reduce((total, card) => {
    if (card.card.banlistStatus !== status) {
      return total;
    }

    if (
      exclude &&
      card.id === exclude.cardId &&
      card.zone === exclude.zone
    ) {
      return total;
    }

    return total + card.quantity;
  }, 0);
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

function describeDraftZoneLimit(
  zone: DeckZone
): string {
  return zone === "extra"
    ? `The Extra Deck cannot exceed ${DECK_ZONE_LIMITS.extra} cards`
    : `The Main Deck cannot exceed ${DECK_ZONE_LIMITS.main} cards`;
}

function describeDraftCardLimit(
  card: CardPreviewData,
  maxCopies: number
): string {
  return `${card.name}: you cannot use more than ${maxCopies} ${
    maxCopies === 1 ? "copy" : "copies"
  } of the same card`;
}

/**
 * Explica por qué no se puede añadir una carta al
 * borrador. Devuelve `null` cuando la acción es válida.
 */
export function getDraftAddIssue(
  cards: DraftCard[],
  card: CardPreviewData,
  zone?: DeckZone,
  format: DuelFormat = "speed"
): string | null {
  const targetZone =
    format === "rush"
      ? "main"
      : zone ?? getDefaultDraftZone(card, format);

  const status = card.banlistStatus ?? null;

  const maxCopies = getBanlistMaxCopies(status);

  if (maxCopies === 0) {
    return `${card.name} is Forbidden in Duel Links decks`;
  }

  if (status) {
    const groupTotal =
      getDraftBanlistGroupTotal(cards, status);

    if (groupTotal + 1 > maxCopies) {
      return `${card.name}: ${describeBanlistGroupLimit(
        status
      )}`;
    }
  }

  if (
    getDraftCardCopies(cards, card.id) >=
    maxCopies
  ) {
    return describeDraftCardLimit(
      card,
      maxCopies
    );
  }

  if (
    getDraftZoneTotal(cards, targetZone) >=
    DECK_ZONE_LIMITS[targetZone]
  ) {
    return describeDraftZoneLimit(targetZone);
  }

  return null;
}

/**
 * Explica por qué no se puede subir la cantidad de una
 * carta ya presente en el borrador. Devuelve `null`
 * cuando la cantidad solicitada es válida (o menor).
 */
export function getDraftQuantityIssue(
  cards: DraftCard[],
  cardId: number,
  zone: DeckZone,
  quantity: number
): string | null {
  const current = cards.find(
    (card) =>
      card.id === cardId &&
      card.zone === zone
  );

  if (!current) {
    return null;
  }

  const requested = Math.floor(quantity);

  if (requested <= current.quantity) {
    return null;
  }

  const status =
    current.card.banlistStatus ?? null;

  const maxCopies = getBanlistMaxCopies(status);

  const copiesInOtherZones =
    getDraftCardCopies(cards, cardId) -
    current.quantity;

  if (requested + copiesInOtherZones > maxCopies) {
    return describeDraftCardLimit(
      current.card,
      maxCopies
    );
  }

  if (status) {
    const groupInOtherCards =
      getDraftBanlistGroupTotal(
        cards,
        status,
        {
          cardId,
          zone,
        }
      );

    if (requested + groupInOtherCards > maxCopies) {
      return `${current.card.name}: ${describeBanlistGroupLimit(
        status
      )}`;
    }
  }

  const totalInOtherCards =
    getDraftZoneTotal(cards, zone) -
    current.quantity;

  if (
    requested + totalInOtherCards >
    DECK_ZONE_LIMITS[zone]
  ) {
    return describeDraftZoneLimit(zone);
  }

  return null;
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

  if (getDraftAddIssue(cards, card, zone, format)) {
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

  const status =
    current.card.banlistStatus ?? null;

  const maxCopies = getBanlistMaxCopies(status);

  const groupInOtherCards = status
    ? getDraftBanlistGroupTotal(
        cards,
        status,
        {
          cardId,
          zone,
        }
      )
    : 0;

  const maxQuantity = Math.max(
    0,
    Math.min(
      maxCopies - copiesInOtherZones,
      maxCopies - groupInOtherCards,
      DECK_ZONE_LIMITS[zone] -
        totalInOtherCards
    )
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

  const statusByCard = new Map<
    number,
    BanlistStatus | null
  >();

  const statusesWithCardIssue = new Set<
    BanlistStatus
  >();

  for (const card of cards) {
    copiesByCard.set(
      card.id,
      (copiesByCard.get(card.id) ?? 0) +
        card.quantity
    );

    if (!statusByCard.has(card.id)) {
      statusByCard.set(
        card.id,
        card.card.banlistStatus ?? null
      );
    }
  }

  for (const [
    cardId,
    copies,
  ] of copiesByCard) {
    const status =
      statusByCard.get(cardId) ?? null;

    const maxCopies =
      getBanlistMaxCopies(status);

    if (maxCopies === 0) {
      issues.push({
        path: "cards",

        message: `The card #${cardId} is Forbidden in Duel Links`,
      });

      if (status) {
        statusesWithCardIssue.add(status);
      }

      continue;
    }

    if (copies > maxCopies) {
      issues.push({
        path: "cards",

        message: status
          ? `You cannot use more than ${maxCopies} ${
              maxCopies === 1
                ? "copy"
                : "copies"
            } of card #${cardId} (${getBanlistLabel(
              status
            )})`
          : `You cannot use more than ${maxCopies} copies of card #${cardId}`,
      });

      if (status) {
        statusesWithCardIssue.add(status);
      }
    }
  }

  /*
   * Duel Links comparte el cupo entre todas las cartas de
   * un mismo grupo de la banlist (Main + Extra). Solo se
   * avisa del grupo cuando ninguna carta concreta lo
   * explica ya, para no duplicar mensajes.
   */
  for (const status of BANLIST_GROUP_STATUSES) {
    if (
      status === "forbidden" ||
      statusesWithCardIssue.has(status)
    ) {
      continue;
    }

    const groupTotal =
      getDraftBanlistGroupTotal(cards, status);

    const maxCopies =
      getBanlistMaxCopies(status);

    if (groupTotal > maxCopies) {
      issues.push({
        path: "cards",

        message: `${describeBanlistGroupLimit(
          status
        )} (current: ${groupTotal})`,
      });
    }
  }

  if (stats.main > DECK_RULES.mainMax) {
    issues.push({
      path: "main",

      message: `The Main Deck cannot exceed ${DECK_RULES.mainMax} cards`,
    });
  }

  if (format === "rush" && stats.extra > 0) {
    issues.push({
      path: "extra",

      message:
        "Rush Duel does not use an Extra Deck: move those cards to the Main Deck",
    });
  } else if (stats.extra > DECK_RULES.extraMax) {
    issues.push({
      path: "extra",

      message: `The Extra Deck cannot exceed ${DECK_RULES.extraMax} cards`,
    });
  }

  const publishIssues = [...issues];

  if (stats.main < DECK_RULES.mainMin) {
    publishIssues.push({
      path: "main",

      message: `You need at least ${DECK_RULES.mainMin} cards in the Main Deck to publish`,
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
