import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CardPreviewData } from "@/types/CardPreviewData";
import type { DeckZone } from "@/types/deck";
import type { DraftCard } from "@/types/deck-draft";

import {
  getBanlistMaxCopies,
  normalizeBanlistStatus,
  type BanlistStatus,
} from "@/lib/banlist";

import {
  addDraftCard,
  getDraftAddIssue,
  validateDraft,
} from "./draft";
import { DeckError } from "./errors";
import { sortDeckCards } from "./rarityOrder";
import { suggestArchetypeName } from "./archetypeSuggestion";
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

function previewCard(
  id: number,
  banlistStatus?: BanlistStatus | null
): CardPreviewData {
  return {
    id,
    name: `Card ${id}`,
    banlistStatus,
  } as unknown as CardPreviewData;
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

describe("banlist (Duel Links)", () => {
  it("normaliza los estados que devuelve la API de DLM", () => {
    assert.equal(
      normalizeBanlistStatus("Forbidden"),
      "forbidden"
    );

    assert.equal(
      normalizeBanlistStatus("Limited 1"),
      "limited1"
    );

    assert.equal(
      normalizeBanlistStatus("Limited 2"),
      "limited2"
    );

    assert.equal(
      normalizeBanlistStatus("Limited 3"),
      "limited3"
    );

    assert.equal(
      normalizeBanlistStatus(null),
      null
    );
  });

  it("traduce el estado a un máximo de copias", () => {
    assert.equal(getBanlistMaxCopies(null), 3);
    assert.equal(getBanlistMaxCopies("forbidden"), 0);
    assert.equal(getBanlistMaxCopies("limited1"), 1);
    assert.equal(getBanlistMaxCopies("limited2"), 2);
    assert.equal(getBanlistMaxCopies("limited3"), 3);
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

  it("rechaza cartas Forbidden y Limited 1 en el borrador", () => {
    const forbidden = validateDraft([
      {
        id: 700,
        quantity: 1,
        zone: "main",
        card: {
          id: 700,
          banlistStatus: "forbidden",
        } as unknown as CardPreviewData,
      },
    ]);

    assert.equal(forbidden.canSave, false);
    assert.ok(
      forbidden.issues.some((issue) =>
        issue.message.includes("Forbidden")
      )
    );

    const limited = validateDraft([
      {
        id: 701,
        quantity: 2,
        zone: "main",
        card: {
          id: 701,
          banlistStatus: "limited1",
        } as unknown as CardPreviewData,
      },
    ]);

    assert.equal(limited.canSave, false);
    assert.ok(
      limited.issues.some((issue) =>
        issue.message.includes("Limited 1")
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

  it("rechaza una carta Forbidden en el mazo", () => {
    const cards: NormalizedDeckCard[] = [
      ...normalizedCards("main", 19),
      {
        cardId: 500,
        quantity: 1,
        zone: "main",
        banlistStatus: "forbidden",
      },
    ];

    expectDeckError(
      () => validateDeckCards(cards, false),
      "Forbidden"
    );
  });

  it("rechaza 2 copias de una carta Limited 1", () => {
    const cards: NormalizedDeckCard[] = [
      ...normalizedCards("main", 18),
      {
        cardId: 500,
        quantity: 2,
        zone: "main",
        banlistStatus: "limited1",
      },
    ];

    expectDeckError(
      () => validateDeckCards(cards, false),
      "Limited 1"
    );
  });

  it("permite 2 copias de una carta Limited 2", () => {
    const cards: NormalizedDeckCard[] = [
      ...normalizedCards("main", 18),
      {
        cardId: 500,
        quantity: 2,
        zone: "main",
        banlistStatus: "limited2",
      },
    ];

    const counts = validateDeckCards(
      cards,
      false
    );

    assert.equal(counts.main, 20);
  });
});

describe("banlist compartida por grupo", () => {
  it("suma las copias Limited 1 de Main y Extra", () => {
    const result = validateDraft([
      {
        id: 1,
        quantity: 1,
        zone: "main",
        card: previewCard(1, "limited1"),
      },
      {
        id: 2,
        quantity: 1,
        zone: "extra",
        card: previewCard(2, "limited1"),
      },
    ]);

    assert.equal(result.canSave, false);

    assert.ok(
      result.issues.some((issue) =>
        issue.message.includes(
          "only 1 card total from the Limited 1 list"
        )
      )
    );
  });

  it("permite completar el cupo Limited 2 y bloquea el exceso", () => {
    const allowed = validateDraft([
      {
        id: 1,
        quantity: 1,
        zone: "main",
        card: previewCard(1, "limited2"),
      },
      {
        id: 2,
        quantity: 1,
        zone: "extra",
        card: previewCard(2, "limited2"),
      },
    ]);

    assert.equal(allowed.canSave, true);

    const exceeded = validateDraft([
      {
        id: 1,
        quantity: 1,
        zone: "main",
        card: previewCard(1, "limited2"),
      },
      {
        id: 2,
        quantity: 1,
        zone: "extra",
        card: previewCard(2, "limited2"),
      },
      {
        id: 3,
        quantity: 1,
        zone: "main",
        card: previewCard(3, "limited2"),
      },
    ]);

    assert.equal(exceeded.canSave, false);

    assert.ok(
      exceeded.issues.some((issue) =>
        issue.message.includes(
          "only 2 cards total from the Limited 2 list"
        )
      )
    );
  });

  it("bloquea añadir Limited 1 cuando el cupo compartido está lleno", () => {
    const cards = addDraftCard(
      [],
      previewCard(1, "limited1"),
      "main"
    );

    assert.equal(cards.length, 1);

    const issue = getDraftAddIssue(
      cards,
      previewCard(2, "limited1"),
      "extra"
    );

    assert.ok(
      issue?.includes(
        "only 1 card total from the Limited 1 list"
      )
    );

    assert.deepEqual(
      addDraftCard(
        cards,
        previewCard(2, "limited1"),
        "extra"
      ),
      cards
    );
  });

  it("permite añadir dos Limited 2 distintas y bloquea la tercera", () => {
    const first = addDraftCard(
      [],
      previewCard(1, "limited2"),
      "main"
    );

    const second = addDraftCard(
      first,
      previewCard(2, "limited2"),
      "extra"
    );

    assert.equal(second.length, 2);

    const issue = getDraftAddIssue(
      second,
      previewCard(3, "limited2"),
      "main"
    );

    assert.ok(
      issue?.includes(
        "only 2 cards total from the Limited 2 list"
      )
    );
  });

  it("bloquea añadir una carta Forbidden", () => {
    const issue = getDraftAddIssue(
      [],
      previewCard(9, "forbidden"),
      "main"
    );

    assert.ok(issue?.includes("Forbidden"));

    assert.equal(
      addDraftCard(
        [],
        previewCard(9, "forbidden"),
        "main"
      ).length,
      0
    );
  });

  it("aplica el cupo compartido en el servidor", () => {
    expectDeckError(
      () =>
        validateDeckCards(
          [
            {
              cardId: 1,
              quantity: 1,
              zone: "main",
              banlistStatus: "limited1",
            },
            {
              cardId: 2,
              quantity: 1,
              zone: "extra",
              banlistStatus: "limited1",
            },
          ],
          false
        ),
      "only 1 card total from the Limited 1 list"
    );
  });
});

interface TestSortableCard {
  quantity: number;

  zone: DeckZone;

  card: {
    name: string;

    type: string;

    rarity: string | null;

    race: string | null;

    frameType: string | null;

    level: number | null;

    linkRating: number | null;
  };
}

function sortableCard(
  name: string,
  type: string,
  rarity: string | null,
  quantity = 1,
  options: {
    zone?: DeckZone;

    race?: string | null;

    frameType?: string | null;

    level?: number | null;

    linkRating?: number | null;
  } = {}
): TestSortableCard {
  return {
    quantity,
    zone: options.zone ?? "main",
    card: {
      name,
      type,
      rarity,
      race: options.race ?? null,
      frameType: options.frameType ?? null,
      level: options.level ?? null,
      linkRating: options.linkRating ?? null,
    },
  };
}

function sortedNames(
  cards: TestSortableCard[]
): string[] {
  return sortDeckCards(cards).map(
    (entry) => entry.card.name
  );
}

describe("sortDeckCards (Duel Links Meta)", () => {
  it("ordena el Main Deck Monsters → Spells → Traps", () => {
    const cards = [
      sortableCard(
        "Trap Normal",
        "Trap Card",
        "UR",
        1,
        { level: null }
      ),
      sortableCard(
        "Spell Normal",
        "Spell Card",
        "UR",
        1,
        { level: null }
      ),
      sortableCard(
        "Monster Level 4",
        "Normal Monster",
        "UR",
        1,
        { level: 4 }
      ),
      sortableCard(
        "Monster Level 8",
        "Effect Monster",
        "UR",
        1,
        { level: 8 }
      ),
    ];

    assert.deepEqual(sortedNames(cards), [
      "Monster Level 8",
      "Monster Level 4",
      "Spell Normal",
      "Trap Normal",
    ]);
  });

  it("ordena monstruos por nivel, rareza y nombre", () => {
    const cards = [
      sortableCard(
        "Alpha",
        "Effect Monster",
        "N",
        3,
        { level: 4 }
      ),
      sortableCard(
        "Bravo",
        "Effect Monster",
        "UR",
        1,
        { level: 4 }
      ),
      sortableCard(
        "Charlie",
        "Effect Monster",
        "UR",
        3,
        { level: 8 }
      ),
      sortableCard(
        "Delta",
        "Effect Monster",
        "SR",
        2,
        { level: 8 }
      ),
      sortableCard(
        "Echo",
        "Effect Monster",
        "SR",
        2,
        { level: 8 }
      ),
    ];

    assert.deepEqual(sortedNames(cards), [
      "Charlie",
      "Delta",
      "Echo",
      "Bravo",
      "Alpha",
    ]);
  });

  it("ordena mágicas y trampas por rareza y nombre", () => {
    const cards = [
      sortableCard(
        "Zeta Spell",
        "Spell Card",
        "N"
      ),
      sortableCard(
        "Eta Spell",
        "Spell Card",
        "UR"
      ),
      sortableCard(
        "Beta Trap",
        "Trap Card",
        "SR"
      ),
      sortableCard(
        "Alpha Trap",
        "Trap Card",
        "SR"
      ),
    ];

    assert.deepEqual(sortedNames(cards), [
      "Eta Spell",
      "Zeta Spell",
      "Alpha Trap",
      "Beta Trap",
    ]);
  });

  it("ordena el Extra Deck Fusion → Synchro → Xyz → Link y luego nivel/rareza", () => {
    const cards = [
      sortableCard(
        "Link 3",
        "Link Monster",
        "UR",
        1,
        {
          zone: "extra",
          frameType: "Link",
          linkRating: 3,
        }
      ),
      sortableCard(
        "Xyz 4",
        "Xyz Monster",
        "UR",
        1,
        { zone: "extra", frameType: "Xyz", level: 4 }
      ),
      sortableCard(
        "Synchro 8 SR",
        "Synchro Monster",
        "SR",
        1,
        {
          zone: "extra",
          frameType: "Synchro",
          level: 8,
        }
      ),
      sortableCard(
        "Synchro 8 UR",
        "Synchro Monster",
        "UR",
        1,
        {
          zone: "extra",
          frameType: "Synchro",
          level: 8,
        }
      ),
      sortableCard(
        "Fusion 4",
        "Fusion Monster",
        "UR",
        1,
        {
          zone: "extra",
          frameType: "Fusion",
          level: 4,
        }
      ),
    ];

    assert.deepEqual(sortedNames(cards), [
      "Fusion 4",
      "Synchro 8 UR",
      "Synchro 8 SR",
      "Xyz 4",
      "Link 3",
    ]);
  });
});

describe("suggestArchetypeName", () => {
  function archetypeCard(
    archetype: string,
    quantity: number,
    zone: DeckZone = "main"
  ) {
    return {
      quantity,
      zone,
      card: { archetype },
    };
  }

  it("prioriza el arquetipo mencionado en el t�tulo", () => {
    const cards = [
      archetypeCard("Centur-Ion", 4),
      archetypeCard("Stardust", 4),
      archetypeCard("Centur-Ion", 1, "extra"),
    ];

    assert.equal(
      suggestArchetypeName({
        name: "Stardust / Synchron",
        skill: "",
        cards,
      }),
      "Stardust"
    );
  });

  it("usa la Skill cuando el t�tulo no menciona el arquetipo", () => {
    const cards = [
      archetypeCard("Stardust", 2),
      archetypeCard("Centur-Ion", 3),
    ];

    assert.equal(
      suggestArchetypeName({
        name: "Synchro combo",
        skill: "Bonds of the Stardust",
        cards,
      }),
      "Stardust"
    );
  });

  it("pondera las copias del Main Deck antes que el Extra Deck", () => {
    const cards = [
      archetypeCard("Stardust", 2),
      archetypeCard("Centur-Ion", 1),
      archetypeCard("Centur-Ion", 3, "extra"),
    ];

    assert.equal(
      suggestArchetypeName({
        name: "Deck",
        skill: "",
        cards,
      }),
      "Stardust"
    );
  });
});
