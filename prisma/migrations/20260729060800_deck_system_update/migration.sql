/*
  Warnings:

  - The `zone` column on the `DeckCard` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DeckZone" AS ENUM (
    'main',
    'extra',
    'side'
);

DROP INDEX IF EXISTS "DeckCard_deckId_cardId_key";

ALTER TABLE "DeckCard"
ALTER COLUMN "zone"
TYPE "DeckZone"
USING "zone"::"DeckZone";

ALTER TABLE "DeckCard"
ALTER COLUMN "zone"
SET DEFAULT 'main';

CREATE UNIQUE INDEX "DeckCard_deckId_cardId_zone_key"
ON "DeckCard" (
    "deckId",
    "cardId",
    "zone"
);
