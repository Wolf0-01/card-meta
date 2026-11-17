import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getAchievementEmblem,
  getAchievementLabel,
  isCompetitiveAchievement,
  normalizeAchievement,
  normalizePlacement,
  resolveResultVerification,
  sanitizeResultFields,
  type DeckResultFields,
} from "./achievements";

function result(
  overrides: Partial<DeckResultFields> = {}
): DeckResultFields {
  return {
    achievement: "KOG",

    placement: null,

    notes: null,

    proofUrl: null,

    ...overrides,
  };
}

describe("normalizeAchievement", () => {
  it("accepts the canonical values", () => {
    assert.equal(normalizeAchievement("KOG"), "KOG");

    assert.equal(
      normalizeAchievement("KC_MAX"),
      "KC_MAX"
    );

    assert.equal(
      normalizeAchievement("TOURNAMENT"),
      "TOURNAMENT"
    );
  });

  it("normalizes aliases and casing", () => {
    assert.equal(normalizeAchievement("kog"), "KOG");

    assert.equal(
      normalizeAchievement("King of Games"),
      "KOG"
    );

    assert.equal(
      normalizeAchievement("kc-cup"),
      "KC_MAX"
    );

    assert.equal(
      normalizeAchievement("KC_MAX"),
      "KC_MAX"
    );
  });

  it("falls back to NONE for unknown values", () => {
    assert.equal(normalizeAchievement(null), "NONE");

    assert.equal(
      normalizeAchievement("something-else"),
      "NONE"
    );

    assert.equal(normalizeAchievement(""), "NONE");
  });
});

describe("normalizePlacement", () => {
  it("normalizes tournament placements", () => {
    assert.equal(normalizePlacement("1st"), "1st");

    assert.equal(normalizePlacement("1ST"), "1st");

    assert.equal(normalizePlacement("2nd"), "2nd");

    assert.equal(normalizePlacement("top 4"), "Top 4");

    assert.equal(normalizePlacement("Top 8"), "Top 8");
  });

  it("returns null for unknown placements", () => {
    assert.equal(normalizePlacement("3rd"), null);

    assert.equal(normalizePlacement(""), null);

    assert.equal(normalizePlacement(null), null);
  });
});

describe("achievement metadata", () => {
  it("identifies competitive achievements", () => {
    assert.equal(isCompetitiveAchievement("KOG"), true);

    assert.equal(
      isCompetitiveAchievement("NONE"),
      false
    );
  });

  it("returns labels and emblems", () => {
    assert.equal(
      getAchievementLabel("KOG"),
      "King of Games"
    );

    assert.equal(
      getAchievementEmblem("KC_MAX")?.tone,
      "blue"
    );

    assert.equal(
      getAchievementEmblem("TOURNAMENT")?.tone,
      "violet"
    );

    assert.equal(getAchievementEmblem("NONE"), null);
  });
});

describe("sanitizeResultFields", () => {
  it("clears the placement for non-tournament results", () => {
    const sanitized = sanitizeResultFields(
      result({
        achievement: "KOG",

        placement: "1st",
      })
    );

    assert.equal(sanitized.achievement, "KOG");

    assert.equal(sanitized.placement, null);
  });

  it("keeps and normalizes a tournament placement", () => {
    const sanitized = sanitizeResultFields({
      achievement: "TOURNAMENT",

      placement: "top 4",

      notes: null,

      proofUrl: null,
    });

    assert.equal(sanitized.placement, "Top 4");
  });

  it("trims empty notes and proof URLs to null", () => {
    const sanitized = sanitizeResultFields(
      result({
        notes: "   ",

        proofUrl: "  ",
      })
    );

    assert.equal(sanitized.notes, null);

    assert.equal(sanitized.proofUrl, null);
  });
});

describe("resolveResultVerification", () => {
  it("never verifies a standard deck", () => {
    assert.equal(
      resolveResultVerification(
        result({ achievement: "NONE" }),
        null,
        true
      ),
      false
    );
  });

  it("auto-approves staff submissions", () => {
    assert.equal(
      resolveResultVerification(
        result(),
        null,
        true
      ),
      true
    );
  });

  it("keeps user submissions pending", () => {
    assert.equal(
      resolveResultVerification(
        result(),
        null,
        false
      ),
      false
    );
  });

  it("preserves the previous state when the result is unchanged", () => {
    const previous = {
      ...result({
        notes: "KoG run",
      }),

      verified: true,
    };

    assert.equal(
      resolveResultVerification(
        result({ notes: "KoG run" }),
        previous,
        false
      ),
      true
    );
  });

  it("resets verification when a user changes the result", () => {
    const previous = {
      ...result(),

      verified: true,
    };

    assert.equal(
      resolveResultVerification(
        result({ notes: "Updated run" }),
        previous,
        false
      ),
      false
    );
  });

  it("re-approves when staff changes a pending result", () => {
    const previous = {
      ...result(),

      verified: false,
    };

    assert.equal(
      resolveResultVerification(
        result({ notes: "Staff edit" }),
        previous,
        true
      ),
      true
    );
  });
});
