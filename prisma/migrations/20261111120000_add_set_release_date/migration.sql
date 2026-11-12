-- Fecha oficial de lanzamiento de cada expansión, sincronizada
-- desde la API de Duel Links Meta.
ALTER TABLE "SetMeta"
ADD COLUMN "releasedAt" TIMESTAMP(3);

CREATE INDEX "SetMeta_releasedAt_idx"
ON "SetMeta"("releasedAt");
