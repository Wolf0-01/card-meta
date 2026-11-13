-- Formato del catálogo (Speed/Rush) y normalización del
-- formato de los mazos. Las filas existentes se migran a
-- "speed" para conservar el comportamiento anterior.
ALTER TABLE "Card"
ADD COLUMN "format" TEXT NOT NULL DEFAULT 'speed';

CREATE INDEX "Card_format_idx"
ON "Card"("format");

ALTER TABLE "Deck"
ALTER COLUMN "format" SET DEFAULT 'speed';

UPDATE "Deck"
SET "format" = 'speed'
WHERE "format" NOT IN ('speed', 'rush');
