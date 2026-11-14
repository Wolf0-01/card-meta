import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CardPreviewData } from "@/types/CardPreviewData";
import type { DeckZone } from "@/types/deck";
import type { DraftCard } from "@/types/deck-draft";

import { validateDraft } from "./draft";
import { DeckError } from "./errors";
import { DECK_RULES } from "./rules";
import {
  deckZoneSchema,
  validateDeckCards,
  type NormalizedDeckCard,
} from "./validation";

function draftCards(
  zone: DeckZone,
  count: number,
  startId = 1
): DraftCard[] {
  return Array.from({ length: count }, (_, index) => ({
    id: startId + index,
    quantity: 1,
    zone,
    card: {
      id: startId + index,
    } as unknown as CardPreviewData,
  }));
}

function normalizedCards(
  zone: DeckZone,
  count: number,
  startId = 1
): NormalizedDeckCard[] {
  return Array.from({ length: count }, (_, index) => ({
    cardId: startId + index,
    quantity: 1,
    zone,
  }));
}

function expectDeckError(
  action: () => void,
  expectedText: string
) {
  assert.throws(action, (error) => {
    if (!(error instanceof DeckError)) {
      return false;
    }

    return error.issues.some((issue) =>
      issue.message.includes(expectedText)
    );
  });
}

describe("DECK_RULES (Duel Links)", () => {
  it("usa los límites de Duel Links", () => {
    assert.deepEqual(DECK_RULES, {
      mainMin: 20,
      mainMax: 30,
      extraMax: 9,
      maxCopies: 3,
    });
  });

  it("no acepta la zona side (retirada de Duel Links)", () => {
    assert.equal(
      deckZoneSchema.safeParse("side")
        .success,
      false
    );

    assert.equal(
      deckZoneSchema.safeParse("main")
        .success,
      true
    );
  });
});

describe("validateDraft", () => {
  it("permite guardar un borrador con 19 cartas pero no publicarlo", () => {
    const result = validateDraft(
      draftCards("main", 19)
    );

    assert.equal(result.canSave, true);
    assert.equal(result.canPublish, false);
    assert.ok(
      result.publishIssues.some((issue) =>
        issue.message.includes("20")
      )
    );
  });

  it("permite publicar con 20 cartas en el Main Deck", () => {
    const result = validateDraft(
      draftCards("main", 20)
    );

    assert.equal(result.canSave, true);
    assert.equal(result.canPublish, true);
    assert.equal(result.issues.length, 0);
  });

  it("rechaza más de 30 cartas en el Main Deck", () => {
    const result = validateDraft(
      draftCards("main", 31)
    );

    assert.equal(result.canSave, false);
    assert.equal(result.canPublish, false);
    assert.ok(
      result.issues.some((issue) =>
        issue.message.includes("30")
      )
    );
  });

  it("acepta 9 cartas en el Extra Deck y rechaza 10", () => {
    assert.equal(
      validateDraft(draftCards("extra", 9))
        .canSave,
      true
    );

    const result = validateDraft(
      draftCards("extra", 10)
    );

    assert.equal(result.canSave, false);
    assert.ok(
      result.issues.some((issue) =>
        issue.message.includes("9")
      )
    );
  });

  it("cuenta las copias entre zonas", () => {
    const cards: DraftCard[] = [
      ...draftCards("main", 1, 900).map((card) => ({
        ...card,
        quantity: 3,
      })),
      ...draftCards("extra", 1, 900),
    ];

    const result = validateDraft(cards);

    assert.equal(result.canSave, false);
    assert.ok(
      result.issues.some((issue) =>
        issue.message.includes("3")
      )
    );
  });
});

describe("validateDeckCards", () => {
  it("acepta un mazo público de 20 Main y 9 Extra", () => {
    const cards = [
      ...normalizedCards("main", 20),
      ...normalizedCards("extra", 9, 1000),
    ];

    const counts = validateDeckCards(
      cards,
      true
    );

    assert.deepEqual(counts, {
      main: 20,
      extra: 9,
      total: 29,
    });
  });

  it("permite borradores privados incompletos", () => {
    const counts = validateDeckCards(
      normalizedCards("main", 19),
      false
    );

    assert.equal(counts.main, 19);
  });

  it("exige 20 cartas en el Main para publicar", () => {
    expectDeckError(
      () =>
        validateDeckCards(
          normalizedCards("main", 19),
          true
        ),
      "at least 20"
    );
  });

  it("rechaza 31 cartas en el Main Deck", () => {
    expectDeckError(
      () =>
        validateDeckCards(
          normalizedCards("main", 31),
          false
        ),
      "30"
    );
  });

  it("rechaza 10 cartas en el Extra Deck", () => {
    expectDeckError(
      () =>
        validateDeckCards(
          normalizedCards("extra", 10),
          false
        ),
      "9"
    );
  });

  it("rechaza más de 3 copias entre zonas", () => {
    const cards: NormalizedDeckCard[] = [
      {
        cardId: 900,
        quantity: 3,
        zone: "main",
      },
      {
        cardId: 900,
        quantity: 1,
        zone: "extra",
      },
    ];

    expectDeckError(
      () => validateDeckCards(cards, false),
      "3 copies"
    );
  });
});
