-- Logros competitivos del mazo (KoG, KC Cup y torneos).
ALTER TABLE "Deck"
  ADD COLUMN "achievement" TEXT NOT NULL DEFAULT 'NONE',
  ADD COLUMN "placement" TEXT,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "proofUrl" TEXT,
  ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Deck_achievement_idx" ON "Deck"("achievement");
