/*
  El Side Deck no existe en Yu-Gi-Oh! Duel Links,
  por lo que se retira la zona del modelo de datos.

  - Se eliminan las cartas guardadas en la zona side.
  - Se recrea el enum DeckZone sin el valor 'side'
    (PostgreSQL no permite eliminar valores de un
    enum de forma directa).
*/
DELETE FROM "DeckCard"
WHERE "zone" = 'side';

CREATE TYPE "DeckZone_new" AS ENUM (
    'main',
    'extra'
);

ALTER TABLE "DeckCard"
ALTER COLUMN "zone" DROP DEFAULT;

ALTER TABLE "DeckCard"
ALTER COLUMN "zone"
TYPE "DeckZone_new"
USING ("zone"::text::"DeckZone_new");

ALTER TABLE "DeckCard"
ALTER COLUMN "zone"
SET DEFAULT 'main';

DROP TYPE "DeckZone";

ALTER TYPE "DeckZone_new"
RENAME TO "DeckZone";
