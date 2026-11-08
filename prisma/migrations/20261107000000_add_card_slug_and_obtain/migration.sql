-- AlterTable
ALTER TABLE "Card" ADD COLUMN "slug" TEXT;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN "obtain" JSONB;

/*
 * Relleno inicial de slugs. Mantiene la capitalización
 * original y replica la normalización de
 * src/lib/cardSlug.ts (acentos, comillas y separadores).
 * El script populateCardSlugs.ts vuelve a verificar y
 * corrige cualquier colisión residual.
 */
WITH base AS (
  SELECT
    "id",
    NULLIF(
      trim(
        both '-'
        from regexp_replace(
          regexp_replace(
            translate(
              regexp_replace(
                "name",
                '["''`´‘’“”]',
                '',
                'g'
              ),
              'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
              'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
            ),
            '[^A-Za-z0-9]+',
            '-',
            'g'
          ),
          '-+',
          '-',
          'g'
        )
      ),
      ''
    ) AS base_slug
  FROM "Card"
),
ranked AS (
  SELECT
    "id",
    "base_slug",
    row_number() OVER (
      PARTITION BY "base_slug"
      ORDER BY "id"
    ) AS rn
  FROM base
)
UPDATE "Card" AS c
SET "slug" = CASE
  WHEN r.rn = 1 THEN r.base_slug
  ELSE r.base_slug || '-' || r.rn
END
FROM ranked AS r
WHERE c."id" = r."id";

UPDATE "Card"
SET "slug" = 'card-' || "id"
WHERE "slug" IS NULL OR "slug" = '';

-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Card_slug_key" ON "Card"("slug");
