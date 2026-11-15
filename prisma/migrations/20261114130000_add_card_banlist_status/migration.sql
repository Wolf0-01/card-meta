-- Estado de la banlist de Duel Links para cada carta.
-- Valores normalizados: forbidden | limited1 | limited2 | limited3.
ALTER TABLE "Card"
  ADD COLUMN "banlistStatus" TEXT;

CREATE INDEX "Card_banlistStatus_idx" ON "Card"("banlistStatus");
