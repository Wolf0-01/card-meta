/*
  Warnings:

  - You are about to drop the column `archetype` on the `Deck` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Deck_archetype_idx";

-- DropIndex
DROP INDEX "Deck_deckHash_idx";

-- DropIndex
DROP INDEX "Deck_format_idx";

-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "archetype",
ADD COLUMN     "archetypeId" TEXT;

-- CreateTable
CREATE TABLE "Archetype" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Archetype_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Archetype_slug_key" ON "Archetype"("slug");

-- CreateIndex
CREATE INDEX "Archetype_slug_idx" ON "Archetype"("slug");

-- CreateIndex
CREATE INDEX "Deck_archetypeId_idx" ON "Deck"("archetypeId");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_archetypeId_fkey" FOREIGN KEY ("archetypeId") REFERENCES "Archetype"("id") ON DELETE SET NULL ON UPDATE CASCADE;
