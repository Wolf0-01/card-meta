-- CreateEnum
CREATE TYPE "DeckTrend" AS ENUM ('up', 'down', 'stable');

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tierOrder" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "tournamentResults" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trend" "DeckTrend" NOT NULL DEFAULT 'stable';

-- CreateIndex
CREATE INDEX "Deck_tier_idx" ON "Deck"("tier");

-- CreateIndex
CREATE INDEX "Deck_tierOrder_idx" ON "Deck"("tierOrder");

-- CreateIndex
CREATE INDEX "Deck_format_idx" ON "Deck"("format");

-- CreateIndex
CREATE INDEX "Deck_archetype_idx" ON "Deck"("archetype");
