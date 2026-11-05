/*
  Warnings:

  - A unique constraint covering the columns `[identifier]` on the table `Deck` will be added. If there are existing duplicate values, this will fail.
  - The required column `identifier` was added to the `Deck` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Deck_slug_key";

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "identifier" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DeckCard" ALTER COLUMN "zone" SET DEFAULT 'main';

-- CreateIndex
CREATE UNIQUE INDEX "Deck_identifier_key" ON "Deck"("identifier");

-- CreateIndex
CREATE INDEX "Deck_slug_idx" ON "Deck"("slug");
