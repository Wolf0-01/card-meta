-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "ygoproId" INTEGER,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "attribute" TEXT,
    "level" INTEGER,
    "attack" INTEGER,
    "defense" INTEGER,
    "rarity" TEXT,
    "image" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_ygoproId_key" ON "Card"("ygoproId");
