-- CreateEnum
CREATE TYPE "TierEntryFormat" AS ENUM ('SPEED', 'RUSH');

-- CreateEnum
CREATE TYPE "TierEntryTier" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'HIGH_POTENTIAL');

-- CreateTable
CREATE TABLE "TierEntry" (
    "id" TEXT NOT NULL,
    "format" "TierEntryFormat" NOT NULL DEFAULT 'SPEED',
    "tier" "TierEntryTier" NOT NULL DEFAULT 'TIER_1',
    "archetype" TEXT NOT NULL,
    "cardName" TEXT,
    "ygoproId" INTEGER,
    "powerScore" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TierEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TierEntry_format_idx" ON "TierEntry"("format");

-- CreateIndex
CREATE INDEX "TierEntry_tier_idx" ON "TierEntry"("tier");

-- CreateIndex
CREATE UNIQUE INDEX "TierEntry_format_archetype_key" ON "TierEntry"("format", "archetype");
