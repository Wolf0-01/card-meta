-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "archetype" TEXT,
ADD COLUMN     "frameType" TEXT,
ADD COLUMN     "linkMarkers" JSONB,
ADD COLUMN     "linkRating" INTEGER,
ADD COLUMN     "race" TEXT,
ADD COLUMN     "scale" INTEGER;
