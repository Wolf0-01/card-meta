-- Artes alternativos oficiales de las cartas.
-- La imagen base sigue viviendo en "Card"."image".
CREATE TABLE "CardAltArt" (
  "id" TEXT NOT NULL,
  "cardId" INTEGER NOT NULL,
  "dlmId" TEXT NOT NULL,
  "konamiId" TEXT,
  "image" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CardAltArt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CardAltArt_dlmId_key" ON "CardAltArt"("dlmId");

CREATE INDEX "CardAltArt_cardId_idx" ON "CardAltArt"("cardId");

ALTER TABLE "CardAltArt"
  ADD CONSTRAINT "CardAltArt_cardId_fkey"
  FOREIGN KEY ("cardId") REFERENCES "Card"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
