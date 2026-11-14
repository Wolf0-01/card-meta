-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('UPDATES', 'EVENTS', 'BOXES', 'BANLIST');

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "coverUrl" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'Speed Duel',
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL,
    "standings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_slug_key" ON "NewsArticle"("slug");

-- CreateIndex
CREATE INDEX "NewsArticle_category_idx" ON "NewsArticle"("category");

-- CreateIndex
CREATE INDEX "NewsArticle_createdAt_idx" ON "NewsArticle"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_slug_key" ON "Tournament"("slug");

-- CreateIndex
CREATE INDEX "Tournament_date_idx" ON "Tournament"("date");

-- CreateIndex
CREATE INDEX "Tournament_organizer_idx" ON "Tournament"("organizer");
