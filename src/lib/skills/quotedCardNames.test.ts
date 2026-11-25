import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { extractQuotedCardNames } from "./quotedCardNames";

describe("extractQuotedCardNames", () => {
  it("extrae nombres entre comillas en orden", () => {
    const names = extractQuotedCardNames(
      'Send "Fallen of Albaz" to the GY, then add "Dark Magician" to your hand.'
    );

    assert.deepEqual(names, [
      "Fallen of Albaz",
      "Dark Magician",
    ]);
  });

  it("admite comillas tipográficas y elimina duplicados", () => {
    const names = extractQuotedCardNames(
      "Special Summon “Dark Magician”. Then return “dark magician” to the Deck."
    );

    assert.deepEqual(names, ["Dark Magician"]);
  });

  it("ignora textos sin nombres de cartas", () => {
    assert.deepEqual(
      extractQuotedCardNames(
        "Draw a card during your next Draw Phase."
      ),
      []
    );
  });
});
