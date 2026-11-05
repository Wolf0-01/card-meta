/*
  Warnings:

  - A unique constraint covering the columns `[deckHash]` on the table `Deck` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deckHash` to the `Deck` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "deckHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Deck_deckHash_key" ON "Deck"("deckHash");

-- CreateIndex
CREATE INDEX "Deck_deckHash_idx" ON "Deck"("deckHash");
